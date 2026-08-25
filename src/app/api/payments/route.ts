import { db } from "@/db";
import { payments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateReference } from "@/lib/codes";
import { getPlan, MOMO_NUMBER, MOMO_STEPS } from "@/lib/plans";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt));
  return Response.json({ payments: rows });
}

/**
 * Step 1 — create a MoMo payment reference.
 * The student then sends money to the merchant MTN number using this reference.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const plan = getPlan(String(body?.plan ?? ""));
  if (!plan || plan.price <= 0) {
    return Response.json({ error: "Choose a valid paid plan." }, { status: 400 });
  }

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      email: user.email,
      plan: plan.id,
      amount: plan.price * 100, // cents
      channel: "mtn_momo",
      momoNumber: String(body?.momoNumber ?? "").trim(),
      payerName: String(body?.payerName ?? "").trim(),
      reference: generateReference(),
      status: "pending",
    })
    .returning();

  return Response.json(
    {
      payment,
      merchantNumber: MOMO_NUMBER,
      steps: MOMO_STEPS,
      amount: plan.price,
    },
    { status: 201 },
  );
}

/**
 * Step 2 — the student submits the MoMo transaction ID from their SMS receipt.
 * This queues the payment for review; an admin approves it and the activation
 * code is issued. Codes are never handed out before a human confirms the money.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const reference = String(body?.reference ?? "").trim();
  const transactionId = String(body?.transactionId ?? "").trim().toUpperCase();
  const momoNumber = String(body?.momoNumber ?? "").trim();
  const payerName = String(body?.payerName ?? "").trim();

  if (transactionId.length < 6) {
    return Response.json(
      { error: "Enter the transaction ID from your MoMo confirmation SMS." },
      { status: 400 },
    );
  }
  if (!/^0\d{9}$/.test(momoNumber)) {
    return Response.json(
      { error: "Enter the 10-digit MoMo number you paid from." },
      { status: 400 },
    );
  }

  const rows = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  const payment = rows[0];
  if (!payment || payment.userId !== user.id) {
    return Response.json({ error: "Payment reference not found." }, { status: 404 });
  }
  if (payment.status === "success") {
    return Response.json({ payment, code: payment.activationCode });
  }

  const duplicate = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.momoTransactionId, transactionId))
    .limit(1);
  if (duplicate.length && duplicate[0].id !== payment.id) {
    return Response.json(
      { error: "That transaction ID has already been submitted." },
      { status: 409 },
    );
  }

  const [updated] = await db
    .update(payments)
    .set({ status: "submitted", momoTransactionId: transactionId, momoNumber, payerName })
    .where(eq(payments.id, payment.id))
    .returning();

  return Response.json({
    payment: updated,
    message:
      "Payment submitted for verification. Your activation code appears here once confirmed — usually within a few hours.",
  });
}

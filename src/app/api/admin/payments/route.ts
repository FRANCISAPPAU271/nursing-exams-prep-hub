import { db } from "@/db";
import { activationCodes, payments, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateActivationCode } from "@/lib/codes";
import { getPlan } from "@/lib/plans";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: payments.id,
      plan: payments.plan,
      amount: payments.amount,
      reference: payments.reference,
      status: payments.status,
      momoNumber: payments.momoNumber,
      payerName: payments.payerName,
      momoTransactionId: payments.momoTransactionId,
      activationCode: payments.activationCode,
      createdAt: payments.createdAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(payments)
    .leftJoin(users, eq(users.id, payments.userId))
    .orderBy(desc(payments.createdAt))
    .limit(100);
  return Response.json({ payments: rows });
}

/** Approve or reject a submitted MoMo payment. Approving issues the code. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const action = String(body?.action ?? "");
  const note = String(body?.note ?? "");

  const rows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  const payment = rows[0];
  if (!payment) return Response.json({ error: "Payment not found." }, { status: 404 });

  if (action === "reject") {
    const [updated] = await db
      .update(payments)
      .set({ status: "rejected", reviewNote: note || "Could not match this MoMo transaction.", reviewedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return Response.json({ payment: updated });
  }

  if (action !== "approve") {
    return Response.json({ error: "Unknown action." }, { status: 400 });
  }
  if (payment.status === "success" && payment.activationCode) {
    return Response.json({ payment, code: payment.activationCode });
  }

  const plan = getPlan(payment.plan);
  const code = generateActivationCode();
  await db.insert(activationCodes).values({
    code,
    plan: payment.plan,
    months: plan?.months ?? 1,
    paymentId: payment.id,
  });
  const [updated] = await db
    .update(payments)
    .set({ status: "success", activationCode: code, reviewNote: note, reviewedAt: new Date() })
    .where(eq(payments.id, id))
    .returning();

  return Response.json({ payment: updated, code });
}

import { db } from "@/db";
import { payouts, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: payouts.id,
      userId: payouts.userId,
      amount: payouts.amount,
      method: payouts.method,
      destination: payouts.destination,
      status: payouts.status,
      note: payouts.note,
      reviewedAt: payouts.reviewedAt,
      createdAt: payouts.createdAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(payouts)
    .leftJoin(users, eq(users.id, payouts.userId))
    .orderBy(desc(payouts.createdAt))
    .limit(100);
  return Response.json({ payouts: rows });
}

/**
 * Mark a referral withdrawal as paid (you sent the MoMo) or reject it
 * (refunds the student's wallet so they can try again).
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const action = String(body?.action ?? "");
  const note = String(body?.note ?? "").trim();

  const rows = await db.select().from(payouts).where(eq(payouts.id, id)).limit(1);
  const payout = rows[0];
  if (!payout) return Response.json({ error: "Payout not found." }, { status: 404 });
  if (payout.status !== "requested") {
    return Response.json({ error: "This payout has already been reviewed." }, { status: 409 });
  }

  if (action === "reject") {
    await db
      .update(users)
      .set({ walletBalance: sql`${users.walletBalance} + ${payout.amount}` })
      .where(eq(users.id, payout.userId));
    const [updated] = await db
      .update(payouts)
      .set({
        status: "rejected",
        note: note || "Rejected — amount returned to wallet.",
        reviewedAt: new Date(),
      })
      .where(eq(payouts.id, id))
      .returning();
    return Response.json({ payout: updated });
  }

  if (action !== "pay") {
    return Response.json({ error: "Unknown action." }, { status: 400 });
  }

  const [updated] = await db
    .update(payouts)
    .set({
      status: "paid",
      note: note || "Sent via MTN Mobile Money.",
      reviewedAt: new Date(),
    })
    .where(eq(payouts.id, id))
    .returning();
  return Response.json({ payout: updated });
}

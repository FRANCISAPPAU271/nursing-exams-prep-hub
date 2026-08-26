import { redirect } from "next/navigation";
import { db } from "@/db";
import { passwordResets, payments, payouts, users } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { desc, eq } from "drizzle-orm";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/dashboard");

  const paymentRows = await db
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

  const payoutRows = await db
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

  const resetRows = await db
    .select({
      id: passwordResets.id,
      code: passwordResets.code,
      status: passwordResets.status,
      expiresAt: passwordResets.expiresAt,
      createdAt: passwordResets.createdAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(passwordResets)
    .leftJoin(users, eq(users.id, passwordResets.userId))
    .orderBy(desc(passwordResets.createdAt))
    .limit(50);

  return (
    <AdminClient
      initialResets={resetRows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        expiresAt: r.expiresAt.toISOString(),
      }))}
      initialPayments={paymentRows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      initialPayouts={payoutRows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      }))}
    />
  );
}

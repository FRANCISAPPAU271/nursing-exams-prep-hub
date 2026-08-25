import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt));

  return (
    <BillingClient
      plan={user.plan}
      planExpiresAt={user.planExpiresAt}
      isPremium={user.isPremium}
      initialPayments={rows.map((p) => ({
        id: p.id,
        plan: p.plan,
        amount: p.amount,
        reference: p.reference,
        status: p.status,
        momoTransactionId: p.momoTransactionId,
        reviewNote: p.reviewNote,
        activationCode: p.activationCode,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}

import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { payouts, referrals } from "@/db/schema";
import { ensureReferralCode } from "@/lib/referral-server";
import { desc, eq } from "drizzle-orm";
import ReferClient from "./ReferClient";

export const dynamic = "force-dynamic";

export default async function ReferPage() {
  const user = await requireUser();
  const code = await ensureReferralCode(user.id, user.name, user.referralCode);

  const refRows = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, user.id))
    .orderBy(desc(referrals.createdAt));
  const payoutRows = await db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, user.id))
    .orderBy(desc(payouts.createdAt));

  return (
    <ReferClient
      name={user.name}
      code={code}
      balance={user.walletBalance}
      referrals={refRows.map((r) => ({
        id: r.id,
        refereeName: r.refereeName,
        refereeEmail: r.refereeEmail,
        status: r.status,
        rewardAmount: r.rewardAmount,
        plan: r.plan,
        createdAt: r.createdAt.toISOString(),
      }))}
      payouts={payoutRows.map((p) => ({
        id: p.id,
        amount: p.amount,
        destination: p.destination,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}

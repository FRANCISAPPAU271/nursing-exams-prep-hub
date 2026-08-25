import { db } from "@/db";
import { activationCodes, referrals, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { rewardFor } from "@/lib/referrals";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) return Response.json({ error: "Enter your activation code." }, { status: 400 });

  const rows = await db.select().from(activationCodes).where(eq(activationCodes.code, code)).limit(1);
  const record = rows[0];
  if (!record) return Response.json({ error: "That activation code is not valid." }, { status: 404 });
  if (record.usedByUserId) {
    return Response.json({ error: "That code has already been used." }, { status: 409 });
  }

  const expires = new Date(Date.now() + record.months * 30 * 86400000);
  await db
    .update(users)
    .set({ plan: record.plan, planExpiresAt: expires })
    .where(eq(users.id, user.id));
  await db
    .update(activationCodes)
    .set({ usedByUserId: user.id, usedAt: new Date() })
    .where(eq(activationCodes.id, record.id));

  // Credit the referrer, if this student joined through a referral link.
  let referralCredited = 0;
  const pending = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.refereeId, user.id), eq(referrals.status, "signed_up")))
    .limit(1);
  const link = pending[0];
  if (link) {
    const plan = getPlan(record.plan);
    const reward = rewardFor(plan?.price ?? 0);
    if (reward > 0) {
      await db
        .update(referrals)
        .set({
          status: "converted",
          rewardAmount: reward,
          plan: record.plan,
          convertedAt: new Date(),
        })
        .where(eq(referrals.id, link.id));
      await db
        .update(users)
        .set({ walletBalance: sql`${users.walletBalance} + ${reward}` })
        .where(eq(users.id, link.referrerId));
      referralCredited = reward;
    }
  }

  return Response.json({
    ok: true,
    plan: record.plan,
    expiresAt: expires.toISOString(),
    referralCredited,
  });
}

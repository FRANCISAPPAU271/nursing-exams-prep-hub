import { db } from "@/db";
import { payouts, referrals, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { MIN_PAYOUT } from "@/lib/referrals";
import { ensureReferralCode } from "@/lib/referral-server";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const code = await ensureReferralCode(user.id, user.name, user.referralCode);
  const rows = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, user.id))
    .orderBy(desc(referrals.createdAt));
  const history = await db
    .select()
    .from(payouts)
    .where(eq(payouts.userId, user.id))
    .orderBy(desc(payouts.createdAt));
  return Response.json({ code, referrals: rows, payouts: history, balance: user.walletBalance });
}

/** Request a payout of the rewards wallet to mobile money. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const destination = String(body?.destination ?? "").trim();
  const amount = Number(body?.amount ?? 0);

  if (!/^0\d{9}$/.test(destination)) {
    return Response.json({ error: "Enter a valid 10-digit mobile money number." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > user.walletBalance) {
    return Response.json({ error: "Amount exceeds your available balance." }, { status: 400 });
  }
  if (user.walletBalance < MIN_PAYOUT) {
    return Response.json(
      { error: `You need at least $${MIN_PAYOUT / 100} to withdraw.` },
      { status: 400 },
    );
  }

  const [payout] = await db
    .insert(payouts)
    .values({
      userId: user.id,
      amount,
      method: "mtn_momo",
      destination,
      status: "requested",
      note: "Referral rewards withdrawal",
    })
    .returning();

  await db
    .update(users)
    .set({ walletBalance: sql`${users.walletBalance} - ${amount}` })
    .where(eq(users.id, user.id));

  return Response.json({ payout }, { status: 201 });
}

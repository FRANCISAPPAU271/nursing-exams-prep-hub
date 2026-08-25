import { db } from "@/db";
import { users } from "@/db/schema";
import { buildReferralCode } from "@/lib/referrals";
import { eq } from "drizzle-orm";

/** Ensure legacy accounts always have a referral code. */
export async function ensureReferralCode(userId: number, name: string, current: string) {
  if (current) return current;
  const code = buildReferralCode(name);
  await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
  return code;
}

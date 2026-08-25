import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { buildReferralCode, REFEREE_BONUS_DAYS } from "@/lib/referrals";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const ref = String(body?.ref ?? "").trim().toUpperCase();

  if (!name || !email || password.length < 6) {
    return Response.json(
      { error: "Name, email and a 6+ character password are required." },
      { status: 400 },
    );
  }
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length) {
    return Response.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  let referrer: { id: number } | undefined;
  if (ref) {
    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, ref))
      .limit(1);
    referrer = found[0];
  }

  // Ensure a unique referral code for the new account.
  let code = buildReferralCode(name);
  for (let i = 0; i < 5; i++) {
    const clash = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, code));
    if (!clash.length) break;
    code = buildReferralCode(name);
  }

  const bonusExpiry = referrer
    ? new Date(Date.now() + REFEREE_BONUS_DAYS * 86400000)
    : null;

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      referralCode: code,
      referredByUserId: referrer?.id ?? null,
      plan: referrer ? "referral_bonus" : "free",
      planExpiresAt: bonusExpiry,
    })
    .returning({ id: users.id });

  if (referrer) {
    await db.insert(referrals).values({
      referrerId: referrer.id,
      refereeId: user.id,
      refereeName: name,
      refereeEmail: email,
      code: ref,
      status: "signed_up",
    });
  }

  await createSession(user.id);
  return Response.json({ ok: true, referralApplied: Boolean(referrer) });
}

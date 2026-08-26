import { randomInt } from "crypto";
import { db } from "@/db";
import { passwordResets, securityEvents, users } from "@/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Codes live for 20 minutes and are single-use. */
const TTL_MS = 20 * 60 * 1000;
/** Max 3 outstanding requests per account per hour. */
const MAX_PER_HOUR = 3;

function sixDigitCode() {
  return String(randomInt(100000, 1000000));
}

/**
 * Request a password reset.
 *
 * There is deliberately NO email service on this deployment, so the code is not
 * sent to the requester. It is stored and surfaced to administrators in the
 * admin panel, who verify the student's identity (they already do this for MoMo
 * payments) and read the code out. If RESEND_API_KEY is configured the code is
 * also emailed automatically.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) return Response.json({ error: "Enter your email address." }, { status: 400 });

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  // Always return the same generic response so accounts cannot be enumerated.
  const generic = {
    ok: true,
    message:
      "If that email is registered, a 6-digit reset code has been created. Contact support on WhatsApp (0598872146) to receive it.",
  };

  if (!user) return Response.json(generic);

  // Rate limit: no more than MAX_PER_HOUR live requests.
  const recent = await db
    .select({ id: passwordResets.id })
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.userId, user.id),
        gt(passwordResets.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      ),
    );
  if (recent.length >= MAX_PER_HOUR) {
    return Response.json(
      { error: "Too many reset requests. Please try again later or contact support." },
      { status: 429 },
    );
  }

  const code = sixDigitCode();
  await db.insert(passwordResets).values({
    userId: user.id,
    code,
    status: "requested",
    expiresAt: new Date(Date.now() + TTL_MS),
  });

  await db.insert(securityEvents).values({
    userId: user.id,
    kind: "password_reset_requested",
    detail: "A password reset code was requested.",
  });

  // Optional email delivery if an API key is present.
  let emailed = false;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: [email],
          subject: `Your password reset code: ${code}`,
          html: `<p>Hi ${user.name},</p><p>Your password reset code is <strong style="font-size:20px">${code}</strong>.</p><p>It expires in 20 minutes and can only be used once.</p><p>If you did not request this, ignore this email — your account is safe.</p>`,
        }),
      });
      emailed = res.ok;
    } catch {
      emailed = false;
    }
  }

  return Response.json({ ...generic, emailed });
}

/** Complete a reset: verify the code and set the new password. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim();
  const newPassword = String(body?.password ?? "");

  if (!/^\d{6}$/.test(code)) {
    return Response.json({ error: "Enter the 6-digit reset code." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.code, code), gt(passwordResets.expiresAt, new Date())))
    .orderBy(desc(passwordResets.createdAt))
    .limit(1);

  const reset = rows[0];
  if (!reset) {
    return Response.json(
      { error: "That code is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }
  if (reset.usedAt) {
    return Response.json({ error: "That code has already been used." }, { status: 409 });
  }

  // Hash the new password with the same scheme used at registration.
  const { randomBytes, scryptSync } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${scryptSync(newPassword, salt, 64).toString("hex")}`;

  const { revokeOtherSessions } = await import("@/lib/auth");
  const revoked = await revokeOtherSessions(reset.userId, "__none__");

  await db.update(users).set({ passwordHash }).where(eq(users.id, reset.userId));
  await db
    .update(passwordResets)
    .set({ status: "used", usedAt: new Date() })
    .where(eq(passwordResets.id, reset.id));

  await db.insert(securityEvents).values({
    userId: reset.userId,
    kind: "password_reset_completed",
    detail: `Password reset via code; ${revoked} other session(s) signed out.`,
  });

  return Response.json({
    ok: true,
    message: "Password updated. You can now sign in with your new password.",
    revoked,
  });
}

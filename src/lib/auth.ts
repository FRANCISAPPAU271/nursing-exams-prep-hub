import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { securityEvents, sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "nursing_session";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  if (candidate.length !== original.length) return false;
  return timingSafeEqual(candidate, original);
}

/** Human-readable device label from a user-agent string. */
export function describeDevice(ua: string) {
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /iPhone|iPad|iOS/i.test(ua)
      ? "iOS"
      : /Android/i.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Unknown device";
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\//i.test(ua)
      ? "Opera"
      : /Chrome\//i.test(ua)
        ? "Chrome"
        : /Safari\//i.test(ua)
          ? "Safari"
          : /Firefox\//i.test(ua)
            ? "Firefox"
            : "browser";
  return `${browser} on ${os}`;
}

/**
 * Creates a session and **revokes every other active session for the account**.
 * One password = one active device. If a second person signs in with shared
 * credentials, the first is signed out on their next request.
 */
export async function createSession(userId: number) {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "";

  // Evict any other live sessions for this user.
  const evicted = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
    .returning({ id: sessions.id, deviceLabel: sessions.deviceLabel });

  if (evicted.length) {
    await db.insert(securityEvents).values({
      userId,
      kind: "session_evicted",
      detail: `Signed out ${evicted.length} other device(s) after a new sign-in from ${describeDevice(ua)}.`,
      ip,
    });
  }

  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    userAgent: ua.slice(0, 400),
    ip,
    deviceLabel: describeDevice(ua),
    lastSeenAt: new Date(),
  });
  await db.insert(securityEvents).values({
    userId,
    kind: "login",
    detail: `Signed in from ${describeDevice(ua)}.`,
    ip,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { evictedCount: evicted.length };
}

export async function destroySession() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (id) {
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, id));
  }
  store.delete(SESSION_COOKIE);
}

/** Sign out every device except the current one. */
export async function revokeOtherSessions(userId: number, keepSessionId: string) {
  const rows = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        ne(sessions.id, keepSessionId),
      ),
    )
    .returning({ id: sessions.id });
  return rows.length;
}

export async function getCurrentUser() {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
      referralCode: users.referralCode,
      walletBalance: users.walletBalance,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  // Session was revoked because the account signed in elsewhere.
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;

  // Lightweight heartbeat (best-effort; never blocks the request path).
  db.update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, id))
    .catch(() => {});

  const active =
    row.plan !== "free" && (!row.planExpiresAt || row.planExpiresAt.getTime() > Date.now());

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    plan: active ? row.plan : "free",
    planExpiresAt: row.planExpiresAt ? row.planExpiresAt.toISOString() : null,
    isPremium: active,
    referralCode: row.referralCode ?? "",
    walletBalance: row.walletBalance,
    isAdmin: row.role === "admin",
    sessionId: id,
  };
}

/** Count of currently active sessions (should always be 1 under the policy). */
export async function activeSessionCount(userId: number) {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  return row?.c ?? 0;
}

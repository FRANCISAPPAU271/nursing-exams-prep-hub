import { db } from "@/db";
import { securityEvents, users } from "@/db/schema";
import { getCurrentUser, hashPassword, revokeOtherSessions, verifyPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const current = String(body?.current ?? "");
  const next = String(body?.next ?? "");
  if (next.length < 6) {
    return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }

  const rows = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!rows[0] || !verifyPassword(current, rows[0].passwordHash)) {
    return Response.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(users.id, user.id));
  const revoked = await revokeOtherSessions(user.id, user.sessionId);
  await db.insert(securityEvents).values({
    userId: user.id,
    kind: "login",
    detail: `Password changed; ${revoked} other device(s) signed out.`,
  });

  return Response.json({ ok: true, revoked });
}

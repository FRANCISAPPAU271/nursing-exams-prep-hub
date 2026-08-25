import { getCurrentUser, revokeOtherSessions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const revoked = await revokeOtherSessions(user.id, user.sessionId);
  return Response.json({ ok: true, revoked });
}

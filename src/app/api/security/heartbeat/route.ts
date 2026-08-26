import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Called by the client while the student is genuinely active.
 * Refreshes lastSeenAt so the server-enforced inactivity timeout does not
 * fire on someone who is reading, scrolling, or thinking through a question.
 */
export async function POST() {
  const user = await getCurrentUser();
  // getCurrentUser already refreshed lastSeenAt when it loaded the session.
  if (!user) return Response.json({ ok: false }, { status: 401 });
  void db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, user.sessionId));
  return Response.json({ ok: true });
}

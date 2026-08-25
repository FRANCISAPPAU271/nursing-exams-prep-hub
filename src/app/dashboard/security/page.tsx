import { db } from "@/db";
import { securityEvents, sessions } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { desc, eq } from "drizzle-orm";
import SecurityClient from "./SecurityClient";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await requireUser();

  const deviceRows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.lastSeenAt))
    .limit(20);

  const eventRows = await db
    .select()
    .from(securityEvents)
    .where(eq(securityEvents.userId, user.id))
    .orderBy(desc(securityEvents.createdAt))
    .limit(30);

  return (
    <SecurityClient
      currentSessionId={user.sessionId}
      devices={deviceRows.map((d) => ({
        id: d.id,
        deviceLabel: d.deviceLabel || "Unknown device",
        ip: d.ip,
        lastSeenAt: d.lastSeenAt.toISOString(),
        createdAt: d.createdAt.toISOString(),
        revoked: Boolean(d.revokedAt),
      }))}
      events={eventRows.map((e) => ({
        id: e.id,
        kind: e.kind,
        detail: e.detail,
        ip: e.ip,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}

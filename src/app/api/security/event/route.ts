import { db } from "@/db";
import { securityEvents } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "screenshot_attempt",
  "copy_attempt",
  "save_attempt",
  "devtools",
]);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  if (!ALLOWED.has(kind)) return Response.json({ ok: false }, { status: 400 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";

  await db.insert(securityEvents).values({
    userId: user.id,
    kind,
    detail: String(body?.detail ?? "").slice(0, 300),
    ip,
  });
  return Response.json({ ok: true });
}

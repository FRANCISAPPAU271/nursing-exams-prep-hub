import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db
    .select({
      id: passwordResets.id,
      code: passwordResets.code,
      status: passwordResets.status,
      expiresAt: passwordResets.expiresAt,
      createdAt: passwordResets.createdAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(passwordResets)
    .leftJoin(users, eq(users.id, passwordResets.userId))
    .orderBy(desc(passwordResets.createdAt))
    .limit(50);

  return Response.json({ resets: rows });
}

/** Admin marks a code as verified (identity checked) or cancels it. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const action = String(body?.action ?? "");
  const note = String(body?.note ?? "").trim();

  const rows = await db.select().from(passwordResets).where(eq(passwordResets.id, id)).limit(1);
  const reset = rows[0];
  if (!reset) return Response.json({ error: "Request not found." }, { status: 404 });

  if (action === "cancel") {
    await db
      .update(passwordResets)
      .set({ status: "cancelled", note: note || "Cancelled by administrator." })
      .where(eq(passwordResets.id, id));
    return Response.json({ ok: true });
  }

  if (action === "verify") {
    await db
      .update(passwordResets)
      .set({
        status: "approved",
        note: note || `Identity verified by ${user.email}. Code released to student.`,
      })
      .where(eq(passwordResets.id, id));
    return Response.json({ ok: true, code: reset.code });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}

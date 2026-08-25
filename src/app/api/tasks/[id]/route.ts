import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title;
  if (typeof b.notes === "string") patch.notes = b.notes;
  if (typeof b.category === "string") patch.category = b.category;
  if (typeof b.priority === "string") patch.priority = b.priority;
  if (typeof b.status === "string") {
    patch.status = b.status;
    patch.completed = b.status === "done";
  }
  if (typeof b.completed === "boolean") {
    patch.completed = b.completed;
    patch.status = b.completed ? "done" : "todo";
  }
  if (typeof b.targetQuestions === "number") patch.targetQuestions = b.targetQuestions;
  if (b.dueDate !== undefined) patch.dueDate = b.dueDate ? new Date(b.dueDate) : null;
  if (!Object.keys(patch).length) return Response.json({ error: "Nothing to update." }, { status: 400 });
  const [row] = await db
    .update(tasks)
    .set(patch)
    .where(and(eq(tasks.id, Number(id)), eq(tasks.userId, user.id)))
    .returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ task: row });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(tasks).where(and(eq(tasks.id, Number(id)), eq(tasks.userId, user.id)));
  return Response.json({ ok: true });
}

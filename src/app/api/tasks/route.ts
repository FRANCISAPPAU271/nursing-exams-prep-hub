import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(desc(tasks.createdAt));
  return Response.json({ tasks: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const title = String(b?.title ?? "").trim();
  if (!title) return Response.json({ error: "Title is required." }, { status: 400 });
  const [row] = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title,
      notes: String(b?.notes ?? ""),
      category: String(b?.category ?? "Fundamentals"),
      priority: String(b?.priority ?? "medium"),
      status: String(b?.status ?? "todo"),
      targetQuestions: Number(b?.targetQuestions ?? 25) || 25,
      dueDate: b?.dueDate ? new Date(b.dueDate) : null,
      completed: String(b?.status ?? "todo") === "done",
    })
    .returning();
  return Response.json({ task: row }, { status: 201 });
}

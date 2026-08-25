import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import TasksClient, { type Task } from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(desc(tasks.createdAt));

  const initial: Task[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    category: t.category,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    targetQuestions: t.targetQuestions,
    completed: t.completed,
  }));

  return <TasksClient initialTasks={initial} />;
}

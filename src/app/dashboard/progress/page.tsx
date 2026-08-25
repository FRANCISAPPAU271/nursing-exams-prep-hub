import { requireUser } from "@/lib/require-user";
import { db } from "@/db";
import { attempts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import ProgressClient from "./ProgressClient";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(attempts)
    .where(eq(attempts.userId, user.id))
    .orderBy(desc(attempts.createdAt));

  return (
    <ProgressClient
      initial={rows.map((r) => ({
        id: r.id,
        category: r.category,
        total: r.total,
        correct: r.correct,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}

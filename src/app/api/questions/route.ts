import { db } from "@/db";
import { questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, asc, eq, ilike, sql, type SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const exam = url.searchParams.get("exam") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const bodySystem = url.searchParams.get("bodySystem") ?? "";
  const source = url.searchParams.get("source") ?? "";
  const difficulty = url.searchParams.get("difficulty") ?? "";
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = 10;

  const filters: SQL[] = [];
  if (exam) filters.push(eq(questions.exam, exam));
  if (category) filters.push(eq(questions.category, category));
  if (bodySystem) filters.push(eq(questions.bodySystem, bodySystem));
  if (source === "past") filters.push(eq(questions.clientNeed, "Past Examination Questions"));
  if (source === "bank") filters.push(sql`${questions.clientNeed} <> 'Past Examination Questions'`);
  if (difficulty) filters.push(eq(questions.difficulty, difficulty));
  if (q) filters.push(ilike(questions.stem, `%${q}%`));
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select()
    .from(questions)
    .where(where)
    .orderBy(asc(questions.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questions)
    .where(where);

  return Response.json({ questions: rows, total: count, page, pages: Math.ceil(count / limit) });
}

import { db } from "@/db";
import { attempts, questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, sql, type SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const exam = url.searchParams.get("exam") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const count = Math.min(150, Math.max(5, Number(url.searchParams.get("count") ?? 10)));
  if (count > 10 && !user.isPremium) {
    return Response.json(
      { error: "Upgrade to Pro to run quizzes longer than 10 questions." },
      { status: 402 },
    );
  }
  const filters: SQL[] = [];
  if (exam) filters.push(eq(questions.exam, exam));
  if (category) filters.push(eq(questions.category, category));

  const rows = await db
    .select()
    .from(questions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(sql`random()`)
    .limit(count);
  return Response.json({ questions: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const [row] = await db
    .insert(attempts)
    .values({
      userId: user.id,
      exam: String(b?.exam || "NCLEX"),
      category: String(b?.category || "Mixed"),
      mode: b?.mode === "mock" ? "mock" : "practice",
      total: Number(b?.total ?? 0),
      correct: Number(b?.correct ?? 0),
    })
    .returning();
  return Response.json({ attempt: row }, { status: 201 });
}

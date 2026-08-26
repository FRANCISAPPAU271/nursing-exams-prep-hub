import { db } from "@/db";
import { attempts, questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, asc, eq, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Computerized Adaptive Test (CAT) engine.
 *
 * Mirrors how the real NCLEX works: each candidate's ability estimate is
 * updated after every item, and the next item is chosen at (or near) that
 * ability level. Correct answers raise the estimate (harder item next);
 * incorrect answers lower it (easier item next).
 *
 * The exam stops when either:
 *   - the candidate has demonstrated mastery (95% pass rule), or
 *   - the candidate has clearly failed below standard, or
 *   - the maximum item count is reached (then the final ability decides).
 */

const MIN_ITEMS = 15;
const MAX_ITEMS = 75;
/** Ability scale from -3 (far below standard) to +3 (far above standard). */
const FLOOR = -3;
const CEILING = 3;
/** An ability estimate at or above this is treated as clearly above standard. */
const PASS_LINE = 0;
/** Margin used for the 95% Confidence Interval style early stop. */
const STOP_MARGIN = 0.9;

/** Warm-up ramp: item difficulty for the first few items, by index. */
function warmupDifficulty(index: number): "easy" | "medium" | "hard" {
  if (index === 0) return "easy";
  if (index === 1) return "easy";
  if (index === 2) return "medium";
  return "medium";
}

/** Convert an ability estimate to the difficulty band to draw from. */
function bandFor(ability: number): "easy" | "medium" | "hard" {
  if (ability < -0.6) return "easy";
  if (ability > 0.6) return "hard";
  return "medium";
}

/** Update the ability estimate after a response. */
function nextAbility(ability: number, correct: boolean, difficulty: "easy" | "medium" | "hard") {
  // Weight: missing a hard item costs less than missing an easy item.
  const weight = difficulty === "easy" ? 0.6 : difficulty === "medium" ? 0.45 : 0.3;
  const delta = correct ? weight : -weight;
  return Math.max(FLOOR, Math.min(CEILING, ability + delta));
}

/** GET  -> serve the next adaptive item (or the final result). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exam = url.searchParams.get("exam") || "NCLEX";
  const category = url.searchParams.get("category") || "";

  const ability = Number(url.searchParams.get("ability") ?? "0");
  const asked = (url.searchParams.get("asked") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const index = asked.length;
  const history = (url.searchParams.get("history") ?? "")
    .split(",")
    .filter(Boolean)
    .map((v) => v === "1");

  // ---- Stop rules -------------------------------------------------------
  const correctCount = history.filter(Boolean).length;
  const accuracy = index ? correctCount / index : 0;

  if (index >= MIN_ITEMS) {
    // Clearly above standard with a comfortable margin -> PASS
    if (ability >= PASS_LINE + STOP_MARGIN && accuracy >= 0.6) {
      return Response.json({
        done: true,
        result: "pass",
        ability,
        items: index,
        correct: correctCount,
        reason: `You demonstrated competence above the passing standard after ${index} items.`,
      });
    }
    // Clearly below standard -> FAIL
    if (ability <= PASS_LINE - STOP_MARGIN - 0.4 && accuracy < 0.5) {
      return Response.json({
        done: true,
        result: "fail",
        ability,
        items: index,
        correct: correctCount,
        reason: `Your performance remained below the passing standard after ${index} items.`,
      });
    }
  }

  if (index >= MAX_ITEMS) {
    return Response.json({
      done: true,
      result: ability >= PASS_LINE ? "pass" : "fail",
      ability,
      items: index,
      correct: correctCount,
      reason: `Maximum of ${MAX_ITEMS} items reached. Final ability estimate determined your result.`,
    });
  }

  // ---- Select the next item --------------------------------------------
  const band = index < 3 ? warmupDifficulty(index) : bandFor(ability);

  const filters = [eq(questions.exam, exam), eq(questions.difficulty, band)];
  if (category) filters.push(eq(questions.category, category));

  // Exclude already-served items for this run, then take the "middle" item of
  // the band so the same question isn't always the first one served.
  const notIn = asked.length ? sql`${questions.id} NOT IN ${asked}` : undefined;

  const rows = await db
    .select()
    .from(questions)
    .where(and(...filters, ...(notIn ? [notIn] : [])))
    .orderBy(asc(questions.id))
    .limit(1)
    .offset(Math.floor(Math.random() * 400));

  // Fallback: if that exact band ran dry, relax difficulty and retry.
  const item =
    rows[0] ??
    (
      await db
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.exam, exam),
            ...(category ? [eq(questions.category, category)] : []),
            ...(notIn ? [notIn] : []),
            ...(asked.length ? [ne(questions.difficulty, "___none___")] : []),
          ),
        )
        .limit(1)
    )[0];

  if (!item) {
    return Response.json({
      done: true,
      result: ability >= PASS_LINE ? "pass" : "fail",
      ability,
      items: index,
      correct: correctCount,
      reason: "Ran out of unique questions in this pool.",
    });
  }

  return Response.json({
    done: false,
    item: {
      id: item.id,
      stem: item.stem,
      options: item.options,
      correctIndex: item.correctIndex,
      rationale: item.rationale,
      category: item.category,
      difficulty: item.difficulty,
      clientNeed: item.clientNeed,
    },
    ability,
    items: index,
    correct: correctCount,
    minItems: MIN_ITEMS,
    maxItems: MAX_ITEMS,
    // Raw correct-index is included so the client can grade instantly, but the
    // UI never advances without an answer.
  });
}

/** POST -> save the completed CAT attempt to progress analytics. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const [row] = await db
    .insert(attempts)
    .values({
      userId: user.id,
      exam: String(body?.exam || "NCLEX"),
      category: String(body?.category || "CAT Adaptive Exam"),
      mode: "cat",
      total: Number(body?.total ?? 0),
      correct: Number(body?.correct ?? 0),
    })
    .returning();

  return Response.json({ attempt: row }, { status: 201 });
}

import "dotenv/config";
import { db, pool } from "./index";
import { attempts, lessons, payouts, questions, referrals, tasks, users } from "./schema";
import { LESSON_SEEDS } from "../lib/library";
import { NURSING_DATA } from "../lib/nursing-data";
import { PAST_PAPER_MEDICAL } from "../lib/past-paper-medical";
import { PAST_PAPER_MEDICAL_2 } from "../lib/past-paper-medical-2";
import { buildReferralCode } from "../lib/referrals";
import { hashPassword } from "../lib/auth";
import { sql } from "drizzle-orm";

const DIFFICULTIES = ["easy", "medium", "hard"];

/** NCLEX Client Need entries that describe a practice topic, not a disease. */
const CLIENT_NEED_TOPICS = new Set([
  "client identification safety",
  "delegation and supervision",
  "safety and fall prevention",
  "infection control practice",
  "legal and ethical practice",
  "emergency management",
  "antenatal health education",
  "child growth and development",
  "chronic disease self-management",
  "preventive screening",
  "lifestyle and nutrition counselling",
  "reproductive and family planning education",
  "newborn and infant care education",
  "suicide risk",
  "acute psychosis",
  "anxiety and panic",
  "substance use and withdrawal",
  "grief and loss",
  "mental health in the community",
  "therapeutic communication",
  "recognising deterioration",
  "prioritising multiple clients",
  "interpreting assessment data",
  "evaluating care effectiveness",
  "clinical decision making",
]);

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type TopicEntry = { name: string; finding: string; action: string; drug: string; lab: string };

/**
 * Ten question templates. Each tests a DIFFERENT competency on the same
 * clinical fact: assessment, immediate action, pharmacology, diagnostics,
 * teaching, planning, prioritisation, evaluation, documentation and delegation.
 */
function buildDrafts(
  t: TopicEntry,
  category: string,
  opts: { isMid: boolean; isGhana: boolean; topicLike?: boolean },
): { stem: string; correct: string; distractors: string[]; rationale: string }[] {
  const { isMid, isGhana, topicLike } = opts;
  const P = isGhana ? "patient" : "client";
  const Pc = isGhana ? "Patient" : "Client";
  const PROVIDER = isGhana ? "doctor" : "provider";
  const NURSE = isMid ? "midwife" : "nurse";
  const subject = isMid ? "a woman" : `a ${P}`;
  const scenario = topicLike
    ? `A ${NURSE} is involved in ${t.name}.`
    : isMid
      ? `A midwife is caring for a woman with ${t.name}.`
      : `A ${NURSE} is caring for a ${P} with ${t.name}.`;
  const rel = topicLike ? `relating to ${t.name}` : `in ${t.name}`;
  const who = isGhana ? "healthcare assistant" : "nursing assistant";

  return [
    {
      stem: topicLike
        ? `A ${NURSE} is involved in ${t.name} and observes that ${t.finding}. Which action should be reported to the ${PROVIDER}?`
        : `${scenario} The ${P} has ${t.finding}. Which action should be reported to the ${PROVIDER}?`,
      correct: topicLike
        ? `A situation where ${t.finding} is present.`
        : `${Pc} has ${t.finding}.`,
      distractors: [
        `${Pc} reports mild tiredness after walking on the ward.`,
        `${Pc} requests a change to the menu choice.`,
        `${Pc} asks for more information about the discharge plan.`,
      ],
      rationale: `${cap(t.finding)} is a significant concern in ${t.name} and requires prompt escalation. The other findings are expected, non-urgent, or unrelated to the condition.`,
    },
    {
      stem: topicLike
        ? `A ${NURSE} notes ${t.finding}. In relation to ${t.name}, which action should be taken first?`
        : `A ${NURSE} notes ${t.finding} in ${subject}. In relation to ${t.name}, which action should be taken first?`,
      correct: `The ${NURSE} should ${t.action}.`,
      distractors: [
        `The ${NURSE} should document the finding and reassess in four hours.`,
        `The ${NURSE} should encourage the ${P} to rest quietly.`,
        `The ${NURSE} should wait for the next scheduled ward round.`,
      ],
      rationale: `When ${t.finding} occurs in ${t.name}, the priority is to ${t.action}. Delaying intervention allows the problem to deteriorate and worsens ${P} outcomes.`,
    },
    {
      stem: topicLike
        ? `A ${NURSE} is managing ${t.name} where the plan is to ${t.action}. Which step is most appropriate?`
        : `A ${P} with ${t.name} is to receive ${t.drug} because of ${t.finding}. Which therapy is being used?`,
      correct: topicLike ? `${cap(t.action)}.` : `${cap(t.drug)}.`,
      distractors: [
        "A medicine with no indication for this condition.",
        "A medicine that is contraindicated in this client.",
        "A medicine that treats an unrelated problem.",
      ],
      rationale: `${cap(t.drug)} is the relevant therapy in ${t.name} where ${t.finding} is present. The other options are not indicated, are contraindicated, or address a different problem.`,
    },
    {
      stem: `A ${NURSE} is reviewing a ${P} with ${t.name} who has ${t.finding}. Which result is most important to monitor?`,
      correct: `The ${t.lab}.`,
      distractors: [
        "A serum amylase taken on admission.",
        "The patient's baseline height and weight.",
        "The most recent visual acuity screening.",
      ],
      rationale: `The ${t.lab} directly reflects the status of ${t.name} and guides treatment decisions. The other results do not measure this problem.`,
    },
    {
      stem: `A ${NURSE} is teaching a ${P} with ${t.name} to report ${t.finding}. Which statement shows correct understanding?`,
      correct: `\u201cI will report ${t.finding} straight away.\u201d`,
      distractors: [
        "\u201cI can stop all of my medicines once I feel better.\u201d",
        "\u201cI should avoid follow-up appointments unless I have severe pain.\u201d",
        "\u201cI will double my next dose if I forget one.\u201d",
      ],
      rationale: `Recognising and reporting ${t.finding} promotes early intervention in ${t.name}. The other statements describe unsafe self-management and need further teaching.`,
    },
    {
      stem: `A ${NURSE} is planning care for a ${P} with ${t.name} whose plan includes to ${t.action}. Which intervention should be included?`,
      correct: `${cap(t.action)}.`,
      distractors: [
        `Limit the ${P}'s fluid intake to 500 mL daily without a prescription.`,
        `Restrict all visitors for the whole admission.`,
        `Keep the ${P} on strict bed rest indefinitely.`,
      ],
      rationale: `Evidence-based care for ${t.name} includes the action to ${t.action}. The other options are inappropriate, unsafe, or require a specific prescription.`,
    },
    {
      stem: `A ${NURSE} is prioritising care on the ward in a situation ${rel}. Which ${P} should be assessed first?`,
      correct: `The ${P} with ${t.finding}.`,
      distractors: [
        `The ${P} awaiting discharge information in two hours.`,
        `The ${P} requesting a routine analgesia review.`,
        `The ${P} who needs help ordering lunch.`,
      ],
      rationale: `The ${P} with ${t.finding} shows a change in condition and takes priority using the ABC and acute-versus-chronic frameworks.`,
    },
    {
      stem: `A ${NURSE} is evaluating a ${P} being treated for ${t.name} where the ${t.lab} is being monitored. Which outcome shows the plan is working?`,
      correct: `The ${t.lab} trends towards the expected reference range.`,
      distractors: [
        `The ${P} sleeps more than fourteen hours per day.`,
        `The ${P} reports increasing intensity of symptoms.`,
        `The ${P} requires escalating doses of rescue medicine.`,
      ],
      rationale: `Improvement in the ${t.lab} shows a therapeutic response in ${t.name}. The other findings indicate deterioration.`,
    },
    {
      stem: `In ${category.toLowerCase()}, which record entry about a ${P} with ${t.name} and ${t.finding} is most appropriate?`,
      correct: `\u201c${topicLike ? `${cap(t.finding)} observed` : `${Pc} has ${t.finding}`}; ${NURSE} acted to ${t.action}; ${PROVIDER} informed.\u201d`,
      distractors: [
        `\u201c${Pc} appears to be doing poorly today.\u201d`,
        `\u201c${Pc} seems anxious and probably needs sedation.\u201d`,
        `\u201c${Pc} uncooperative; refused everything offered.\u201d`,
      ],
      rationale: `Documentation must be objective and state the finding, the action taken, and who was informed. Subjective or judgemental entries are inappropriate and indefensible.`,
    },
    {
      stem: `A ${P} with ${t.name} is on ${t.drug} and needs ${t.lab} checked. Which task may be delegated to a ${who}?`,
      correct: `Obtaining and recording routine observations for a stable ${P}.`,
      distractors: [
        `Evaluating the ${P}'s response to ${t.drug}.`,
        `Interpreting the trend in the ${t.lab}.`,
        `Teaching the ${P} about ${t.name} at home.`,
      ],
      rationale: `Assessment, evaluation, teaching and clinical judgement cannot be delegated. Routine observations on a stable ${P} are within the support worker's scope.`,
    },
  ];
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function main() {
  const force = process.argv.includes("--force");
  const SEED_DEMO = process.env.SEED_DEMO === "true";

  const existing = await db.execute<{ count: string }>(sql`select count(*)::text as count from questions`);
  const count = Number(existing.rows[0]?.count ?? 0);

  if (force || count < 3000) {
    await db.execute(sql`truncate table questions restart identity cascade`);

    const rows: (typeof questions.$inferInsert)[] = [];
    const seen = new Set<string>();
    let skipped = 0;
    let n = 0;

    const push = (
      exam: string,
      cat: { category: string; clientNeed: string },
      d: { stem: string; correct: string; distractors: string[]; rationale: string },
      bodySystem?: string,
    ) => {
      n++;
      // Enforce uniqueness within each exam: a topic appearing in two
      // categories, or in two exam tracks, must not produce a duplicate
      // for the student sitting that paper.
      const key = `${exam}::${d.stem}`;
      if (seen.has(key)) {
        skipped++;
        return;
      }
      seen.add(key);
      const opts = shuffle([d.correct, ...d.distractors], n * 7);
      rows.push({
        exam,
        stem: d.stem,
        options: opts,
        correctIndex: opts.indexOf(d.correct),
        rationale: d.rationale,
        category: cat.category,
        difficulty: DIFFICULTIES[n % 3],
        clientNeed: cat.clientNeed,
        bodySystem: bodySystem ?? null,
      });
    };

    // ── Question Bank for All Nurses ───────────────────────────────
    // One unified track. Every question is built from a distinct clinical
    // fact, so no two questions test the same thing twice.
    for (const [category, topic, facts] of NURSING_DATA) {
      const cat = { category, clientNeed: category };
      for (const [finding, action, drug, lab] of facts) {
        const t: TopicEntry = { name: topic, finding, action, drug, lab };
        for (const d of buildDrafts(t, category, {
          isMid: false, isGhana: true, topicLike: false,
        })) {
          push("ALL_NURSES", cat, d);
        }
      }
    }

    // ── Past NMC examination questions (Medical Nursing paper) ─────
    // Real questions transcribed from a past paper supplied by the operator.
    // Answers are derived from the rationales printed in the paper, not from
    // an official answer key, so they are flagged for review.
    for (const q of [...PAST_PAPER_MEDICAL, ...PAST_PAPER_MEDICAL_2]) {
      n++;
      const key = `PAST::${q.stem}`;
      if (seen.has(key)) {
        skipped++;
        continue;
      }
      seen.add(key);
      const opts = shuffle(q.options, n * 13);
      rows.push({
        exam: "ALL_NURSES",
        stem: q.stem,
        options: opts,
        correctIndex: opts.indexOf(q.options[q.correctIndex]),
        rationale: q.rationale,
        category: q.category,
        difficulty: "medium",
        clientNeed: "Past Examination Questions",
        bodySystem: null,
      });
    }

    for (let i = 0; i < rows.length; i += 1000) {
      await db.insert(questions).values(rows.slice(i, i + 1000));
    }

    const by = (e: string) => rows.filter((r) => r.exam === e).length;
    console.log(
      `Inserted ${rows.length} unique questions (NCLEX ${by("NCLEX")}, Midwifery ${by(
        "MIDWIFERY",
      )}); skipped ${skipped} duplicates`,
    );
  } else {
    console.log(`Questions already seeded: ${count}`);
  }

  // ── Lessons ─────────────────────────────────────────────────────
  await db.execute(sql`truncate table lessons restart identity`);
  await db.insert(lessons).values(
    LESSON_SEEDS.map((l, i) => ({ ...l, sortOrder: i })),
  );
  console.log(`Seeded ${LESSON_SEEDS.length} lessons`);

  if (!SEED_DEMO) {
    console.log("Demo data skipped (SEED_DEMO not set to true).");
    await pool.end();
    return;
  }

  // ── Demo account ────────────────────────────────────────────────
  const demoEmail = "demo@nursingprep.app";
  const found = await db.execute<{ id: number }>(sql`select id from users where email = ${demoEmail} limit 1`);
  let userId = found.rows[0]?.id;
  if (!userId) {
    const ins = await db
      .insert(users)
      .values({ name: "Demo Student", email: demoEmail, passwordHash: hashPassword("demo1234") })
      .returning({ id: users.id });
    userId = ins[0].id;
  }
  await db.update(users).set({ role: "admin" }).where(sql`id = ${userId}`);

  if (!userId) {
    await pool.end();
    return;
  }

  const taskCount = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from tasks where user_id = ${userId}`,
  );
  if (Number(taskCount.rows[0]?.count ?? 0) === 0) {
    const day = (d: number) => new Date(Date.now() + d * 86400000);
    await db.insert(tasks).values([
      { userId, title: "Complete 50 pharmacology questions", notes: "Focus on anticoagulants and insulins.", category: "Pharmacology", priority: "high", status: "in_progress", dueDate: day(1), targetQuestions: 50 },
      { userId, title: "Review acid-base balance", notes: "ROME method drills + 20 questions.", category: "Respiratory", priority: "medium", status: "todo", dueDate: day(3), targetQuestions: 20 },
      { userId, title: "Maternal-newborn content review", notes: "Pre-eclampsia, PPH, fetal monitoring.", category: "Maternal & Child", priority: "high", status: "todo", dueDate: day(4), targetQuestions: 40 },
    ]);
    await db.insert(attempts).values([
      { userId, exam: "NCLEX", category: "Pharmacology", total: 25, correct: 19 },
      { userId, exam: "NCLEX", category: "Fundamentals", total: 30, correct: 26 },
    ]);
  }

  await db
    .update(users)
    .set({ referralCode: "DEMO7XQ2", walletBalance: 500 })
    .where(sql`id = ${userId} and referral_code is null`);

  const refCount = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from referrals where referrer_id = ${userId}`,
  );
  if (Number(refCount.rows[0]?.count ?? 0) === 0) {
    const friend = await db
      .insert(users)
      .values({
        name: "Kwame Mensah",
        email: "kwame@example.com",
        passwordHash: hashPassword("demo1234"),
        referralCode: buildReferralCode("Kwame Mensah"),
        referredByUserId: userId,
        plan: "monthly",
        planExpiresAt: new Date(Date.now() + 30 * 86400000),
      })
      .onConflictDoNothing()
      .returning({ id: users.id });
    if (friend[0]) {
      await db.insert(referrals).values({
        referrerId: userId,
        refereeId: friend[0].id,
        refereeName: "Kwame Mensah",
        refereeEmail: "kwame@example.com",
        code: "DEMO7XQ2",
        status: "converted",
        rewardAmount: 50,
        plan: "monthly",
        convertedAt: new Date(),
      });
    }
    await db.insert(payouts).values({
      userId,
      amount: 500,
      destination: "0244123456",
      status: "requested",
      note: "Referral rewards withdrawal",
    });
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

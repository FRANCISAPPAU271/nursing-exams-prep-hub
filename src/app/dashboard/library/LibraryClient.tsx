"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getVideoInfo, LIBRARY_SECTIONS } from "@/lib/library";

export type Lesson = {
  id: number;
  title: string;
  description: string;
  section: string;
  topic: string;
  durationMin: number;
  searchQuery: string;
  premium: boolean;
};

const TOUR_CHAPTERS = [
  {
    icon: "🧭",
    title: "1. Overview & Readiness Score",
    summary: "Your central cockpit for tracking overall accuracy, questions answered, and upcoming study deadlines.",
    tips: [
      "Check your category accuracy percentage to spot weak clinical areas before test day.",
      "Track your recent quiz scores and aim for at least 70% in every category.",
      "Access quick links to Mock Exams, Learning Library, and the Question Bank.",
    ],
  },
  {
    icon: "📋",
    title: "2. Study Tasks Checklist",
    summary: "Break your exam preparation into manageable daily blocks with question targets and deadlines.",
    tips: [
      "Create tasks for specific topics (e.g. '50 Pharmacology questions on Anticoagulants').",
      "Assign priorities: High (urgent review), Medium (scheduled), Low (reinforcement).",
      "Check off completed tasks to build and maintain study momentum.",
    ],
  },
  {
    icon: "❓",
    title: "3. 32,000 Questions Bank & Rationales",
    summary: "Comprehensive item bank covering both the US/Canada NCLEX (20,000) and UK NMC CBT (12,000).",
    tips: [
      "Use the Exam Switcher tabs at the top to toggle between 🇺🇸 NCLEX and 🇬🇧 NMC.",
      "Filter by category (Medical-Surgical, Pharmacology, NMC Code, Numeracy, etc.).",
      "Click 'Show answer & rationale' on any item to read the detailed clinical explanation.",
    ],
  },
  {
    icon: "⏱",
    title: "4. Realistic Timed Mock Exams",
    summary: "Simulate actual test-day pressure with authentic time limits and item counts.",
    tips: [
      "NCLEX Mock: 75 questions in 90 minutes with question navigator.",
      "UK NMC CBT Mock: 120 questions across 4 hours covering numeracy and clinical sections.",
      "Flag difficult questions to review before final submission, then study every rationale.",
    ],
  },
  {
    icon: "💳",
    title: "5. Mobile Money Activation (MTN MoMo)",
    summary: "Affordable plans starting at $5 (GHS 60) payable directly via MTN MoMo to 0598872146.",
    tips: [
      "Select your plan on the Billing page and tap 'Generate reference'.",
      "Dial *170# to transfer the exact amount to 0598872146.",
      "Enter your MoMo transaction ID — once approved, activate using your PREP-XXXX-XXXX code.",
    ],
  },
  {
    icon: "🎁",
    title: "6. Refer & Earn 10% Cash",
    summary: "Share your personal referral link with classmates and earn cash paid straight to your MoMo wallet.",
    tips: [
      "Give your friends 5 days of Pro access completely free.",
      "Earn 10% cash whenever a friend activates a paid plan.",
      "Withdraw straight to Mobile Money as soon as your balance reaches $5.",
    ],
  },
];

const STUDY_PLAN_WEEKS = [
  {
    week: "Week 1",
    title: "Fundamentals, Safety & Infection Control",
    focus: "Standard, contact, droplet, and airborne precautions; sterile technique, vital signs, ethics and delegation.",
    target: "100 questions / day + ADPIE review",
  },
  {
    week: "Week 2",
    title: "Pharmacology & Dosage Calculations",
    focus: "Cardiac meds (Digoxin, Beta-blockers, ACEi), Insulins, Anticoagulants (Heparin/Warfarin), and IV calculations.",
    target: "100 questions / day + math drills",
  },
  {
    week: "Week 3",
    title: "Med-Surg Core: Cardio, Respiratory & Renal",
    focus: "Heart failure, MI, COPD, asthma, ABG interpretation (ROME), AKI, CKD, and fluid/electrolytes.",
    target: "125 questions / day + 1 timed practice quiz",
  },
  {
    week: "Week 4",
    title: "Med-Surg Complex: Neuro, Endocrine & GI",
    focus: "Stroke, increased ICP, seizures, DKA vs HHS, thyroid storm, pancreatitis, and cirrhosis.",
    target: "125 questions / day + rationale review",
  },
  {
    week: "Week 5",
    title: "Maternal-Newborn, Pediatrics & Mental Health",
    focus: "Preeclampsia, fetal heart monitoring, pediatric milestones, psych meds (Lithium, Clozapine).",
    target: "125 questions / day + weak spot review",
  },
  {
    week: "Week 6",
    title: "Full Timed Mocks, Remediation & Final Readiness",
    focus: "Sit at least 2 full 75-Q or 120-Q timed mock exams under real conditions. Rest 24 hours before test day!",
    target: "Mock exam + review every rationale",
  },
];

export default function LibraryClient({
  lessons,
  isPremium,
}: {
  lessons: Lesson[];
  isPremium: boolean;
}) {
  const [section, setSection] = useState("App Orientation");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Lesson | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [playerTab, setPlayerTab] = useState<"video" | "tour" | "notes">("video");

  const visible = useMemo(
    () =>
      lessons.filter(
        (l) =>
          l.section === section &&
          (!query || `${l.title} ${l.description}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [lessons, section, query],
  );

  const locked = (l: Lesson) => l.premium && !isPremium;

  const currentVideoInfo = active ? getVideoInfo(active.topic) : null;
  const isOrientationWalkthrough = active?.title.includes("Welcome: How to Use");
  const isStudyPlanLesson = active?.title.includes("Build Your 6-Week");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Learning Library</h1>
          <p className="text-sm text-slate-500">
            {lessons.length} video lessons & study guides — body systems, common conditions, care plans, and NMC UK registration.
          </p>
        </div>
        {!isPremium && (
          <Link
            href="/dashboard/billing"
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Unlock all lessons
          </Link>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {LIBRARY_SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              section === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search lessons…"
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      {/* Active Lesson Player Modal / Card */}
      {active && currentVideoInfo && (
        <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 font-semibold text-teal-800">
                  {active.section}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{active.durationMin} min</span>
                {!active.premium && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
                    Free Lesson
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">{active.title}</h2>
            </div>
            <button
              onClick={() => setActive(null)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              ✕ Close player
            </button>
          </div>

          {/* Sub-tabs for orientation or clinical notes */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 pt-3">
            <button
              onClick={() => setPlayerTab("video")}
              className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                playerTab === "video"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              ▶ Video Lecture
            </button>
            {isOrientationWalkthrough && (
              <button
                onClick={() => setPlayerTab("tour")}
                className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                  playerTab === "tour"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                🧭 Interactive App Walkthrough (Step-by-Step)
              </button>
            )}
            {isStudyPlanLesson && (
              <button
                onClick={() => setPlayerTab("tour")}
                className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                  playerTab === "tour"
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                📅 6-Week Study Schedule Template
              </button>
            )}
            <button
              onClick={() => setPlayerTab("notes")}
              className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${
                playerTab === "notes"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📋 Clinical Notes & Exam Pearls
            </button>
          </div>

          {/* Player Tab: Video */}
          {playerTab === "video" && (
            <div className="p-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner">
                <iframe
                  key={active.id + currentVideoInfo.youtubeId}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${currentVideoInfo.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Actions & Fallback links */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-500">
                  <span>Source Channel: </span>
                  <strong className="text-slate-800">{currentVideoInfo.channel}</strong>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${currentVideoInfo.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                  >
                    <span>▶</span>
                    <span>Watch on YouTube (New Tab)</span>
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(active.searchQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>Search Related Lectures ↗</span>
                  </a>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                💡 <em>Tip: If your campus, school, or hospital Wi-Fi restricts embedded YouTube video playback, tap <strong>&ldquo;Watch on YouTube&rdquo;</strong> above to open it directly in a new tab!</em>
              </p>
            </div>
          )}

          {/* Player Tab: Interactive Tour / 6-Week Plan */}
          {playerTab === "tour" && (
            <div className="p-5">
              {isOrientationWalkthrough && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{TOUR_CHAPTERS[tourStep].icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900">{TOUR_CHAPTERS[tourStep].title}</h3>
                        <p className="text-sm text-slate-600">{TOUR_CHAPTERS[tourStep].summary}</p>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-teal-200/60 pt-3 text-sm text-slate-700">
                      {TOUR_CHAPTERS[tourStep].tips.map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-bold text-teal-600">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tour Step Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={tourStep === 0}
                      onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      ← Previous step
                    </button>
                    <span className="text-xs text-slate-500">
                      Step {tourStep + 1} of {TOUR_CHAPTERS.length}
                    </span>
                    <button
                      disabled={tourStep === TOUR_CHAPTERS.length - 1}
                      onClick={() => setTourStep((s) => Math.min(TOUR_CHAPTERS.length - 1, s + 1))}
                      className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-teal-700"
                    >
                      Next step →
                    </button>
                  </div>
                </div>
              )}

              {isStudyPlanLesson && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Use this recommended 6-week curriculum to structure your daily study tasks:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {STUDY_PLAN_WEEKS.map((w) => (
                      <div key={w.week} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">
                            {w.week}
                          </span>
                          <span className="text-xs font-medium text-teal-700">{w.target}</span>
                        </div>
                        <h4 className="mt-2 font-semibold text-slate-900">{w.title}</h4>
                        <p className="mt-1 text-xs text-slate-600">{w.focus}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-center">
                    <Link
                      href="/dashboard/tasks"
                      className="inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      + Add these to your Study Task Board
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Player Tab: Clinical Notes & Exam Pearls */}
          {playerTab === "notes" && (
            <div className="space-y-4 p-5">
              <div>
                <h3 className="font-semibold text-slate-900">Key Clinical Concepts</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {currentVideoInfo.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                      <span className="text-teal-600">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h3 className="font-semibold text-slate-900">NCLEX & NMC Exam Traps</h3>
                <ul className="mt-2 space-y-1.5">
                  {currentVideoInfo.examTips.map((tip, i) => (
                    <li key={i} className="flex gap-2 rounded-lg bg-amber-50/80 p-2.5 text-xs text-amber-950 ring-1 ring-amber-200/60">
                      <span className="font-bold text-amber-700">⚠</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">Test yourself on this topic right now:</p>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/questions?q=${encodeURIComponent(active.topic)}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Question Bank on {active.topic} ↗
                  </Link>
                  <Link
                    href="/dashboard/practice"
                    className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Start Quick Quiz ↗
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lesson Grid */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-3 font-semibold text-slate-700">No lessons match your search</p>
          <p className="mt-1 text-sm text-slate-500">Try another keyword or switch sections.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l) => (
            <li key={l.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300">
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{l.topic}</span>
                <span className="text-slate-400">{l.durationMin} min</span>
                {l.premium ? (
                  <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">
                    Pro
                  </span>
                ) : (
                  <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">
                    Free
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900">{l.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{l.description}</p>
              {locked(l) ? (
                <Link
                  href="/dashboard/billing"
                  className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800 hover:bg-amber-100"
                >
                  🔒 Unlock with Pro
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setActive(l);
                    setPlayerTab("video");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  <span>▶</span>
                  <span>Watch lesson</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    step: 1,
    icon: "🧭",
    title: "Overview & Exam Readiness Score",
    badge: "Dashboard Cockpit",
    summary: "Track your overall readiness percentage, questions completed, and upcoming revision milestones in one glance.",
    visual: {
      stat1: "7,000+ Questions",
      stat2: "70%+ Target Accuracy",
      stat3: "Dual Track: US + UK",
    },
    tips: [
      "Keep every category accuracy above 70% before sitting the real exam.",
      "Check your snapshot daily to see which clinical systems require immediate remediation.",
      "Use one-click quick links to jump directly into practice quizzes or full mock tests.",
    ],
  },
  {
    step: 2,
    icon: "📋",
    title: "Daily Study Tasks Checklist",
    badge: "Task Board",
    summary: "Break giant clinical textbooks into structured, bite-sized daily question goals and review sessions.",
    visual: {
      stat1: "Set Daily Targets",
      stat2: "Prioritize High / Med",
      stat3: "Track Due Dates",
    },
    tips: [
      "Create tasks for specific topics (e.g. '50 Pharmacology questions on Anticoagulants & Insulins').",
      "Organize tasks by High, Medium, or Low priority so you tackle weak areas first.",
      "Check off completed review blocks to maintain an unbroken study streak.",
    ],
  },
  {
    step: 3,
    icon: "❓",
    title: "7,000+ Questions Bank & Rationales",
    badge: "Question Bank",
    summary: "Comprehensive item bank covering the US/Canada NCLEX (2,000), Ghana NMC licensing (2,660) and Midwifery (2,381) — all unique.",
    visual: {
      stat1: "🇺🇸 20,000 NCLEX",
      stat2: "🇬🇭 24,000 Ghana NMC",
      stat3: "Detailed Rationales",
    },
    tips: [
      "Use the Exam Switcher tabs at the top to toggle NCLEX, Ghana NMC and Midwifery.",
      "Filter by category: Pharmacology, Med-Surg, The NMC Code, Numeracy & Calculations, etc.",
      "Click 'Show answer & rationale' on any question to understand why right and wrong answers differ.",
    ],
  },
  {
    step: 4,
    icon: "⏱",
    title: "Authentic Timed Mock Examinations",
    badge: "Exam Simulation",
    summary: "Experience real test-day pressure with authentic timers, question counts, and full post-exam review.",
    visual: {
      stat1: "1 min / question",
      stat2: "NMC CBT: 120 Qs / 4 hr",
      stat3: "Flagging & Review",
    },
    tips: [
      "Budget: 1 minute per question — 75 items = 75 minutes.",
      "NCLEX Mock: 75 questions in 90 minutes with question navigator.",
      "Ghana NMC & Midwifery Mocks: 100 questions in 2 hours each.",
      "Flag difficult questions to review before submitting, then study every rationale.",
    ],
  },
  {
    step: 5,
    icon: "💳",
    title: "MTN Mobile Money & Instant Activation",
    badge: "Direct MoMo Payment",
    summary: "Affordable access starting at just $5 (GHS 60). No foreign bank card or international dollar fees required.",
    visual: {
      stat1: "MTN: 0598872146",
      stat2: "Dial *170#",
      stat3: "Instant PREP Code",
    },
    tips: [
      "Choose your plan ($5 / $10 / $18) on the Billing page and tap 'Generate reference'.",
      "Dial *170# → Transfer Money → send the exact cedi amount to 0598872146.",
      "Enter your MoMo transaction ID — once approved, activate using your PREP-XXXX-XXXX code.",
    ],
  },
  {
    step: 6,
    icon: "🎁",
    title: "Refer & Earn 10% Cash to MoMo",
    badge: "Student Rewards",
    summary: "Invite your nursing classmates and earn real cash credited straight to your Mobile Money wallet.",
    visual: {
      stat1: "Give 5 Days Free Pro",
      stat2: "Earn 10% Cash",
      stat3: "Withdraw at $5",
    },
    tips: [
      "Share your referral link or code with your nursing cohort on WhatsApp.",
      "Your friends get 5 days of Pro access completely free upon registration.",
      "Earn 10% cash on every activated plan and withdraw directly to MTN MoMo once you hit $5.",
    ],
  },
];

const STUDY_PLAN_WEEKS = [
  {
    week: 1,
    label: "Week 1",
    title: "Fundamentals, Safety & Infection Control",
    target: "100 questions / day + ADPIE review",
    focus: "Standard, contact, droplet, and airborne precautions; sterile technique, vital signs, ethics and delegation.",
    examTip: "Always assess before intervening. For Ghana NMC, know the IMCI danger signs and the Sepsis Six."
  },
  {
    week: 2,
    label: "Week 2",
    title: "Pharmacology & Dosage Calculations",
    target: "100 questions / day + math drills",
    focus: "Cardiac meds (Digoxin, Beta-blockers, ACEi), Insulins, Anticoagulants (Heparin/Warfarin), and IV rate calculations.",
    examTip: "Digoxin: hold if apical pulse < 60. Warfarin: monitor INR (goal 2-3). Heparin: monitor aPTT.",
  },
  {
    week: 3,
    label: "Week 3",
    title: "Med-Surg Core: Cardio, Respiratory & Renal",
    target: "125 questions / day + 1 timed practice quiz",
    focus: "Heart failure, MI, COPD, asthma, ABG interpretation (ROME), AKI, CKD, and fluid/electrolytes.",
    examTip: "ROME: Respiratory Opposite, Metabolic Equal. Sudden silent chest in asthma is a critical emergency.",
  },
  {
    week: 4,
    label: "Week 4",
    title: "Med-Surg Complex: Neuro, Endocrine & GI",
    target: "125 questions / day + rationale review",
    focus: "Stroke (FAST, tPA window), increased ICP, seizures, DKA vs HHS, thyroid storm, pancreatitis, and cirrhosis.",
    examTip: "Cushing's Triad (bradycardia, widening pulse pressure, irregular respirations) indicates late increased ICP.",
  },
  {
    week: 5,
    label: "Week 5",
    title: "Maternal-Newborn, Pediatrics & Mental Health",
    target: "125 questions / day + weak spot review",
    focus: "Preeclampsia, fetal heart monitoring, pediatric milestones, psych meds (Lithium, Clozapine).",
    examTip: "Placenta previa = painless bright red bleeding (NO vaginal exams). Abruptio placentae = painful dark red bleeding.",
  },
  {
    week: 6,
    label: "Week 6",
    title: "Full Timed Mocks, Remediation & Readiness",
    target: "Mock exam + review every rationale",
    focus: "Sit at least 2 full 75-Q or 120-Q timed mock exams under real conditions. Rest 24 hours before test day!",
    examTip: "Do not cram on the day before the exam. Prioritize sleep, nutrition, and mindset.",
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

  // Player mode: 'interactive' (built-in animated presentation) or 'youtube' (video lecture)
  const [videoSource, setVideoSource] = useState<"interactive" | "youtube">("interactive");

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
  const hasInteractivePresentation = isOrientationWalkthrough || isStudyPlanLesson;

  // Whenever a lesson is opened, default to interactive for orientation/study plan, otherwise youtube
  function openLesson(l: Lesson) {
    setActive(l);
    if (l.title.includes("Welcome: How to Use") || l.title.includes("Build Your 6-Week")) {
      setVideoSource("interactive");
    } else {
      setVideoSource("youtube");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Learning Library</h1>
          <p className="text-sm text-slate-500">
            {lessons.length} video lectures, interactive study tours & clinical guides — body systems, common conditions, care plans, Ghana NMC licensing and Midwifery practice.
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
        <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-xl">
          {/* Top Bar */}
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

            <div className="flex items-center gap-2">
              {/* Source Switcher Buttons */}
              {hasInteractivePresentation && (
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
                  <button
                    onClick={() => setVideoSource("interactive")}
                    className={`rounded-md px-3 py-1.5 font-semibold transition ${
                      videoSource === "interactive"
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ▶ Interactive Tour
                  </button>
                  <button
                    onClick={() => setVideoSource("youtube")}
                    className={`rounded-md px-3 py-1.5 font-semibold transition ${
                      videoSource === "youtube"
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📺 YouTube Lecture
                  </button>
                </div>
              )}

              <button
                onClick={() => setActive(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* MAIN PLAYER AREA */}
          <div className="p-4 sm:p-5">
            {/* Case 1: Interactive Built-in Tour for Orientation */}
            {hasInteractivePresentation && videoSource === "interactive" && isOrientationWalkthrough && (
              <OrientationTourPlayer />
            )}

            {/* Case 2: Interactive Built-in Curriculum for Study Plan */}
            {hasInteractivePresentation && videoSource === "interactive" && isStudyPlanLesson && (
              <StudyPlanInteractivePlayer />
            )}

            {/* Case 3: Embedded YouTube Video Lecture */}
            {(!hasInteractivePresentation || videoSource === "youtube") && (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
                  <iframe
                    key={active.id + currentVideoInfo.youtubeId}
                    className="h-full w-full border-0"
                    src={`https://www.youtube.com/embed/${currentVideoInfo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                {/* Direct Action Links & Fallbacks */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                  <div className="text-slate-500">
                    Channel: <strong className="text-slate-800">{currentVideoInfo.channel}</strong>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideoInfo.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                      <span>▶</span>
                      <span>Open on YouTube (New Tab)</span>
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(active.searchQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span>Search More Lectures ↗</span>
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  💡 <em>If YouTube says &ldquo;Playback on other websites has been disabled&rdquo; or your campus network blocks video embeds, tap <strong>&ldquo;Open on YouTube&rdquo;</strong> to watch directly!</em>
                </p>
              </div>
            )}

            {/* CLINICAL SUMMARY & EXAM NOTES (Visible below all videos) */}
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Key Clinical Takeaways</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {currentVideoInfo.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                      <span className="font-bold text-teal-600">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3.5">
                <h4 className="text-xs font-bold text-amber-900">⚠ High-Yield NCLEX & NMC Exam Pearls</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-amber-950">
                  {currentVideoInfo.examTips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-amber-600">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <p className="text-xs text-slate-500">Practice questions related to this lecture:</p>
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
                    Quick Quiz on This Topic ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
                  onClick={() => openLesson(l)}
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

/** Built-in interactive presentation simulator for the Welcome / Orientation video */
function OrientationTourPlayer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const chapter = TOUR_CHAPTERS[currentStep];

  // Auto-play timer that simulates video playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setCurrentStep((s) => (s + 1) % TOUR_CHAPTERS.length);
          return 0;
        }
        return p + 2; // advances every 5 seconds (50 ticks x 100ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  function handleJump(stepIndex: number) {
    setCurrentStep(stepIndex);
    setProgress(0);
  }

  return (
    <div className="space-y-4">
      {/* Video Cinema Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-2xl">
        {/* Top Video Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-teal-300">INTERACTIVE APP ORIENTATION TOUR</span>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-slate-300">
            Chapter {currentStep + 1} of {TOUR_CHAPTERS.length}
          </span>
        </div>

        {/* Dynamic Chapter Visual Stage */}
        <div className="py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/20 text-3xl shadow-sm">
              {chapter.icon}
            </span>
            <div>
              <span className="rounded-full bg-teal-400/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
                {chapter.badge}
              </span>
              <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">{chapter.title}</h3>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-slate-300 leading-relaxed">{chapter.summary}</p>

          {/* Graphical Dashboard Snapshot Preview */}
          <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-center sm:gap-4 sm:p-4">
            <div className="rounded-lg bg-white/5 p-2.5 sm:p-3">
              <p className="text-xs text-slate-400">Core Metric</p>
              <p className="mt-1 text-sm font-bold text-teal-300 sm:text-base">{chapter.visual.stat1}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2.5 sm:p-3">
              <p className="text-xs text-slate-400">Benchmark</p>
              <p className="mt-1 text-sm font-bold text-amber-300 sm:text-base">{chapter.visual.stat2}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-2.5 sm:p-3">
              <p className="text-xs text-slate-400">Availability</p>
              <p className="mt-1 text-sm font-bold text-emerald-300 sm:text-base">{chapter.visual.stat3}</p>
            </div>
          </div>

          {/* Action Bullet Points */}
          <div className="mt-5 rounded-xl bg-slate-900/70 p-4 text-xs sm:text-sm text-slate-200">
            <p className="font-semibold text-teal-300">How to use this feature:</p>
            <ul className="mt-2 space-y-1.5">
              {chapter.tips.map((t, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="border-t border-white/10 pt-3">
          {/* Progress Timeline */}
          <div className="relative h-1.5 w-full rounded-full bg-white/20">
            <div
              className="h-1.5 rounded-full bg-teal-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400"
              >
                {isPlaying ? "⏸ Pause Tour" : "▶ Play Tour"}
              </button>

              <button
                disabled={currentStep === 0}
                onClick={() => handleJump(Math.max(0, currentStep - 1))}
                className="rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
              >
                ⏮ Prev
              </button>
              <button
                disabled={currentStep === TOUR_CHAPTERS.length - 1}
                onClick={() => handleJump(Math.min(TOUR_CHAPTERS.length - 1, currentStep + 1))}
                className="rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs text-white disabled:opacity-40"
              >
                Next ⏭
              </button>
            </div>

            {/* Chapter Jump Bubbles */}
            <div className="flex items-center gap-1.5">
              {TOUR_CHAPTERS.map((c, i) => (
                <button
                  key={c.step}
                  onClick={() => handleJump(i)}
                  className={`h-6 w-6 rounded-full text-[10px] font-bold transition ${
                    i === currentStep
                      ? "bg-teal-400 text-slate-950 ring-2 ring-teal-300"
                      : "bg-white/10 text-slate-400 hover:bg-white/20"
                  }`}
                  title={c.title}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Built-in interactive presentation simulator for the 6-Week Study Plan */
function StudyPlanInteractivePlayer() {
  const [activeWeek, setActiveWeek] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const plan = STUDY_PLAN_WEEKS[activeWeek];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setActiveWeek((w) => (w + 1) % STUDY_PLAN_WEEKS.length);
          return 0;
        }
        return p + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, activeWeek]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold text-indigo-300">6-WEEK NCLEX & NMC REVISION ROADMAP</span>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-slate-300">
            {plan.label} of 6
          </span>
        </div>

        <div className="py-6">
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/40">
              {plan.label}
            </span>
            <span className="rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold text-teal-300">
              🎯 Daily Target: {plan.target}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">{plan.title}</h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{plan.focus}</p>

          <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs sm:text-sm text-amber-200">
            <p className="font-bold text-amber-300">💡 Exam Tip for {plan.label}:</p>
            <p className="mt-1">{plan.examTip}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/dashboard/tasks"
              className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400"
            >
              + Add {plan.label} to My Study Tasks
            </Link>
            <Link
              href="/dashboard/questions"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Drill Questions for {plan.label} ↗
            </Link>
          </div>
        </div>

        {/* Timeline & Navigator */}
        <div className="border-t border-white/10 pt-3">
          {isPlaying && (
            <div className="relative mb-3 h-1.5 w-full rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-indigo-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-400"
            >
              {isPlaying ? "⏸ Pause Timeline" : "▶ Auto-Advance Weeks"}
            </button>

            <div className="flex items-center gap-1.5">
              {STUDY_PLAN_WEEKS.map((w, idx) => (
                <button
                  key={w.week}
                  onClick={() => {
                    setActiveWeek(idx);
                    setProgress(0);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    idx === activeWeek
                      ? "bg-indigo-400 text-slate-950 font-bold"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  W{w.week}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_EXAM, getExam } from "@/lib/exams";
import { buildExplanation } from "@/lib/explain";
import AnswerBreakdown from "@/components/AnswerBreakdown";
import ExamTabs from "../ExamTabs";

type Q = {
  id: number;
  stem: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  category: string;
  difficulty: string;
};


export default function MockClient({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  const [exam, setExam] = useState<string>(DEFAULT_EXAM);
  const cfg = getExam(exam).mock;
  const [items, setItems] = useState<Q[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(cfg.minutes * 60);
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!items || submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          void finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, submitted]);

  async function start() {
    setLoading(true);
    const res = await fetch(`/api/quiz?count=${cfg.questions}&exam=${exam}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setItems(data.questions ?? []);
    setAnswers({});
    setIndex(0);
    setFlagged(new Set());
    setSecondsLeft(cfg.minutes * 60);
    setSubmitted(false);
    setReview(false);
    submittedRef.current = false;
  }

  async function finish() {
    if (submittedRef.current || !items) return;
    submittedRef.current = true;
    setSubmitted(true);
    const correct = items.filter((q, i) => answers[i] === q.correctIndex).length;
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exam,
        category: `${getExam(exam).name} Mock Exam`,
        mode: "mock",
        total: items.length,
        correct,
      }),
    });
    router.refresh();
  }

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-3 text-2xl font-bold">Mock exams are a Pro feature</h1>
        <p className="mt-2 text-sm text-slate-600">
          Unlock full-length timed simulations for both the NMC CBT and the NCLEX, the complete
          video library and category remediation analytics.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-5 inline-block rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          View payment plans
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!items) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mock Examination</h1>
            <p className="text-sm text-slate-500">
              Simulate real {getExam(exam).name} conditions before the big day.
            </p>
          </div>
          <ExamTabs value={exam} onChange={setExam} />
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <ul className="grid gap-3 sm:grid-cols-3">
            <Info label="Questions" value={`${cfg.questions}`} />
            <Info
              label="Time limit"
              value={cfg.minutes >= 60 ? `${cfg.minutes / 60} hours` : `${cfg.minutes} minutes`}
            />
            <Info label="Feedback" value="After submission" />
          </ul>
          <ul className="mt-5 space-y-2 text-sm text-slate-600">
            <li>▸ Randomised across all 10 {getExam(exam).name} categories.</li>
            <li>▸ Matches the real format: {cfg.label}.</li>
            <li>▸ Flag items for review and navigate freely before submitting.</li>
            <li>▸ The exam auto-submits when the timer reaches zero.</li>
            <li>▸ Your score is stored in Progress for trend analysis.</li>
          </ul>
          <button
            onClick={start}
            className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Begin {getExam(exam).name} mock exam
          </button>
        </div>
      </div>
    );
  }

  const correctCount = items.filter((q, i) => answers[i] === q.correctIndex).length;
  const pct = Math.round((correctCount / items.length) * 100);

  if (submitted && !review) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <p className="text-5xl">{pct >= 75 ? "🎉" : pct >= 60 ? "💪" : "📚"}</p>
          <h1 className="mt-3 text-3xl font-bold">{pct}%</h1>
          <p className="mt-1 text-slate-500">
            {correctCount} of {items.length} correct · {Object.keys(answers).length} answered
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {pct >= 75
              ? "You are tracking in the passing range. Keep the momentum."
              : "Focus your remediation on the categories you missed most."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setReview(true)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Review answers & rationales
            </button>
            <button
              onClick={start}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Take another exam
            </button>
            <Link
              href="/dashboard/progress"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold"
            >
              View progress
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && review) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Exam review — {pct}%</h1>
          <button
            onClick={() => setReview(false)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            Back to results
          </button>
        </div>
        {items.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">
              Q{i + 1} · {q.category}
            </p>
            <p className="mt-1 font-medium">{q.stem}</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {q.options.map((o, oi) => (
                <li
                  key={oi}
                  className={`rounded-lg border px-3 py-2 ${
                    oi === q.correctIndex
                      ? "border-emerald-300 bg-emerald-50"
                      : answers[i] === oi
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-200"
                  }`}
                >
                  <span className="mr-2 font-semibold text-slate-400">{"ABCD"[oi]}.</span>
                  {o}
                </li>
              ))}
            </ul>
            <AnswerBreakdown
              explanation={buildExplanation({
                stem: q.stem,
                rationale: q.rationale,
                options: q.options,
                correctIndex: q.correctIndex,
                chosenIndex: answers[i] ?? null,
              })}
            />
          </div>
        ))}
      </div>
    );
  }

  const current = items[index];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3">
        <span className="font-semibold">
          Question {index + 1} / {items.length}
        </span>
        <span className="text-sm text-slate-500">{Object.keys(answers).length} answered</span>
        <span
          className={`rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${
            secondsLeft < 300 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
          }`}
        >
          ⏱ {mm}:{ss}
        </span>
        <button
          onClick={finish}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Submit exam
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{current.category}</span>
            <button
              onClick={() =>
                setFlagged((f) => {
                  const n = new Set(f);
                  if (n.has(index)) n.delete(index);
                  else n.add(index);
                  return n;
                })
              }
              className={`ml-auto rounded-lg border px-3 py-1 ${
                flagged.has(index) ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-300"
              }`}
            >
              {flagged.has(index) ? "🚩 Flagged" : "Flag for review"}
            </button>
          </div>
          <p className="text-lg font-medium">{current.stem}</p>
          <div className="mt-4 space-y-2">
            {current.options.map((o, i) => (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  answers[index] === i
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                <span className="mr-2 font-semibold text-slate-400">{"ABCD"[i]}.</span>
                {o}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              disabled={index === items.length - 1}
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Navigator</p>
          <div className="grid max-h-72 grid-cols-6 gap-1 overflow-y-auto lg:grid-cols-5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-7 rounded text-xs font-medium ${
                  i === index
                    ? "bg-slate-900 text-white"
                    : flagged.has(i)
                      ? "bg-amber-100 text-amber-800"
                      : answers[i] !== undefined
                        ? "bg-teal-100 text-teal-800"
                        : "bg-slate-100 text-slate-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </li>
  );
}

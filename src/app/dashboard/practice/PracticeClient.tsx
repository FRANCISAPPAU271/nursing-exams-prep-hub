"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoriesFor, DEFAULT_EXAM, getExam } from "@/lib/exams";
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

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export default function PracticeClient({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  const [exam, setExam] = useState<string>(DEFAULT_EXAM);
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Q[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lockMsg, setLockMsg] = useState("");

  // 1 minute (60 s) allowed per question, whole quiz
  const [secondsLeft, setSecondsLeft] = useState(count * 60);
  const [timedOut, setTimedOut] = useState(false);

  async function start() {
    setLoading(true);
    const params = new URLSearchParams({ count: String(count), exam });
    if (category) params.set("category", category);
    const res = await fetch(`/api/quiz?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setLockMsg(data.error ?? "Could not load questions.");
      return;
    }
    setLockMsg("");
    setItems(data.questions ?? []);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setTimedOut(false);
    setSecondsLeft(data.questions.length * 60);
    finishRef.current = false;
    setLoading(false);
  }

  // Count down 60 s per question; auto-submit at zero.
  const finishRef = useRef(false);
  const finishExam = useCallback(async () => {
    if (!items || finishRef.current) return;
    finishRef.current = true;
    setTimedOut(true);
    setFinished(true);
    setSaving(true);
    const correct = answers.filter(Boolean).length;
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, category: category || "Mixed", total: items.length, correct }),
    });
    setSaving(false);
    router.refresh();
  }, [items, answers, exam, category, router]);

  useEffect(() => {
    if (!items || finished) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          void finishExam();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [items, finished, finishExam]);

  async function next() {
    if (!items) return;
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    setFinished(true);
    setSaving(true);
    const correct = answers.filter(Boolean).length;
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, category: category || "Mixed", total: items.length, correct }),
    });
    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!items) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Practice Quiz</h1>
            <p className="text-sm text-slate-500">
              Randomised items from the {getExam(exam).name} bank — {getExam(exam).full}.
            </p>
          </div>
          <ExamTabs
            value={exam}
            onChange={(id) => {
              setExam(id);
              setCategory("");
            }}
          />
        </header>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium">Category</span>
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Mixed (all categories)</option>
              {categoriesFor(exam).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium">Number of questions</span>
            <select className={input} value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[5, 10, 20, 30, 50].map((n) => (
                <option key={n} value={n} disabled={n > 10 && !isPremium}>
                  {n}
                  {n > 10 && !isPremium ? " (Pro)" : ""}
                </option>
              ))}
            </select>
          </label>
          {lockMsg && (
            <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800 ring-1 ring-amber-200 sm:col-span-2">
              {lockMsg}{" "}
              <a href="/dashboard/billing" className="font-semibold underline">
                Upgrade to Pro
              </a>
            </p>
          )}
          <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-600 ring-1 ring-slate-200 sm:col-span-2">
            ⏱ Time limit: <strong>{count} minute{count > 1 ? "s" : ""}</strong> — 1 minute per
            question. The quiz auto-submits when the clock runs out.
          </p>
          <div className="sm:col-span-2">
            <button
              onClick={start}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Start quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const correct = answers.filter(Boolean).length;
    const pct = Math.round((correct / Math.max(1, items.length)) * 100);
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <p className="text-5xl">{pct >= 75 ? "🎉" : pct >= 60 ? "💪" : "📚"}</p>
          <h1 className="mt-3 text-2xl font-bold">You scored {pct}%</h1>
          {timedOut && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
              ⏱ Time ran out — the quiz auto-submitted at 1 minute per question.
            </p>
          )}
          <p className="mt-1 text-slate-500">
            {correct} correct out of {items.length} · {category || "Mixed"}
          </p>
          <p className="mt-2 text-xs text-slate-400">{saving ? "Saving result…" : "Result saved to your progress"}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={start}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Retake quiz
            </button>
            <button
              onClick={() => setItems(null)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Change settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = items[index];
  const answered = selected !== null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Question {index + 1} of {items.length}
        </h1>
        <span className="text-sm text-slate-500">{answers.filter(Boolean).length} correct so far</span>
        <span
          className={`rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${
            secondsLeft / items.length < 15
              ? "bg-rose-50 text-rose-700"
              : secondsLeft / items.length < 30
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          ⏱ {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
          {String(secondsLeft % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Time budget: 1 minute per question */}
      <div className="text-xs text-slate-500">
        {Math.max(0, Math.ceil(secondsLeft / 60))} minute(s) left — 1 minute per question
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-teal-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{current.category}</span>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 capitalize text-teal-700">{current.difficulty}</span>
        </div>
        <p className="text-lg font-medium">{current.stem}</p>
        <div className="mt-4 space-y-2">
          {current.options.map((o, i) => {
            const isCorrect = i === current.correctIndex;
            const chosen = selected === i;
            let cls = "border-slate-200 hover:border-teal-400 hover:bg-teal-50/40";
            if (answered && isCorrect) cls = "border-emerald-400 bg-emerald-50";
            else if (answered && chosen) cls = "border-rose-400 bg-rose-50";
            else if (answered) cls = "border-slate-200 opacity-70";
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => {
                  setSelected(i);
                  setAnswers((a) => [...a, i === current.correctIndex]);
                }}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}
              >
                <span className="mr-2 font-semibold text-slate-400">{"ABCD"[i]}.</span>
                {o}
              </button>
            );
          })}
        </div>

        {answered && (
          <AnswerBreakdown
            explanation={buildExplanation({
              stem: current.stem,
              rationale: current.rationale,
              options: current.options,
              correctIndex: current.correctIndex,
              chosenIndex: selected,
            })}
          />
        )}

        <div className="mt-5 flex justify-end">
          <button
            disabled={!answered}
            onClick={next}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {index + 1 === items.length ? "Finish quiz" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
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
  clientNeed: string;
};

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export default function QuestionsClient() {
  const [items, setItems] = useState<Q[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [exam, setExam] = useState<string>(DEFAULT_EXAM);
  const [category, setCategory] = useState("");
  const [bodySystem, setBodySystem] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  // Selected answer per question id — makes options clickable with instant feedback
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [score, setScore] = useState({ answered: 0, correct: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), exam });
    if (category) params.set("category", category);
    if (bodySystem) params.set("bodySystem", bodySystem);
    if (difficulty) params.set("difficulty", difficulty);
    if (q) params.set("q", q);
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setItems(data.questions ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, exam, category, bodySystem, difficulty, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-sm text-slate-500">
            {loading
              ? "Searching…"
              : `${total.toLocaleString()} ${getExam(exam).name}-style questions match your filters`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tap an option to answer — feedback and rationale appear instantly.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ExamTabs
            value={exam}
            onChange={(id) => {
              setExam(id);
              setCategory("");
              setBodySystem("");
              setPage(1);
            }}
          />
          {score.answered > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-800">
                {score.answered} answered
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span
                className={
                  score.correct / score.answered >= 0.7
                    ? "font-semibold text-emerald-700"
                    : score.correct / score.answered >= 0.5
                      ? "font-semibold text-amber-700"
                      : "font-semibold text-rose-700"
                }
              >
                {Math.round((score.correct / score.answered) * 100)}% correct
              </span>
              <button
                onClick={() => {
                  setPicked({});
                  setScore({ answered: 0, correct: 0 });
                }}
                className="ml-2 text-slate-400 underline hover:text-slate-700"
              >
                reset
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className={input}
          placeholder="Search question text…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <select
          className={input}
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">All Client Needs</option>
          {categoriesFor(exam).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className={input}
          value={difficulty}
          onChange={(e) => {
            setPage(1);
            setDifficulty(e.target.value);
          }}
        >
          <option value="">All difficulties</option>
          {["easy", "medium", "hard"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold text-slate-700">No questions match</p>
          <p className="mt-1 text-sm text-slate-500">Try a different keyword or clear your filters.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{item.category}</span>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 capitalize text-teal-700">{item.difficulty}</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{item.clientNeed}</span>
                <span className="ml-auto text-slate-400">#{item.id}</span>
              </div>
              <p className="font-medium">{item.stem}</p>

              {/* Clickable answer options with instant feedback */}
              <div className="mt-3 space-y-2">
                {item.options.map((o, i) => {
                  const chosen = picked[item.id];
                  const answered = chosen !== undefined;
                  const isCorrect = i === item.correctIndex;
                  const isChosen = chosen === i;

                  let cls =
                    "border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer";
                  if (answered && isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-950";
                  else if (answered && isChosen) cls = "border-rose-400 bg-rose-50 text-rose-950";
                  else if (answered) cls = "border-slate-200 bg-white opacity-60 cursor-default";

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={answered}
                      onClick={() => {
                        setPicked((p) => ({ ...p, [item.id]: i }));
                        setScore((s) => ({
                          answered: s.answered + 1,
                          correct: s.correct + (i === item.correctIndex ? 1 : 0),
                        }));
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${cls}`}
                    >
                      <span
                        className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                          answered && isCorrect
                            ? "bg-emerald-500 text-white"
                            : answered && isChosen
                              ? "bg-rose-500 text-white"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {answered && isCorrect ? "✓" : answered && isChosen ? "✕" : "ABCD"[i]}
                      </span>
                      <span className="flex-1">{o}</span>
                    </button>
                  );
                })}
              </div>

              {/* Deep explanation: why your answer is wrong + every option explained */}
              {picked[item.id] !== undefined &&
                (() => {
                  const ex = buildExplanation({
                    stem: item.stem,
                    rationale: item.rationale,
                    options: item.options,
                    correctIndex: item.correctIndex,
                    chosenIndex: picked[item.id],
                  });
                  return <AnswerBreakdown explanation={ex} />;
                })()}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!picked[item.id] && (
                  <span className="text-xs text-slate-400">
                    Select an answer above to reveal the rationale.
                  </span>
                )}
                {picked[item.id] !== undefined && (
                  <button
                    onClick={() =>
                      setPicked((p) => {
                        const n = { ...p };
                        delete n[item.id];
                        return n;
                      })
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                  >
                    ↺ Try again
                  </button>
                )}
                <span className="ml-auto flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {item.category}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                    {item.clientNeed}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page} of {pages || 1}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

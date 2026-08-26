"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoriesFor, DEFAULT_EXAM, getExam } from "@/lib/exams";
import ExamTabs from "../ExamTabs";

type Item = {
  id: number;
  stem: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  category: string;
  difficulty: string;
  clientNeed: string;
};

type State = {
  done: boolean;
  result?: "pass" | "fail";
  reason?: string;
  ability?: number;
  items?: number;
  correct?: number;
};

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export default function CatClient({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [exam, setExam] = useState<string>(DEFAULT_EXAM);
  const [category, setCategory] = useState("");

  const [item, setItem] = useState<Item | null>(null);
  const [state, setState] = useState<State>({ done: false });
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [ability, setAbility] = useState(0);
  const [asked, setAsked] = useState<number[]>([]);
  const [history, setHistory] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedRef = useRef(false);

  const answered = history.length;
  const correct = history.filter(Boolean).length;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

  const fetchNext = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      exam,
      ability: String(ability),
      asked: asked.join(","),
      history: history.map((h) => (h ? "1" : "0")).join(","),
    });
    if (category) params.set("category", category);
    const res = await fetch(`/api/cat?${params}`);
    const data = await res.json();
    setLoading(false);
    setPicked(null);
    setLocked(false);
    if (data.done) {
      setState(data);
      return;
    }
    setItem(data.item);
  }, [exam, category, ability, asked, history]);

  useEffect(() => {
    if (started && !item && !state.done) void fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  function answer(i: number) {
    if (locked || !item) return;
    setPicked(i);
    setLocked(true);
    const isCorrect = i === item.correctIndex;
    setHistory((h) => [...h, isCorrect]);
    setAsked((a) => [...a, item.id]);
    setAbility((a) => {
      const w = item.difficulty === "easy" ? 0.6 : item.difficulty === "medium" ? 0.45 : 0.3;
      return Math.max(-3, Math.min(3, a + (isCorrect ? w : -w)));
    });
  }

  async function next() {
    if (state.done) return;
    await fetchNext();
  }

  // Save the attempt exactly once when the exam finishes
  useEffect(() => {
    if (!state.done || savedRef.current) return;
    savedRef.current = true;
    setSaved(true);
    void fetch("/api/cat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exam,
        category: category || "CAT Adaptive Exam",
        total: state.items ?? 0,
        correct: state.correct ?? 0,
      }),
    }).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  function restart() {
    setStarted(false);
    setItem(null);
    setState({ done: false });
    setPicked(null);
    setLocked(false);
    setAbility(0);
    setAsked([]);
    setHistory([]);
    setSaved(false);
    savedRef.current = false;
  }

  if (!isPremium) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
        <p className="text-5xl">🧠</p>
        <h1 className="mt-3 text-2xl font-bold">CAT Adaptive Exams are a Pro feature</h1>
        <p className="mt-2 text-sm text-slate-600">
          The real NCLEX adapts to you — every answer changes the next question. Unlock CAT to
          practise exactly that way.
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

  // ---------- Start screen ----------
  if (!started) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">CAT — Computerized Adaptive Test</h1>
          <p className="text-sm text-slate-500">
            The same adaptive algorithm the real NCLEX uses. Every answer changes the next question.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Minimum items" value="15" />
            <Info label="Maximum items" value="75" />
            <Info label="Passing standard" value="Ability ≥ 0" />
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <p>▸ Starts easy. Answer correctly and questions get harder; miss one and they get easier.</p>
            <p>▸ The exam stops early once it is 95% confident you are clearly above — or clearly below — the passing standard.</p>
            <p>▸ There is no timer. Focus on clinical judgement, not speed.</p>
            <p>▸ Every item includes a full rationale, and the result is saved to your Progress.</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium">Exam track</span>
              <ExamTabs value={exam} onChange={(id) => setExam(id)} />
              <p className="mt-1.5 text-xs text-slate-500">{getExam(exam).full}</p>
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium">Category focus (optional)</span>
              <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Mixed — all categories</option>
                {categoriesFor(exam).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="mt-6 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Start adaptive exam
          </button>
        </div>
      </div>
    );
  }

  // ---------- Result screen ----------
  if (state.done) {
    const passed = state.result === "pass";
    const abilityPct = Math.round(((state.ability ?? 0) + 3) / 6 * 100);
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div
          className={`rounded-2xl border p-8 text-center ${
            passed ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"
          }`}
        >
          <p className="text-5xl">{passed ? "🎉" : "📚"}</p>
          <h1 className={`mt-3 text-3xl font-bold ${passed ? "text-emerald-900" : "text-rose-900"}`}>
            {passed ? "PASS" : "BELOW STANDARD"}
          </h1>
          <p className="mt-2 text-sm text-slate-700">{state.reason}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info label="Items served" value={String(state.items ?? 0)} />
            <Info label="Correct" value={String(state.correct ?? 0)} />
            <Info
              label="Accuracy"
              value={`${Math.round(((state.correct ?? 0) / Math.max(1, state.items ?? 1)) * 100)}%`}
            />
          </div>

          {/* Ability estimate meter */}
          <div className="mt-6 text-left">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Below standard</span>
              <span>Passing standard</span>
              <span>Above standard</span>
            </div>
            <div className="relative mt-1.5 h-3 rounded-full bg-slate-200">
              <div className="absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 bg-slate-500" />
              <div
                className={`absolute top-0 h-3 rounded-full ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${abilityPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Final ability estimate: <strong>{(state.ability ?? 0).toFixed(2)}</strong> (scale −3 to +3)
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {saved ? "Result saved to your Progress." : "Saving result…"}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={restart}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              New adaptive exam
            </button>
            <Link
              href="/dashboard/progress"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold"
            >
              View progress
            </Link>
            <Link
              href="/dashboard/questions"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Review question bank
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Live exam ----------
  const pctThrough = Math.round((answered / stateMax()) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Adaptive status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3">
        <span className="text-sm font-semibold">
          Item {answered + 1}
          <span className="ml-1 text-slate-400">/ max 75</span>
        </span>
        <span className="text-xs text-slate-500">
          {correct} correct · {accuracy}% accuracy
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            ability >= 0
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}
        >
          Ability {ability >= 0 ? "+" : ""}
          {ability.toFixed(2)}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          Next: {item?.difficulty ?? "…"}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-slate-200">
        <div
          className="h-1.5 rounded-full bg-teal-500 transition-all"
          style={{ width: `${Math.min(100, pctThrough)}%` }}
        />
      </div>

      {loading || !item ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Adapting to your performance — selecting the next item…</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{item.category}</span>
            <span
              className={`rounded-full px-2.5 py-1 capitalize ${
                item.difficulty === "hard"
                  ? "bg-rose-50 text-rose-700"
                  : item.difficulty === "medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {item.difficulty}
            </span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{item.clientNeed}</span>
          </div>

          <p className="text-lg font-medium">{item.stem}</p>

          <div className="mt-4 space-y-2">
            {item.options.map((o, i) => {
              const isCorrect = i === item.correctIndex;
              const isChosen = picked === i;
              let cls = "border-slate-200 hover:border-teal-400 hover:bg-teal-50/50";
              if (locked && isCorrect) cls = "border-emerald-400 bg-emerald-50";
              else if (locked && isChosen) cls = "border-rose-400 bg-rose-50";
              else if (locked) cls = "border-slate-200 opacity-60";

              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => answer(i)}
                  className={`flex w-full items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}
                >
                  <span
                    className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                      locked && isCorrect
                        ? "bg-emerald-500 text-white"
                        : locked && isChosen
                          ? "bg-rose-500 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {"ABCD"[i]}
                  </span>
                  <span className="flex-1">{o}</span>
                </button>
              );
            })}
          </div>

          {locked && (
            <div
              className={`mt-4 rounded-xl p-4 text-sm ring-1 ${
                picked === item.correctIndex
                  ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                  : "bg-rose-50 text-rose-900 ring-rose-200"
              }`}
            >
              <p className="font-semibold">
                {picked === item.correctIndex
                  ? "✓ Correct — the algorithm will serve a harder item next."
                  : "✕ Incorrect — the algorithm will serve an easier item next."}
              </p>
              <p className="mt-1 text-slate-700">{item.rationale}</p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              disabled={!locked}
              onClick={next}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-teal-700"
            >
              Next adaptive item →
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Answering {Math.max(0, 15 - answered)} more item(s) before the earliest possible stop.
      </p>
    </div>
  );
}

function stateMax() {
  return 75;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

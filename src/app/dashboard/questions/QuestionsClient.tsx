"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriesFor, DEFAULT_EXAM, getExam } from "@/lib/exams";
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
  const [difficulty, setDifficulty] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), exam });
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (q) params.set("q", q);
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setItems(data.questions ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, exam, category, difficulty, q]);

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
        </div>
        <ExamTabs
          value={exam}
          onChange={(id) => {
            setExam(id);
            setCategory("");
            setPage(1);
          }}
        />
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
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
          <option value="">All categories</option>
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
              <ol className="mt-3 space-y-1.5 text-sm">
                {item.options.map((o, i) => {
                  const revealed = open === item.id;
                  const correct = i === item.correctIndex;
                  return (
                    <li
                      key={i}
                      className={`rounded-lg border px-3 py-2 ${
                        revealed && correct
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="mr-2 font-semibold text-slate-400">{"ABCD"[i]}.</span>
                      {o}
                    </li>
                  );
                })}
              </ol>
              <button
                onClick={() => setOpen(open === item.id ? null : item.id)}
                className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                {open === item.id ? "Hide rationale" : "Show answer & rationale"}
              </button>
              {open === item.id && (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{item.rationale}</p>
              )}
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

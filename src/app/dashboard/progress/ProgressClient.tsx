"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";

export type Attempt = {
  id: number;
  category: string;
  total: number;
  correct: number;
  createdAt: string;
};

export default function ProgressClient({ initial }: { initial: Attempt[] }) {
  const [rows, setRows] = useState(initial);
  const [, startTransition] = useTransition();
  const [optimistic, removeOptimistic] = useOptimistic(rows, (state: Attempt[], id: number) =>
    state.filter((r) => r.id !== id),
  );

  function remove(id: number) {
    startTransition(async () => {
      removeOptimistic(id);
      await fetch(`/api/attempts/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
    });
  }

  const byCategory = new Map<string, { total: number; correct: number }>();
  for (const r of optimistic) {
    const e = byCategory.get(r.category) ?? { total: 0, correct: 0 };
    e.total += r.total;
    e.correct += r.correct;
    byCategory.set(r.category, e);
  }
  const totals = optimistic.reduce(
    (a, r) => ({ total: a.total + r.total, correct: a.correct + r.correct }),
    { total: 0, correct: 0 },
  );
  const overall = totals.total ? Math.round((totals.correct / totals.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-slate-500">
          {totals.total} questions answered · {overall}% overall accuracy
        </p>
      </header>

      {optimistic.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">📈</p>
          <p className="mt-3 font-semibold text-slate-700">No quiz history yet</p>
          <p className="mt-1 text-sm text-slate-500">Complete a practice quiz to start tracking readiness.</p>
          <Link
            href="/dashboard/practice"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Start a quiz
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Accuracy by category</h2>
            <ul className="space-y-3">
              {[...byCategory.entries()].map(([cat, v]) => {
                const pct = Math.round((v.correct / Math.max(1, v.total)) * 100);
                return (
                  <li key={cat}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{cat}</span>
                      <span className="text-slate-500">
                        {v.correct}/{v.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div
                        className={`h-2.5 rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 p-5 font-semibold">Attempt history</h2>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {optimistic.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{r.category}</td>
                    <td className="px-5 py-3">
                      {r.correct}/{r.total} ({Math.round((r.correct / Math.max(1, r.total)) * 100)}%)
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

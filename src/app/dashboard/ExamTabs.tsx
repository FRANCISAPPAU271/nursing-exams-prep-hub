"use client";

import { EXAMS } from "@/lib/exams";

export default function ExamTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  // Only one exam track exists, so the switcher has nothing to do.
  if (EXAMS.length < 2) return null;

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
      {EXAMS.map((e) => (
        <button
          key={e.id}
          onClick={() => onChange(e.id)}
          title={e.full}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            value === e.id
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="mr-1.5">{e.flag}</span>
          {e.name}
        </button>
      ))}
    </div>
  );
}

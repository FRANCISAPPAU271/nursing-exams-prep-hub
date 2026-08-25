import Image from "next/image";

const TASKS = [
  {
    title: "50 pharmacology questions",
    meta: "Pharmacology · Due today",
    priority: "high",
    done: false,
    progress: 62,
  },
  {
    title: "NMC numeracy drill",
    meta: "Drug calculations · Due tomorrow",
    priority: "high",
    done: false,
    progress: 30,
  },
  {
    title: "Review acid–base balance",
    meta: "Health Assessment · Fri",
    priority: "medium",
    done: false,
    progress: 0,
  },
  {
    title: "Watch: The NMC Code explained",
    meta: "Learning library · 18 min",
    priority: "low",
    done: true,
    progress: 100,
  },
  {
    title: "Infection control quiz",
    meta: "Completed · 18/20 correct",
    priority: "low",
    done: true,
    progress: 100,
  },
];

const PRIORITY: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

/** Static, decorative mock of the study task board shown beside the hero. */
export default function TaskPreview() {
  return (
    <div className="relative" aria-hidden>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2 text-xs font-medium text-slate-500">
            My study plan — this week
          </span>
          <span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
            3 of 5 done
          </span>
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            ["Questions", "1,284"],
            ["Accuracy", "78%"],
            ["Streak", "12 days"],
          ].map(([l, v]) => (
            <div key={l} className="px-4 py-3 text-center">
              <p className="text-lg font-bold tracking-tight text-slate-900">{v}</p>
              <p className="text-[11px] text-slate-500">{l}</p>
            </div>
          ))}
        </div>

        {/* Task rows */}
        <ul className="divide-y divide-slate-100">
          {TASKS.map((t) => (
            <li key={t.title} className="flex items-start gap-3 px-4 py-3">
              <span
                className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border text-[11px] ${
                  t.done
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {t.done ? "✓" : ""}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    t.done ? "text-slate-400 line-through" : "text-slate-900"
                  }`}
                >
                  {t.title}
                </p>
                <p className="truncate text-[11px] text-slate-500">{t.meta}</p>
                {!t.done && t.progress > 0 && (
                  <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100">
                    <div
                      className="h-1 rounded-full bg-teal-500"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ${PRIORITY[t.priority]}`}
              >
                {t.priority}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-teal-700">
          + Add a study task
        </div>
      </div>

      {/* Floating photo card */}
      <div className="absolute -bottom-8 -left-6 hidden w-44 overflow-hidden rounded-2xl border-4 border-white shadow-xl lg:block">
        <Image
          src="/images/hero-nurses.jpg"
          alt="Student nurses studying together"
          width={360}
          height={260}
          priority
          className="h-28 w-full object-cover"
        />
      </div>

      {/* Floating next-up card */}
      <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:block">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Next mock exam
        </p>
        <p className="text-sm font-bold text-slate-900">NMC CBT · 120 Qs</p>
        <p className="text-[11px] text-teal-700">Scheduled Saturday</p>
      </div>
    </div>
  );
}

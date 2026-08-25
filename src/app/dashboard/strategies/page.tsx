import Link from "next/link";
import { STRATEGIES } from "@/lib/content";

export const dynamic = "force-dynamic";

const CHECKLIST = [
  "Confirm your ATT and test centre location the week before",
  "Complete at least 3 full timed mock exams",
  "Keep every category above 70% accuracy",
  "Review all missed rationales in your remediation log",
  "Pack ID, snacks and water; arrive 30 minutes early",
  "No new content the day before — rest instead",
];

export default function StrategiesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Examination strategies & tips</h1>
        <p className="text-sm text-slate-500">
          Field-tested test-taking frameworks used by candidates who pass on the first attempt.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {STRATEGIES.map((s) => (
          <article key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-teal-50 text-xl">
                {s.icon}
              </span>
              <div>
                <h2 className="font-semibold">{s.title}</h2>
                <p className="text-sm text-slate-500">{s.summary}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-teal-600">▸</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Final two-week checklist</h2>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          {CHECKLIST.map((c) => (
            <li key={c} className="flex gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-teal-600">✓</span>
              {c}
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/mock"
          className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Put it into practice — take a mock exam
        </Link>
      </section>
    </div>
  );
}

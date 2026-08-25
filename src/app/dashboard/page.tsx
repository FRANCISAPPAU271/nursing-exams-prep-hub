import { requireUser } from "@/lib/require-user";
import Link from "next/link";
import { db } from "@/db";
import { attempts, questions, tasks } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PRIORITY_STYLE, STATUS_LABEL, STATUS_STYLE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const user = await requireUser();

  const [qCount] = await db.select({ c: sql<number>`count(*)::int` }).from(questions);
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(desc(tasks.createdAt));
  const userAttempts = await db
    .select()
    .from(attempts)
    .where(eq(attempts.userId, user.id))
    .orderBy(desc(attempts.createdAt))
    .limit(6);

  const done = userTasks.filter((t) => t.completed).length;
  const answered = userAttempts.reduce((s, a) => s + a.total, 0);
  const correct = userAttempts.reduce((s, a) => s + a.correct, 0);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

  const upcoming = userTasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate?.getTime() ?? 9e15) - (b.dueDate?.getTime() ?? 9e15))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">Here is your exam readiness snapshot.</p>
        </div>
        <Link
          href="/dashboard/practice"
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Start practice quiz
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Question bank" value={qCount.c.toLocaleString()} hint="NCLEX-style items" />
        <Stat label="Study tasks" value={`${done}/${userTasks.length}`} hint="completed" />
        <Stat label="Questions answered" value={answered.toString()} hint="recent attempts" />
        <Stat label="Accuracy" value={`${accuracy}%`} hint="last 6 quizzes" accent />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/library", icon: "🎬", label: "Learning Library", d: "Videos on body systems & care plans" },
          { href: "/dashboard/mock", icon: "⏱", label: "Mock Exam", d: "75 questions, 90 minutes" },
          { href: "/dashboard/strategies", icon: "🎯", label: "Exam Strategies", d: "Test-taking playbook" },
          { href: "/dashboard/refer", icon: "🎁", label: "Refer & Earn", d: "Get 10% cash per referral" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
          >
            <p className="text-xl">{l.icon}</p>
            <p className="mt-1 font-semibold">{l.label}</p>
            <p className="text-xs text-slate-500">{l.d}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Upcoming study tasks</h2>
            <Link href="/dashboard/tasks" className="text-sm font-medium text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              title="No open tasks"
              body="Create a study task to build your review schedule."
              action={{ href: "/dashboard/tasks", label: "Add a task" }}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      {t.category} · {t.dueDate ? `Due ${t.dueDate.toLocaleDateString()}` : "No due date"} ·{" "}
                      {t.targetQuestions} questions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={PRIORITY_STYLE[t.priority]}>{t.priority}</Badge>
                    <Badge className={STATUS_STYLE[t.status]}>{STATUS_LABEL[t.status] ?? t.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Recent quiz results</h2>
          {userAttempts.length === 0 ? (
            <EmptyState
              title="No attempts yet"
              body="Take your first quiz to see performance analytics."
              action={{ href: "/dashboard/practice", label: "Start quiz" }}
            />
          ) : (
            <ul className="space-y-3">
              {userAttempts.map((a) => {
                const pct = Math.round((a.correct / Math.max(1, a.total)) * 100);
                return (
                  <li key={a.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="truncate font-medium">{a.category}</span>
                      <span className="text-slate-500">
                        {a.correct}/{a.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white"}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${className ?? ""}`}>
      {children}
    </span>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
      <Link
        href={action.href}
        className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {action.label}
      </Link>
    </div>
  );
}

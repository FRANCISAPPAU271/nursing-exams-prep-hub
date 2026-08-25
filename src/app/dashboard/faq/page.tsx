import Link from "next/link";
import { FAQS } from "@/lib/content";
import { MOMO_NUMBER } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default function FaqPage() {
  const groups = [...new Set(FAQS.map((f) => f.group))];
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Frequently asked questions</h1>
        <p className="text-sm text-slate-500">
          Everything about the question bank, payments, activation codes and study workflow.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">{g}</h2>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {FAQS.filter((f) => f.group === g).map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {f.q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <h2 className="font-semibold">Still need help?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Send a WhatsApp message to {MOMO_NUMBER} with your payment reference and we will respond
          within 24 hours.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-block rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Go to billing & activation
        </Link>
      </section>
    </div>
  );
}

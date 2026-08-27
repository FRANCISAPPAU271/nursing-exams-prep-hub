import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ghsAmount, MOMO_NETWORK, MOMO_NUMBER, MOMO_STEPS, PLANS } from "@/lib/plans";
import { FAQS, STRATEGIES } from "@/lib/content";
import { LIBRARY_SECTIONS } from "@/lib/library";
import { EXAMS } from "@/lib/exams";
import { usdWhole } from "@/lib/money";
import { REFEREE_BONUS_DAYS, REFERRAL_RATE, REFERRAL_STEPS } from "@/lib/referrals";
import SiteNav from "./(marketing)/SiteNav";
import TaskPreview from "./(marketing)/TaskPreview";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "❓",
    title: "1,000+ practice questions",
    body: "1,000+ NCLEX, Ghana NMC and Midwifery items — every one unique, tagged by category and difficulty, with a written rationale.",
  },
  {
    icon: "☑",
    title: "Study task manager",
    body: "Turn a vague plan into scheduled review blocks with priorities, due dates and question targets you can actually hit.",
  },
  {
    icon: "⏱",
    title: "Exam-accurate mock tests",
    body: "NCLEX 75 questions in 90 minutes, or the NMC CBT at 120 questions across 4 hours — with flagging and full review.",
  },
  {
    icon: "🎬",
    title: "Video learning library",
    body: "57 lessons across body systems, conditions, care planning, plus dedicated Ghana NMC licensing and Midwifery tracks.",
  },
  {
    icon: "📈",
    title: "Readiness analytics",
    body: "See accuracy by category so you stop re-reading what you know and fix what you keep missing.",
  },
  {
    icon: "🎯",
    title: "Exam strategy playbook",
    body: "Prioritisation frameworks, distractor elimination and numeracy technique used by first-attempt passers.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your free account",
    body: "No card required. The Starter plan gives you the task manager, the full question bank and every strategy guide.",
  },
  {
    n: "02",
    title: "Build your study plan",
    body: "Add review blocks by category with due dates and question targets, then work the board like a shift checklist.",
  },
  {
    n: "03",
    title: "Drill and review daily",
    body: "Run practice quizzes, read every rationale, and log what you missed so remediation is targeted, not random.",
  },
  {
    n: "04",
    title: "Simulate the real thing",
    body: "Take timed mock exams until every category sits above 70%, then walk into the test centre with evidence.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The rationales are what did it for me. I stopped memorising answers and started understanding why the other three options were wrong.",
    name: "Akosua D.",
    role: "Final-year student nurse, Kumasi",
  },
  {
    quote:
      "I work full shifts, so the task board was everything. Twenty minutes on the ward break, tracked properly, added up fast.",
    name: "Samuel A.",
    role: "Staff nurse preparing for NCLEX-RN",
  },
  {
    quote:
      "Mock exams under time pressure exposed my pacing problem weeks before test day. That alone was worth the plan.",
    name: "Priscilla O.",
    role: "Nursing graduate, Accra",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const paid = PLANS.filter((p) => p.price > 0);

  return (
    <div className="bg-white text-slate-900">
      <SiteNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                1,000+ practice questions with rationales
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                NMC exams and NCLEX{" "}
                <span className="text-teal-700">with a plan, not panic.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                One study platform for both routes to registration — the UK <strong>NMC CBT and
                Licensing Exam</strong>, the <strong>Midwifery Licensing Exam</strong> and the US/Canada{" "}
                <strong>NCLEX</strong>. Plan your revision, drill a
                huge question bank, watch focused lessons and track your readiness.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-xl bg-teal-600 px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-center font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Explore the demo
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {EXAMS.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
                  >
                    <span className="text-xl">{e.flag}</span>
                    <span>
                      <span className="block text-sm font-semibold">{e.name}</span>
                      <span className="block text-xs text-slate-500">{e.mock.label}</span>
                    </span>
                  </div>
                ))}
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {["Free plan forever", "No card required", `Pay by ${MOMO_NETWORK}`].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span className="text-teal-600">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <TaskPreview />
          </div>

          {/* Stats bar */}
          <div className="border-y border-slate-200 bg-white">
            <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-slate-200 px-5 sm:divide-x lg:grid-cols-4">
              {[
                ["1,000+", "Unique practice questions"],
                ["2", "Exam tracks: NMC & NCLEX"],
                ["47", "Video lessons"],
                ["20", "Specialty categories"],
              ].map(([v, l]) => (
                <div key={l} className="px-2 py-6 text-center">
                  <dt className="text-3xl font-bold tracking-tight text-slate-900">{v}</dt>
                  <dd className="mt-1 text-sm text-slate-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Exam tracks ──────────────────────────────────────── */}
        <Section
          id="exams"
          eyebrow="Two exam tracks"
          title="Whichever registration you are chasing"
          lede="Switch between exam banks with one tap. Questions, categories, mock format and video lessons all adapt to the exam you are sitting."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {EXAMS.map((e) => (
              <article
                key={e.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-teal-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{e.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold">{e.name}</h3>
                    <p className="text-xs font-medium text-teal-700">{e.full}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{e.blurb}</p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mock exam format
                  </p>
                  <p className="mt-1 font-semibold">{e.mock.label}</p>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categories covered
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {e.categories.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-800"
                    >
                      {c}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Start preparing for {e.name}
                </Link>
              </article>
            ))}
          </div>
        </Section>

        {/* ── Features ─────────────────────────────────────────── */}
        <Section id="features" eyebrow="Everything included" title="Built for how nurses actually study">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-xl">
                  {f.icon}
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* ── How it works ─────────────────────────────────────── */}
        <Section
          id="how"
          eyebrow="How it works"
          title="From first login to test day in four steps"
          tinted
        >
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="text-sm font-bold tracking-wider text-teal-600">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Library ──────────────────────────────────────────── */}
        <Section id="library" eyebrow="Learning library" title="Watch it explained, then test yourself">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["🫀", "Body Systems", "12 lessons", "Cardiovascular, respiratory, renal, neuro and more."],
                ["🩺", "Common Conditions", "15 lessons", "Heart failure, DKA, sepsis, stroke, preeclampsia."],
                ["📋", "Care Plans & Process", "8 lessons", "ADPIE, NANDA diagnoses, SMART goals, SBAR."],
                ["🇬🇭", "Ghana NMC Licensing", "10 lessons", "Ghana Health System, CHPS, STG, malaria and the partograph."],
                ["👶", "Midwifery Practice", "10 lessons", "Antenatal, labour, obstetric emergencies and newborn care."],
              ].map(([icon, title, count, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="mt-2 font-semibold">{title}</h3>
                  <p className="text-xs font-medium text-teal-700">{count}</p>
                  <p className="mt-1.5 text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white">
              <h3 className="text-xl font-bold">Every topic, one library</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Short, focused lessons you can watch between shifts — then jump straight into
                questions on the same topic while it is fresh.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {LIBRARY_SECTIONS.map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-teal-400">▸</span>
                    {s}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 inline-block rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-teal-400"
              >
                Browse the library
              </Link>
            </div>
          </div>
        </Section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <Section eyebrow="From our students" title="Built on what actually moves scores" tinted>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-teal-500" aria-hidden>
                  ★★★★★
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-600 text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-slate-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <Section
          id="pricing"
          eyebrow="Pricing"
          title="Start free. Upgrade when you are ready."
          lede={`Pay with ${MOMO_NETWORK} — no card, no bank account. Send to ${MOMO_NUMBER}, submit your transaction ID, and we issue your activation code once the transfer is confirmed.`}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-teal-500 bg-white shadow-xl shadow-teal-600/10 ring-1 ring-teal-500"
                    : "border-slate-200 bg-white"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.tagline}</p>
                <p className="mt-4 text-4xl font-bold tracking-tight">
                  {p.price === 0 ? "Free" : usdWhole(p.price)}
                </p>
                <p className="text-xs text-slate-500">
                  {p.months === 0 ? "forever" : `for ${p.months} month${p.months > 1 ? "s" : ""}`}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-0.5 text-teal-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p.price === 0 ? "Start free" : "Choose plan"}
                </Link>
              </div>
            ))}
          </div>

          {/* MoMo how-to */}
          <div className="mt-8 grid gap-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="rounded-xl bg-white p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                {MOMO_NETWORK}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-wide text-slate-900">{MOMO_NUMBER}</p>
              <p className="text-xs text-slate-500">All Nursing Exams Prep Hub</p>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Paying is simple</h3>
              <ol className="mt-2 grid gap-x-6 gap-y-1 text-sm text-amber-900 sm:grid-cols-2">
                {MOMO_STEPS.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-semibold">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-amber-800">
                Plans start from {usdWhole(Math.min(...paid.map((p) => p.price)))} (about GHS{" "}
                {ghsAmount(Math.min(...paid.map((p) => p.price)))}). Prices are shown in US dollars;
                Mobile Money is collected in cedis at the rate displayed on your payment page.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Refer & Earn ─────────────────────────────────────── */}
        <section id="refer" className="scroll-mt-20 bg-slate-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Refer &amp; Earn
                </span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Invite your cohort. Earn {Math.round(REFERRAL_RATE * 100)}% cash.
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Share your personal link — every friend who joins gets {REFEREE_BONUS_DAYS} days of
                  Pro free, and you earn {Math.round(REFERRAL_RATE * 100)}% of every plan they
                  activate, paid straight to your mobile money.
                </p>
              </div>
              <Link
                href="/register"
                className="rounded-xl bg-teal-500 px-6 py-3 text-center font-semibold text-slate-900 hover:bg-teal-400"
              >
                Start earning
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {REFERRAL_STEPS.map((s, i) => (
                <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="mt-2 text-xs font-semibold text-teal-400">STEP {i + 1}</p>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security ─────────────────────────────────────────── */}
        <Section
          id="security"
          eyebrow="Account security"
          title="One account. One person. One device."
          lede="Your subscription is personal. We enforce it technically so paying students are not subsidising shared logins."
          tinted
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🔐",
                title: "Single active device",
                body: "Signing in on a new device immediately signs out the previous one. Two people cannot share one password.",
              },
              {
                icon: "💧",
                title: "Traceable watermark",
                body: "Every study page carries the signed-in member's name and email, so any leaked screenshot points straight back to its source.",
              },
              {
                icon: "🚫",
                title: "Copy & print blocked",
                body: "Right-click, text selection, copy, save and printing are disabled across all paid study content.",
              },
              {
                icon: "👁",
                title: "Auto-hide & audit log",
                body: "Content blurs the moment the tab loses focus, and capture attempts are logged to your security activity page.",
              },
            ].map((f) => (
              <article key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-xl">
                  {f.icon}
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <strong className="text-slate-900">Being straight with you:</strong> no website can
            truly stop a phone camera or an operating-system screenshot — anyone claiming otherwise
            is overselling. Our controls block the easy routes and make everything else
            <em> attributable</em>, which is what actually deters sharing.
          </p>
        </Section>

        {/* ── Strategies + FAQ ─────────────────────────────────── */}
        <Section id="faq" eyebrow="Guidance" title="Strategies and answers, before you even sign up">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">Exam strategy playbook</h3>
              <p className="mt-1 text-sm text-slate-600">
                Included free on every plan — here is a taste.
              </p>
              <ul className="mt-4 space-y-3">
                {STRATEGIES.slice(0, 5).map((s) => (
                  <li
                    key={s.title}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold">{s.title}</span>
                      <span className="block text-sm text-slate-600">{s.summary}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Frequently asked questions</h3>
              <p className="mt-1 text-sm text-slate-600">
                Everything about payments, activation and studying.
              </p>
              <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {FAQS.slice(0, 8).map((f) => (
                  <details key={f.q} className="group p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                      {f.q}
                      <span className="text-slate-400 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your licence is closer than it feels.
            </h2>
            <p className="mt-3 text-lg text-teal-50">
              Join today, build your first study plan in five minutes, and start drilling questions
              that actually explain themselves.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-white px-7 py-3.5 font-semibold text-teal-700 shadow-lg transition hover:bg-teal-50"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/40 px-7 py-3.5 font-semibold transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-5 text-sm text-teal-100">
              Demo login — demo@nursingprep.app / demo1234
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white">
                ✚
              </span>
              All Nursing Exams Prep Hub
            </div>
            <p className="mt-3 text-sm text-slate-600">
              The study platform for student nurses and staff preparing for licensure and the NCLEX.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Features", "#features"],
              ["How it works", "#how"],
              ["Learning library", "#library"],
              ["Pricing", "#pricing"],
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              ["Exam strategies", "#faq"],
              ["FAQ", "#faq"],
              ["Refer & Earn", "#refer"],
            ]}
          />
          <div>
            <h4 className="text-sm font-semibold">Payments</h4>
            <p className="mt-3 text-sm text-slate-600">
              {MOMO_NETWORK}
              <span className="mt-1 block text-lg font-bold text-slate-900">{MOMO_NUMBER}</span>
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Start free
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} All Nursing Exams Prep Hub. Study content is for exam preparation and is
          not a substitute for clinical judgement or your institution&apos;s protocols.
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  lede,
  tinted,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  lede?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-16 sm:py-20 ${tinted ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          {lede && <p className="mt-3 text-slate-600">{lede}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-slate-600 transition hover:text-teal-700">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

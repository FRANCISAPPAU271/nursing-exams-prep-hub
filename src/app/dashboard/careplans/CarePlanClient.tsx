"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CARE_PLAN_CATEGORIES, CARE_PLAN_TEMPLATES } from "@/lib/careplans";

const TYPE_STYLE: Record<string, string> = {
  Assess: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Independent: "bg-teal-50 text-teal-700 ring-teal-200",
  Collaborative: "bg-violet-50 text-violet-700 ring-violet-200",
  Teach: "bg-amber-50 text-amber-700 ring-amber-200",
};

type Draft = {
  nanda: string;
  relatedTo: string;
  asEvidencedBy: string;
  goal: string;
  timeframe: string;
  interventions: { text: string; rationale: string; type: string }[];
};

const blank: Draft = {
  nanda: "",
  relatedTo: "",
  asEvidencedBy: "",
  goal: "",
  timeframe: "",
  interventions: [{ text: "", rationale: "", type: "Independent" }],
};

export default function CarePlanClient() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Builder
  const [buildMode, setBuildMode] = useState(false);
  const [baseId, setBaseId] = useState<string>("");
  const [draft, setDraft] = useState<Draft>(blank);

  const visible = useMemo(
    () =>
      CARE_PLAN_TEMPLATES.filter(
        (c) =>
          (category === "All" || c.category === category) &&
          (!query ||
            `${c.nanda} ${c.relatedTo} ${c.category}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [category, query],
  );

  function loadTemplate(id: string) {
    const t = CARE_PLAN_TEMPLATES.find((c) => c.id === id);
    if (!t) return;
    setBaseId(id);
    setDraft({
      nanda: t.nanda,
      relatedTo: t.relatedTo,
      asEvidencedBy: t.asEvidencedBy.join("; "),
      goal: `${t.goals[0]?.goal ?? ""}`,
      timeframe: t.goals[0]?.timeframe ?? "",
      interventions: t.interventions.slice(0, 4).map((i) => ({
        text: i.text,
        rationale: i.rationale,
        type: i.type,
      })),
    });
    setBuildMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startBlank() {
    setBaseId("");
    setDraft(blank);
    setBuildMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function printPlan() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Care Plans & Nursing Process</h1>
          <p className="text-sm text-slate-500">
            Evidence-based NANDA-I care plan templates you can study, adapt, and use on placement.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (buildMode ? setBuildMode(false) : startBlank())}
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {buildMode ? "← Back to library" : "+ Build a care plan"}
          </button>
        </div>
      </header>

      {/* ── Builder ───────────────────────────────────────────── */}
      {buildMode && (
        <section className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Care Plan Builder</h2>
              <p className="text-sm text-slate-500">
                {baseId
                  ? "Pre-filled from a template — edit anything, then print or export."
                  : "Follow ADPIE: Assessment data → Diagnosis → Outcome → Interventions → Evaluation."}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={baseId}
                onChange={(e) => loadTemplate(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Load a template…</option>
                {CARE_PLAN_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nanda} ({t.category})
                  </option>
                ))}
              </select>
              <button
                onClick={printPlan}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                🖨 Print
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Nursing Diagnosis (Problem)">
              <input
                className={inputCls}
                value={draft.nanda}
                onChange={(e) => setDraft({ ...draft, nanda: e.target.value })}
                placeholder="Ineffective Airway Clearance"
              />
            </Field>
            <Field label="Related To (Etiology)">
              <input
                className={inputCls}
                value={draft.relatedTo}
                onChange={(e) => setDraft({ ...draft, relatedTo: e.target.value })}
                placeholder="bronchoconstriction and retained secretions"
              />
            </Field>
            <Field label="As Evidenced By (Signs & Symptoms)">
              <textarea
                className={inputCls}
                rows={2}
                value={draft.asEvidencedBy}
                onChange={(e) => setDraft({ ...draft, asEvidencedBy: e.target.value })}
                placeholder="wheezes, dyspnea, ineffective cough"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label="Expected Outcome / Goal">
                  <input
                    className={inputCls}
                    value={draft.goal}
                    onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
                    placeholder="Client will maintain a patent airway with clear breath sounds"
                  />
                </Field>
              </div>
              <Field label="Timeframe">
                <input
                  className={inputCls}
                  value={draft.timeframe}
                  onChange={(e) => setDraft({ ...draft, timeframe: e.target.value })}
                  placeholder="Within 8 hours"
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Interventions & Rationales</p>
              <div className="space-y-3">
                {draft.interventions.map((iv, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={iv.type}
                        onChange={(e) => {
                          const n = [...draft.interventions];
                          n[i] = { ...iv, type: e.target.value };
                          setDraft({ ...draft, interventions: n });
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      >
                        {["Assess", "Independent", "Collaborative", "Teach"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      {draft.interventions.length > 1 && (
                        <button
                          onClick={() =>
                            setDraft({
                              ...draft,
                              interventions: draft.interventions.filter((_, x) => x !== i),
                            })
                          }
                          className="ml-auto rounded-lg border border-rose-200 px-2.5 py-1 text-xs text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      className={`${inputCls} mt-2`}
                      placeholder="Intervention (what you will do)"
                      value={iv.text}
                      onChange={(e) => {
                        const n = [...draft.interventions];
                        n[i] = { ...iv, text: e.target.value };
                        setDraft({ ...draft, interventions: n });
                      }}
                    />
                    <input
                      className={`${inputCls} mt-2`}
                      placeholder="Rationale (why you are doing it)"
                      value={iv.rationale}
                      onChange={(e) => {
                        const n = [...draft.interventions];
                        n[i] = { ...iv, rationale: e.target.value };
                        setDraft({ ...draft, interventions: n });
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    interventions: [
                      ...draft.interventions,
                      { text: "", rationale: "", type: "Independent" },
                    ],
                  })
                }
                className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                + Add intervention
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Care plan preview
            </p>
            <p className="mt-2 text-sm">
              <strong>{draft.nanda || "[Nursing diagnosis]"}</strong>{" "}
              {draft.relatedTo && <>related to {draft.relatedTo}</>}{" "}
              {draft.asEvidencedBy && <>as evidenced by {draft.asEvidencedBy}.</>}
            </p>
            {draft.goal && (
              <p className="mt-2 text-sm">
                <strong>Goal:</strong> {draft.goal} {draft.timeframe && <em>({draft.timeframe})</em>}
              </p>
            )}
            {draft.interventions.some((i) => i.text) && (
              <ul className="mt-3 space-y-1.5 text-sm">
                {draft.interventions
                  .filter((i) => i.text)
                  .map((iv, i) => (
                    <li key={i}>
                      <span className="font-semibold">{iv.type}:</span> {iv.text}
                      {iv.rationale && <em className="text-slate-600"> — {iv.rationale}</em>}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── Library ───────────────────────────────────────────── */}
      {!buildMode && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory("All")}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                category === "All"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {CARE_PLAN_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  category === c
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search diagnoses (e.g. airway, fluid, glucose)…"
            className={inputCls}
          />

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-4xl">📋</p>
              <p className="mt-3 font-semibold text-slate-700">No care plans match</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different keyword, or build your own from scratch.
              </p>
              <button
                onClick={startBlank}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Build a care plan
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {visible.map((t) => {
                const isOpen = openId === t.id;
                return (
                  <li
                    key={t.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : t.id)}
                      className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-700">
                            {t.category}
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                            NANDA-I
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-semibold text-slate-900">{t.nanda}</h3>
                        <p className="text-sm text-slate-500">related to {t.relatedTo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {t.interventions.length} interventions
                        </span>
                        <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 p-5">
                        <div className="grid gap-5 lg:grid-cols-2">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              As evidenced by
                            </h4>
                            <ul className="mt-2 space-y-1 text-sm text-slate-700">
                              {t.asEvidencedBy.map((e, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-teal-600">▸</span>
                                  {e}
                                </li>
                              ))}
                            </ul>

                            <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Expected outcomes
                            </h4>
                            <ul className="mt-2 space-y-1.5 text-sm">
                              {t.goals.map((g, i) => (
                                <li key={i} className="rounded-lg bg-emerald-50 p-2.5 text-emerald-950">
                                  {g.goal} <em className="text-xs">({g.timeframe})</em>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Interventions with rationales
                            </h4>
                            <ul className="mt-2 space-y-2">
                              {t.interventions.map((iv, i) => (
                                <li key={i} className="rounded-xl border border-slate-200 p-3">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${TYPE_STYLE[iv.type]}`}
                                  >
                                    {iv.type}
                                  </span>
                                  <p className="mt-1.5 text-sm text-slate-800">{iv.text}</p>
                                  <p className="mt-1 text-xs italic text-slate-500">
                                    Rationale: {iv.rationale}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                          <p className="text-xs font-bold text-amber-900">
                            ⚠ Exam pearl
                          </p>
                          <p className="mt-1 text-xs text-amber-950">{t.examTip}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => loadTemplate(t.id)}
                            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                          >
                            Adapt this care plan
                          </button>
                          <Link
                            href={`/dashboard/questions?q=${encodeURIComponent(t.nanda)}`}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                          >
                            Practice questions ↗
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

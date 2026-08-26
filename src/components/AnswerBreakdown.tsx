"use client";

import { useState } from "react";
import type { Explanation } from "@/lib/explain";

export default function AnswerBreakdown({
  explanation,
  accent = "teal",
}: {
  explanation: Explanation;
  accent?: "teal" | "indigo";
}) {
  const [open, setOpen] = useState(false);
  const wrong = explanation.verdict === "incorrect";

  const shell =
    explanation.verdict === "correct"
      ? "border-emerald-300 bg-emerald-50/70"
      : "border-rose-300 bg-rose-50/70";

  return (
    <div className={`mt-3 rounded-2xl border p-4 ${shell}`}>
      {/* Verdict */}
      <p
        className={`text-sm font-bold ${
          wrong ? "text-rose-900" : "text-emerald-900"
        }`}
      >
        {wrong ? "✕ Incorrect" : "✓ Correct"}
        {!wrong && <span className="ml-2 font-medium text-emerald-800">Well reasoned.</span>}
      </p>

      {/* Why YOUR answer is wrong */}
      {wrong && explanation.whyYourAnswerIsWrong && (
        <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-rose-200">
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
            Why your answer is wrong
          </p>
          <p className="mt-1 text-sm text-slate-800">{explanation.whyYourAnswerIsWrong}</p>
        </div>
      )}

      {/* Why the correct answer is right */}
      <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">
          Why the correct answer is right
        </p>
        <p className="mt-1 text-sm text-slate-800">{explanation.whyCorrect}</p>
      </div>

      {/* Expandable per-option breakdown */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
      >
        <span>
          {open ? "Hide" : "Show"} every option explained ({explanation.options.length})
        </span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="mt-2 space-y-2">
          {explanation.options.map((o) => {
            const isChosen = o.status === "chosen";
            const isCorrect = o.status === "correct";
            return (
              <li
                key={o.label}
                className={`rounded-xl border p-3 text-sm ${
                  isCorrect
                    ? "border-emerald-300 bg-white"
                    : isChosen
                      ? "border-rose-300 bg-white"
                      : "border-slate-200 bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${
                      isCorrect ? "bg-emerald-500" : isChosen ? "bg-rose-500" : "bg-slate-400"
                    }`}
                  >
                    {o.label}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {isCorrect
                      ? "Correct answer"
                      : isChosen
                        ? "Your answer — incorrect"
                        : "Distractor — incorrect"}
                  </span>
                </div>
                <p className="mt-1.5 text-slate-800">{o.text}</p>
                <p className="mt-1.5 text-xs text-slate-600">
                  {isCorrect
                    ? explanation.whyCorrect
                    : explainOne(o.text)}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* Concept + framework */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Key concept
          </p>
          <p className="mt-1 text-xs text-slate-700">{explanation.concept}</p>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Test-taking framework
          </p>
          <p className="mt-1 text-xs text-slate-700">{explanation.framework}</p>
        </div>
      </div>
    </div>
  );
}

/** Per-option reasoning for distractors shown in the expanded breakdown. */
function explainOne(text: string): string {
  return DISTRACTOR_REASONS(text);
}

function DISTRACTOR_REASONS(text: string): string {
  const t = text.toLowerCase();
  if (/document|record|chart/.test(t)) return "Documentation never outranks a client safety concern — chart after you act.";
  if (/reassur|don'?t worry|everything will/.test(t)) return "False reassurance dismisses the concern instead of resolving it.";
  if (/rest|relax|lie down|quiet/.test(t)) return "Comfort does not treat the cause of an unstable finding.";
  if (/wait|delay|later|reassess in/.test(t)) return "Delaying allows a developing problem to deteriorate.";
  if (/notify|call the|inform|provider|physician|doctor/.test(t)) return "Perform the safe nursing action within your scope before escalating.";
  if (/restrict|limit|avoid|npo/.test(t)) return "Restriction may be harmful when the client needs hydration, nutrition or mobility.";
  if (/ambulat|walk|mobilis|mobiliz|exercise/.test(t)) return "Activity is unsafe until instability is corrected.";
  if (/analgesi|opioid|sedat/.test(t)) return "Sedation can mask the symptoms you still need to assess.";
  if (/discharge|home|follow.?up/.test(t)) return "Discharge planning is not the priority while an active need remains.";
  if (/diet|meal|nutrition|food/.test(t)) return "Nutrition supports recovery but is a lower priority than stability.";
  if (/family|visitor|relative/.test(t)) return "The client's physiological safety always comes before family preferences.";
  if (/monitor|observation|vital sign/.test(t)) return "Monitoring alone is not an intervention — act on what you observe.";
  if (/expected|normal|common|usual/.test(t)) return "Expected findings do not require immediate action.";
  return "Does not address the priority problem in the stem, or is outside the nurse's scope of practice.";
}

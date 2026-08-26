/**
 * Answer explanation engine.
 *
 * A student who picks a wrong option learns far more from "here is why YOUR
 * choice is unsafe" than from "here is why the right answer is right". This
 * module produces a structured, four-part breakdown used consistently across
 * the question bank, practice quizzes, CAT exams and mock exams.
 */

export type ExplanationOption = {
  index: number;
  label: string;
  text: string;
};

export type Explanation = {
  verdict: "correct" | "incorrect";
  headline: string;
  /** Why the student's specific selection is wrong (only when incorrect). */
  whyYourAnswerIsWrong: string;
  /** Why the correct answer is the best answer. */
  whyCorrect: string;
  /** Per-option breakdown, including the correct option. */
  options: { label: string; text: string; status: "chosen" | "correct" | "other" }[];
  /** Clinical principle the student should take away. */
  concept: string;
  /** Which framework answers this kind of question (ABC, Maslow, Nursing Process…). */
  framework: string;
};

const FRAMEWORK_HINTS: { match: RegExp; framework: string }[] = [
  { match: /\b(airway|breath|oxygen|suction|tracheostomy|ventilat|dyspnea|dyspnoea|respirat)/i, framework: "Airway → Breathing → Circulation (ABC). Airway always outranks everything else." },
  { match: /\b(bleed|hemorrhag|haemorrhag|shock|hypotens|cardiac arrest|pulseless|code)/i, framework: "Circulation comes after airway and breathing, but beats every non-urgent concern." },
  { match: /\b(first|initial|priority|before|next action|immediately)/i, framework: "Prioritisation frameworks: ABC first, then Maslow, then acute-over-chronic." },
  { match: /\b(teach|teaching|understand|instruction|education|reinforc)/i, framework: "Client teaching questions test safety knowledge, not communication style." },
  { match: /\b(assess|evaluate|monitor|data|collect)/i, framework: "The Nursing Process: assess before you act, unless the client is in immediate danger." },
  { match: /\b(notify|provider|physician|doctor|escalat|report)/i, framework: "Do the nursing action you are trained to do before delegating upward to the provider." },
  { match: /\b(medication|administ|dose|drug|mg|mcg|IV push)/i, framework: "Medication safety: right client, drug, dose, route, time, documentation — and never ignore an abnormal vital sign." },
  { match: /\b(delegate|assistive|UAP|LPN|healthcare assistant|assign)/i, framework: "Delegation: assess, teach, evaluate and clinical judgement stay with the RN; stable tasks may be delegated." },
  { match: /\b(consent|confidential|legal|ethic|rights|refus)/i, framework: "Client rights: autonomy, informed consent and confidentiality are never overridden by convenience." },
];

function detectFramework(stem: string): string {
  for (const h of FRAMEWORK_HINTS) {
    if (h.match.test(stem)) return h.framework;
  }
  return "Read the last line of the stem first, identify exactly what is being asked, then eliminate options that are outside the nurse's scope of practice.";
}

/**
 * Build a per-option explanation. Because the bank stores a single rationale,
 * we derive targeted reasoning for each distractor from its wording so the
 * student always learns why *their* selection was unsafe.
 */
function explainDistractor(text: string, stem: string): string {
  const t = text.toLowerCase();

  // Generic-style distractors that describe non-urgent or irrelevant activity
  if (/document|record|chart/.test(t) && !/notify|report/.test(t))
    return "Documentation is always required, but it never takes priority over a client safety concern. Charting comes after you have acted.";
  if (/reassur|worry|calm|don'?t worry|everything will/.test(t))
    return "False reassurance is a blocked therapeutic response. It dismisses the client's concern instead of addressing the underlying clinical issue.";
  if (/rest|relax|lie down|quiet|sleep/.test(t) && !/position/.test(t))
    return "Rest may be comforting, but it does not treat the cause. Comfort measures never outrank an unstable clinical finding.";
  if (/wait|delay|later|reassess in|in a few hours|next round|morning/.test(t))
    return "Delaying action allows a developing problem to deteriorate. When a client shows a change in condition, act now and reassess continuously afterwards.";
  if (/call|notify|inform|contact|provider|physician|doctor/.test(t) && !/emergency|rapid response/.test(t))
    return "You must perform the nursing action within your own scope before escalating. 'Notify the provider' is incorrect when a safe independent intervention exists.";
  if (/fluid|water|drink|hydrate/.test(t) && !/restrict|limit/.test(t))
    return "Fluids help in some conditions but are contraindicated or restricted in others. Always match the intervention to this client's specific pathophysiology.";
  if (/restrict|limit|avoid|forbid|npo|nothing by mouth/.test(t))
    return "Restrictions are appropriate in some situations but harmful when the client actually needs nutrition, hydration, or mobility.";
  if (/ambulat|walk|mobilis|mobiliz|exercise|activity/.test(t))
    return "Activity and mobility are therapeutic goals, but they are unsafe until the underlying instability has been corrected.";
  if (/analgesi|pain relief|pain medication|opioid|sedat/.test(t))
    return "Analgesia is important, but sedating medication can mask the very symptoms you need to assess. Treat the cause first, then manage comfort.";
  if (/antibiotic|antiemetic|antipyretic|laxative|supplement/.test(t))
    return "This treats a symptom rather than the priority problem, and it may be contraindicated in this client's condition.";
  if (/discharge|home|go home|follow.?up|appointment/.test(t))
    return "Discharge planning matters, but it is not the priority while the client still has an active, unresolved clinical need.";
  if (/diet|meal|nutrition|food|snack|tray/.test(t))
    return "Nutrition supports recovery but is a lower priority than physiological stability.";
  if (/family|visitor|relative|carer/.test(t))
    return "Family needs are valid, but the client's physiological safety always comes first.";
  if (/saturation|vital sign|observation|monitor|obs/.test(t))
    return "Monitoring alone is not an intervention. If the finding is abnormal, you must also act on what you observe.";
  if (/position|elevat|fowler|lateral|prone|supine/.test(t))
    return "Positioning is a genuine nursing intervention, but it is not the highest priority for this client's presentation.";
  if (/expected|normal|common|usual|within normal/.test(t))
    return "This is an expected or non-urgent finding. Expected findings do not require immediate action, so they are never the priority.";

  // ── Specific distractor families used across the bank ────────────────
  if (/menu|meal tray|food choice|lunch|tray|diet order/.test(t))
    return "Menu and dietary preferences are comfort-level requests with no bearing on client stability. They are never the priority finding or action.";
  if (/amylase|visual acuity|baseline height|baseline weight|height and weight|admission survey|satisfaction/.test(t))
    return "This datum is not the parameter that reflects this client's condition. Choose the result that directly measures the problem named in the stem.";
  if (/stop all|stop my|once i feel better|double my next dose|double the dose|miss one|skip a dose/.test(t))
    return "Stopping medication early or doubling a missed dose is unsafe. Reinforce completing the prescribed course and never self-adjusting doses.";
  if (/follow.?up|appointment|avoid.*visits|unless i have/.test(t))
    return "Attending follow-up is essential for detecting deterioration. Clients must never wait for severe symptoms before returning.";
  if (/visiting hours|admission survey|satisfaction|completed the admission/.test(t))
    return "Administrative and comfort tasks do not influence this client's clinical outcome and cannot be the essential assessment.";
  if (/without a prescription|no prescription|prescription/.test(t) && /limit|restrict|increase/.test(t))
    return "Nurses never institute a restriction or increase therapy without a valid prescription. Independent actions must stay within legal scope.";
  if (/restrict all visitors|no visitors|forbid visit/.test(t))
    return "Blanket visitor restriction is unnecessarily restrictive and is not an evidence-based intervention for this condition.";
  if (/strict bed rest indefinitely|indefinitely/.test(t))
    return "Prolonged immobility causes deconditioning, pressure injury, pneumonia and venous thromboembolism. Activity is progressed as tolerated.";
  if (/sedation|sedate|probably needs/.test(t))
    return "Suggesting sedation is a judgemental, unsafe conclusion. It masks symptoms and avoids assessing the real cause of anxiety.";
  if (/doing poorly|uncooperative|refused everything|appears/.test(t))
    return "This entry is subjective and judgemental. Objective documentation must state the specific finding, the action taken, and who was notified.";
  if (/escalating doses|rescue medication|increasing intensity|increasing symptoms/.test(t))
    return "Rising symptom intensity or escalating rescue medication indicates the treatment plan is failing, not succeeding.";
  if (/sleeps more than|sleeping|sleep/.test(t))
    return "Excessive sleepiness is not a marker of therapeutic success and may signal deterioration or oversedation.";
  if (/evaluating the .*response|interpreting|clinical judgement|assess the client's response/.test(t))
    return "Evaluation of a client's response to therapy requires licensed nursing judgement and cannot be delegated to support staff.";
  if (/teaching the (patient|client|p) /.test(t))
    return "Client and family teaching is a licensed nursing responsibility and may not be delegated to support staff.";
  if (/discharge information|awaiting discharge|discharge teach/.test(t))
    return "Discharge teaching can safely wait. An unstable or newly changed client takes priority using the ABC framework.";
  if (/analgesia review|routine pain|routine medication|refill/.test(t))
    return "Routine, non-urgent medication requests are lower priority than a client with an actual change in condition.";
  if (/ordering lunch|help ordering|assistance with the menu/.test(t))
    return "Assistance with activities of daily living is important but never takes priority over a physiological concern.";
  if (/height and weight|height or weight|anthropometric/.test(t))
    return "Anthropometric data is a baseline measure and does not reflect this client's current acute status.";
  if (/visual acuity|screening/.test(t))
    return "Screening data is unrelated to the pathophysiology in the stem and does not guide this client's treatment.";

  // Fall-through: tie the distractor back to what the stem is really testing
  return "This option does not address the priority problem identified in the stem. It is either a lower-priority concern, outside the nurse's scope of practice, or unsafe for this client's condition.";
}

function explainCorrect(text: string, stem: string, rationale: string): string {
  return `${rationale} Of all the options offered, only this one addresses the priority identified in the stem while remaining within the nurse's legal scope of practice.`;
}

export function buildExplanation(args: {
  stem: string;
  rationale: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number | null;
  clientNeed?: string;
  category?: string;
}): Explanation {
  const { stem, rationale, options, correctIndex, chosenIndex } = args;
  const isCorrect = chosenIndex === correctIndex;
  const chosenText = chosenIndex !== null ? options[chosenIndex] : null;

  const optionRows = options.map((text, i) => ({
    label: "ABCD"[i] ?? String(i + 1),
    text,
    status:
      chosenIndex !== null && i === chosenIndex
        ? ("chosen" as const)
        : i === correctIndex
          ? ("correct" as const)
          : ("other" as const),
  }));

  return {
    verdict: isCorrect ? "correct" : "incorrect",
    headline: isCorrect
      ? "Correct — well reasoned."
      : chosenIndex === null
        ? "Not answered."
        : "Incorrect — let's work out why.",
    whyYourAnswerIsWrong:
      chosenText && !isCorrect
        ? `${explainDistractor(chosenText, stem)} You selected: "${chosenText}".`
        : "",
    whyCorrect: explainCorrect(
      options[correctIndex],
      stem,
      rationale,
    ),
    options: optionRows,
    concept: rationale,
    framework: detectFramework(stem),
  };
}

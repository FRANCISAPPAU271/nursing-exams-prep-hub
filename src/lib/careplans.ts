export type CarePlanTemplate = {
  id: string;
  category: string;
  nanda: string;
  relatedTo: string;
  asEvidencedBy: string[];
  goals: { goal: string; timeframe: string }[];
  interventions: { type: "Assess" | "Independent" | "Collaborative" | "Teach"; text: string; rationale: string }[];
  evaluation: string;
  examTip: string;
};

export const CARE_PLAN_CATEGORIES = [
  "Cardiovascular",
  "Respiratory",
  "Renal & Fluid",
  "Endocrine",
  "Neurological",
  "Gastrointestinal",
  "Safety & Infection",
  "Mobility & Skin",
  "Psychosocial",
  "Maternal & Newborn",
  "Pediatric",
];

export const CARE_PLAN_TEMPLATES: CarePlanTemplate[] = [
  {
    id: "ineffective-airway",
    category: "Respiratory",
    nanda: "Ineffective Airway Clearance",
    relatedTo: "bronchoconstriction, increased mucus production, and retained secretions",
    asEvidencedBy: [
      "Adventitious breath sounds (wheezes, crackles)",
      "Dyspnea and use of accessory muscles",
      "Ineffective or absent cough",
      "Abnormal arterial blood gases",
    ],
    goals: [
      { goal: "Client will maintain a patent airway with clear breath sounds bilaterally", timeframe: "Within 8 hours" },
      { goal: "Client will effectively expectorate secretions", timeframe: "Before discharge" },
    ],
    interventions: [
      { type: "Assess", text: "Auscultate lung sounds in all lobes at least every 4 hours.", rationale: "Identifies the presence and location of secretions or bronchospasm." },
      { type: "Independent", text: "Position in high-Fowler's (semi-sitting) position.", rationale: "Maximizes lung expansion and lowers the diaphragm for easier breathing." },
      { type: "Independent", text: "Encourage deep breathing, incentive spirometry, and coughing every hour while awake.", rationale: "Mobilizes and expectorates secretions to keep airways patent." },
      { type: "Independent", text: "Increase fluid intake to 2–3 L/day unless contraindicated.", rationale: "Hydration thins secretions so they are easier to clear." },
      { type: "Collaborative", text: "Administer prescribed bronchodilators and mucolytics; suction only when indicated.", rationale: "Pharmacologically opens airways; suction removes secretions the client cannot clear." },
      { type: "Teach", text: "Teach effective coughing technique and when to call the provider for worsening dyspnea.", rationale: "Promotes self-management and early recognition of deterioration." },
    ],
    evaluation: "Breath sounds clear bilaterally; client expectorating effectively without distress; ABGs within reference range.",
    examTip: "Airway is always the first priority. If a question offers 'maintain a patent airway' alongside any other intervention, airway wins.",
  },
  {
    id: "excess-fluid",
    category: "Renal & Fluid",
    nanda: "Excess Fluid Volume",
    relatedTo: "impaired regulatory mechanisms (heart failure or renal compromise)",
    asEvidencedBy: [
      "Peripheral edema and jugular venous distention",
      "Crackles on auscultation and dyspnea",
      "Weight gain of 1–2 kg in 24 hours",
      "Hypertension with bounding pulses",
    ],
    goals: [
      { goal: "Client will demonstrate reduced fluid overload (decreased edema, clear lung sounds)", timeframe: "Within 72 hours" },
      { goal: "Client will verbalize dietary and fluid restrictions correctly", timeframe: "Before discharge" },
    ],
    interventions: [
      { type: "Assess", text: "Weigh daily at the same time on the same scale; monitor intake and output strictly.", rationale: "Daily weight is the most reliable indicator of fluid balance change." },
      { type: "Independent", text: "Position with head of bed elevated and support edematous extremities.", rationale: "Reduces venous congestion and promotes fluid redistribution." },
      { type: "Independent", text: "Restrict sodium and fluid as prescribed.", rationale: "Prevents further fluid retention and hypertension." },
      { type: "Collaborative", text: "Administer prescribed loop diuretics (e.g., furosemide) and monitor serum potassium.", rationale: "Diuretics remove excess volume; loop diuretics waste potassium, creating hypokalemia risk." },
      { type: "Teach", text: "Teach the client to report a gain of more than 1–1.5 kg (2–3 lb) in 24 hours.", rationale: "Early reporting prevents acute decompensation and readmission." },
    ],
    evaluation: "Edema decreased; lungs clear; weight trending down; potassium within reference range.",
    examTip: "Daily weight is the best indicator of fluid status — better than intake/output or skin turgor.",
  },
  {
    id: "unstable-glucose",
    category: "Endocrine",
    nanda: "Risk for Unstable Blood Glucose Level",
    relatedTo: "insufficient insulin production or ineffective self-management",
    asEvidencedBy: ["Risk diagnosis — no current signs and symptoms; monitor for polyuria, polydipsia, and polyphagia"],
    goals: [
      { goal: "Client will maintain blood glucose within 70–180 mg/dL", timeframe: "During hospitalization" },
      { goal: "Client will correctly demonstrate insulin self-administration", timeframe: "Before discharge" },
    ],
    interventions: [
      { type: "Assess", text: "Monitor capillary blood glucose before meals and at bedtime.", rationale: "Identifies hyperglycemia and hypoglycemia trends to guide therapy." },
      { type: "Assess", text: "Watch for diaphoresis, tremor, confusion, and irritability.", rationale: "These are early signs of hypoglycemia, which can progress to seizures and coma." },
      { type: "Independent", text: "Ensure meals are delivered within 15–30 minutes of rapid-acting insulin.", rationale: "Prevents hypoglycemia from insulin peaking before food absorption." },
      { type: "Collaborative", text: "Hold metformin before and 48 hours after iodinated contrast studies.", rationale: "Prevents contrast-induced nephropathy and lactic acidosis." },
      { type: "Teach", text: "Teach the Rule of 15 for hypoglycemia: 15 g fast-acting carbohydrate, recheck in 15 minutes.", rationale: "Enables safe, prompt self-treatment of hypoglycemic episodes." },
    ],
    evaluation: "Glucose maintained in target range; client demonstrates correct technique and verbalizes hypoglycemia signs.",
    examTip: "For hypoglycemia in a conscious client, give 15 g fast-acting carbs — never give juice to an unconscious client (aspiration risk); use D50 IV or glucagon.",
  },
  {
    id: "acute-pain",
    category: "Cardiovascular",
    nanda: "Acute Pain",
    relatedTo: "imbalance between myocardial oxygen supply and demand",
    asEvidencedBy: [
      "Reports of crushing substernal chest pressure radiating to jaw or left arm",
      "Diaphoresis, nausea, and restlessness",
      "Guarding behaviour and elevated blood pressure",
    ],
    goals: [
      { goal: "Client will report chest pain reduced from severe to 3/10 or less", timeframe: "Within 30 minutes" },
      { goal: "Client will remain hemodynamically stable with no evidence of infarct extension", timeframe: "During hospitalization" },
    ],
    interventions: [
      { type: "Assess", text: "Assess pain location, quality, radiation, and severity on a 0–10 scale; obtain a 12-lead ECG immediately.", rationale: "Differentiates angina from infarction and identifies ST-segment changes requiring emergency reperfusion." },
      { type: "Independent", text: "Place on bed rest with head of bed elevated; reduce environmental stimulation.", rationale: "Lowers myocardial oxygen demand during the acute phase." },
      { type: "Independent", text: "Apply oxygen to keep SpO2 ≥ 90%.", rationale: "Maximizes oxygen delivery to ischemic myocardium." },
      { type: "Collaborative", text: "Administer prescribed nitroglycerin, morphine, and chewable aspirin (MONA).", rationale: "Nitroglycerin reduces preload; morphine relieves pain and anxiety; aspirin limits platelet aggregation." },
      { type: "Collaborative", text: "Monitor troponin I and creatine kinase-MB at prescribed intervals.", rationale: "Trending cardiac biomarkers confirms or excludes myocardial injury." },
      { type: "Teach", text: "Teach the client to report recurring chest pain immediately and never to take sildenafil with nitrates.", rationale: "Combining nitrates with PDE5 inhibitors causes life-threatening hypotension." },
    ],
    evaluation: "Pain controlled to 3/10 or less; ECG stable; troponin trending appropriately; client resting comfortably.",
    examTip: "Never give nitroglycerin if systolic BP is below 90 mmHg, or if the client took sildenafil in the last 24–48 hours.",
  },
  {
    id: "risk-infection",
    category: "Safety & Infection",
    nanda: "Risk for Infection",
    relatedTo: "inadequate primary defenses, immunosuppression, and invasive procedures",
    asEvidencedBy: ["Risk diagnosis — monitor for fever, redness, swelling, purulent drainage, and rising WBC"],
    goals: [
      { goal: "Client will remain free from signs of systemic infection", timeframe: "During hospitalization" },
      { goal: "Client and family will demonstrate correct hand hygiene technique", timeframe: "Within 24 hours" },
    ],
    interventions: [
      { type: "Assess", text: "Monitor temperature, WBC with differential, and incision or insertion sites every shift.", rationale: "Early identification of infection allows prompt treatment before sepsis develops." },
      { type: "Independent", text: "Perform hand hygiene before and after every client contact; use soap and water for C. difficile.", rationale: "Hand hygiene is the single most effective infection-control measure; alcohol rub does not kill C. difficile spores." },
      { type: "Independent", text: "Maintain a closed urinary drainage system with the bag below bladder level.", rationale: "Prevents ascending contamination that causes catheter-associated UTI." },
      { type: "Independent", text: "Use aseptic non-touch technique for all wound care and invasive procedures.", rationale: "Protects key sites from microbial transfer." },
      { type: "Collaborative", text: "For neutropenia (ANC < 1,000), institute protective isolation and remove fresh flowers and raw foods.", rationale: "The immunosuppressed client cannot mount a normal defence against opportunistic organisms." },
      { type: "Teach", text: "Teach clients and visitors hand hygiene and respiratory etiquette.", rationale: "Reduces cross-transmission between clients, staff, and visitors." },
    ],
    evaluation: "No signs of infection; temperature and WBC within reference range; client demonstrates correct hygiene.",
    examTip: "In a neutropenic client, a temperature of 38.0 °C (100.4 °F) is a medical emergency — treat as sepsis until proven otherwise.",
  },
  {
    id: "impaired-mobility",
    category: "Mobility & Skin",
    nanda: "Impaired Physical Mobility",
    relatedTo: "decreased muscle strength, pain, and prescribed immobilization",
    asEvidencedBy: [
      "Reluctance or inability to move purposefully",
      "Decreased muscle strength and range of motion",
      "Dependence on assistance for transfers",
    ],
    goals: [
      { goal: "Client will increase range of motion and strength in affected extremities", timeframe: "Within 1 week" },
      { goal: "Client will transfer with minimal assistance", timeframe: "Before discharge" },
    ],
    interventions: [
      { type: "Assess", text: "Assess level of mobility, muscle strength (0–5 scale), and neurovascular status every shift.", rationale: "Establishes a baseline and detects complications such as compartment syndrome early." },
      { type: "Independent", text: "Reposition every 2 hours and offload bony prominences.", rationale: "Prevents pressure injury and respiratory stasis from prolonged immobility." },
      { type: "Independent", text: "Perform passive then active range-of-motion exercises as tolerated.", rationale: "Maintains joint flexibility and prevents contractures and venous stasis." },
      { type: "Independent", text: "Encourage use of the incentive spirometer and deep breathing hourly while awake.", rationale: "Immobility promotes atelectasis and pneumonia; spirometry expands alveoli." },
      { type: "Collaborative", text: "Refer to physiotherapy and administer prescribed analgesia 30 minutes before activity.", rationale: "Pain control enables fuller participation in rehabilitation." },
      { type: "Teach", text: "Teach the client to call for assistance before attempting unassisted transfers.", rationale: "Prevents falls, the leading cause of inpatient injury." },
    ],
    evaluation: "Client demonstrates improved strength and transfers with minimal assistance; skin intact; no falls.",
    examTip: "Unrelieved pain on passive stretch in a casted limb indicates compartment syndrome — an emergency, not something to medicate and wait on.",
  },
  {
    id: "risk-pressure-injury",
    category: "Mobility & Skin",
    nanda: "Risk for Pressure Injury",
    relatedTo: "immobility, altered nutrition, moisture, and sensory impairment",
    asEvidencedBy: ["Risk diagnosis — monitor for non-blanchable erythema over bony prominences"],
    goals: [
      { goal: "Client will remain free from pressure injury", timeframe: "Throughout hospitalization" },
      { goal: "Client will consume adequate protein and calories for wound healing", timeframe: "During stay" },
    ],
    interventions: [
      { type: "Assess", text: "Calculate a Braden Scale score on admission and every shift; inspect skin under dressings daily.", rationale: "Scores below 18 indicate high risk and trigger a prevention protocol." },
      { type: "Independent", text: "Reposition at least every 2 hours using a written turn schedule; use a 30-degree lateral position.", rationale: "Offloads pressure while avoiding direct pressure over the trochanter." },
      { type: "Independent", text: "Keep skin clean and dry; apply barrier cream and manage incontinence promptly.", rationale: "Moisture macerates skin and dramatically accelerates breakdown." },
      { type: "Independent", text: "Never massage reddened bony prominences.", rationale: "Massage damages already-compromised capillary beds and deepens tissue injury." },
      { type: "Collaborative", text: "Provide a pressure-redistributing mattress and consult the dietitian for protein supplementation.", rationale: "Redistributes interface pressure; protein is essential for collagen synthesis and healing." },
      { type: "Teach", text: "Teach the family repositioning intervals and early warning signs of skin breakdown.", rationale: "Sustains prevention after discharge." },
    ],
    evaluation: "Skin remains intact; Braden score stable or improved; client receiving adequate nutrition.",
    examTip: "Stage 1 pressure injury is non-blanchable erythema with intact skin — the skin is NOT broken at this stage.",
  },
  {
    id: "ineffective-coping",
    category: "Psychosocial",
    nanda: "Ineffective Coping",
    relatedTo: "situational crisis and inadequate social support",
    asEvidencedBy: [
      "Verbalization of inability to cope or ask for help",
      "Sleep disturbance and poor appetite",
      "Withdrawal from social interaction",
    ],
    goals: [
      { goal: "Client will verbalize at least two adaptive coping strategies", timeframe: "Within 72 hours" },
      { goal: "Client will engage in therapeutic group activities", timeframe: "Before discharge" },
    ],
    interventions: [
      { type: "Assess", text: "Assess suicide risk directly and establish a safety plan; maintain one-to-one observation if indicated.", rationale: "Direct enquiry does not increase risk; safety is always the first priority in mental health care." },
      { type: "Independent", text: "Establish a therapeutic relationship using open-ended, non-judgemental communication.", rationale: "Rapport is the foundation of effective psychiatric intervention." },
      { type: "Independent", text: "Maintain a low-stimulation, calm, and consistent environment.", rationale: "Reduces agitation and the likelihood of escalation." },
      { type: "Independent", text: "Encourage the client to identify feelings and previous successful coping strategies.", rationale: "Builds on existing strengths rather than introducing unfamiliar techniques." },
      { type: "Collaborative", text: "Administer prescribed anxiolytics or antidepressants and monitor for adverse effects.", rationale: "Pharmacotherapy reduces symptom burden so the client can engage in therapy." },
      { type: "Teach", text: "Teach relaxation, grounding, and breathing techniques the client can use independently.", rationale: "Provides portable, drug-free tools for managing acute anxiety." },
    ],
    evaluation: "Client verbalizes adaptive coping strategies and engages in unit activities; no self-harm episodes.",
    examTip: "In mental health questions, therapeutic communication always comes before pharmacology — acknowledge feelings and stay open-ended.",
  },
  {
    id: "risk-fetal-injury",
    category: "Maternal & Newborn",
    nanda: "Risk for Fetal Injury",
    relatedTo: "uteroplacental insufficiency and elevated maternal blood pressure",
    asEvidencedBy: ["Risk diagnosis — monitor for late decelerations, decreased fetal movement, and maternal hypertension"],
    goals: [
      { goal: "Fetus will maintain a normal heart rate pattern with good variability", timeframe: "Throughout labor and hospitalization" },
      { goal: "Mother will remain free from seizures", timeframe: "During hospitalization" },
    ],
    interventions: [
      { type: "Assess", text: "Monitor blood pressure, deep tendon reflexes, urine protein, and headache or visual changes.", rationale: "Rising reflexes with headache and visual disturbance precede eclamptic seizures." },
      { type: "Assess", text: "Evaluate the fetal heart tracing for late decelerations and absent variability.", rationale: "Late decelerations indicate uteroplacental insufficiency and fetal hypoxia." },
      { type: "Independent", text: "Position the client in left lateral tilt / side-lying position.", rationale: "Relieves vena caval compression and improves placental perfusion." },
      { type: "Independent", text: "Discontinue uterotonic infusions and increase IV fluids if decelerations occur.", rationale: "Reducing contractions restores placental blood flow between contractions." },
      { type: "Collaborative", text: "Administer prescribed magnesium sulfate with calcium gluconate available at the bedside.", rationale: "Magnesium prevents seizures; calcium gluconate is the specific antidote for magnesium toxicity." },
      { type: "Teach", text: "Teach the client to report headache, blurred vision, epigastric pain, or decreased fetal movement immediately.", rationale: "These are red flags for worsening preeclampsia and fetal compromise." },
    ],
    evaluation: "Fetal heart tracing reassuring; maternal blood pressure controlled; no seizure activity; reflexes normal.",
    examTip: "Absent deep tendon reflexes with respiratory depression in a client on magnesium sulfate means toxicity — stop the infusion and give calcium gluconate.",
  },
  {
    id: "fluid-deficit-child",
    category: "Pediatric",
    nanda: "Deficient Fluid Volume",
    relatedTo: "excessive losses from vomiting, diarrhea, and fever",
    asEvidencedBy: [
      "Sunken fontanelle and dry mucous membranes",
      "Decreased urine output and concentrated urine",
      "Tachycardia with poor skin turgor",
    ],
    goals: [
      { goal: "Child will demonstrate hydration (moist mucous membranes, adequate wet diapers)", timeframe: "Within 24 hours" },
      { goal: "Child will maintain normal electrolyte values", timeframe: "During treatment" },
    ],
    interventions: [
      { type: "Assess", text: "Monitor fontanelle, mucous membranes, skin turgor, and weight; count wet diapers.", rationale: "Infants cannot verbalize thirst; objective markers detect dehydration earliest." },
      { type: "Assess", text: "Weigh the child daily on the same scale.", rationale: "In children, acute weight change most accurately reflects fluid loss or gain." },
      { type: "Independent", text: "Offer oral rehydration solution in small, frequent amounts (5 mL every 5 minutes).", rationale: "Small volumes are better tolerated and reduce vomiting while restoring volume." },
      { type: "Independent", text: "Avoid plain water and highly sugared drinks in infants.", rationale: "These lack electrolytes and can cause hyponatremia or worsen diarrhea." },
      { type: "Collaborative", text: "Administer IV isotonic fluids as prescribed when oral rehydration is not tolerated.", rationale: "Restores circulating volume and corrects electrolyte imbalance." },
      { type: "Teach", text: "Teach caregivers the signs of dehydration and when to return to hospital.", rationale: "Prevents progression to hypovolemic shock after discharge." },
    ],
    evaluation: "Child hydrated with adequate output; electrolytes normal; caregiver verbalizes warning signs.",
    examTip: "In infants, the earliest reliable sign of dehydration is decreased urine output and a sunken fontanelle — not thirst.",
  },
];

export function getCarePlan(id: string) {
  return CARE_PLAN_TEMPLATES.find((c) => c.id === id);
}

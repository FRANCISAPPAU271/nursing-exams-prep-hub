export type LessonSeed = {
  exam?: string;
  title: string;
  description: string;
  section: string;
  topic: string;
  durationMin: number;
  searchQuery: string;
  premium: boolean;
};

export const LIBRARY_SECTIONS = [
  "App Orientation",
  "Body Systems",
  "Common Conditions",
  "Care Plans & Nursing Process",
  "NMC UK Registration",
];

const bodySystems: [string, string, number][] = [
  ["Cardiovascular System", "Heart chambers, conduction, cardiac output, perfusion and hemodynamics.", 18],
  ["Respiratory System", "Ventilation, gas exchange, acid-base balance and airway assessment.", 16],
  ["Neurological System", "Cranial nerves, ICP, GCS scoring and neuro assessment techniques.", 20],
  ["Gastrointestinal System", "Digestion, liver function, GI bleeding and nutrition support.", 15],
  ["Renal & Urinary System", "Filtration, fluid balance, electrolytes and dialysis basics.", 17],
  ["Endocrine System", "Pituitary, thyroid, adrenal and pancreatic hormone regulation.", 19],
  ["Musculoskeletal System", "Bones, joints, fractures, traction and mobility care.", 14],
  ["Integumentary System", "Skin layers, wound healing stages and pressure injury staging.", 12],
  ["Hematologic System", "Blood cells, clotting cascade, anemias and transfusion therapy.", 16],
  ["Immune & Lymphatic System", "Immunity types, inflammation, HIV and autoimmune disorders.", 15],
  ["Reproductive System", "Male and female anatomy, fertility and obstetric physiology.", 14],
  ["Sensory System", "Vision, hearing, and care of the client with sensory deficits.", 11],
];

const conditions: [string, string, number][] = [
  ["Heart Failure", "Left vs right sided failure, signs, drugs and client teaching.", 18],
  ["Myocardial Infarction", "STEMI recognition, MONA, reperfusion and post-MI care.", 16],
  ["Hypertension", "Staging, lifestyle changes, antihypertensives and adherence.", 13],
  ["COPD & Asthma", "Exacerbation management, inhaler technique and oxygen targets.", 19],
  ["Pneumonia & Tuberculosis", "Assessment, isolation precautions and antibiotic regimens.", 17],
  ["Diabetes Mellitus", "Type 1 vs 2, DKA vs HHS, insulins and sick-day rules.", 22],
  ["Chronic Kidney Disease", "Staging, diet restrictions, dialysis and anemia management.", 18],
  ["Stroke (CVA)", "FAST screening, thrombolytics, dysphagia and rehab priorities.", 20],
  ["Liver Cirrhosis", "Portal hypertension, ascites, encephalopathy and lactulose.", 16],
  ["Sepsis & Shock", "Sepsis bundles, lactate, fluid resuscitation and vasopressors.", 21],
  ["Preeclampsia", "Magnesium sulfate therapy, seizure precautions and delivery.", 15],
  ["Sickle Cell Disease", "Crisis triggers, hydration, oxygenation and pain control.", 14],
  ["Schizophrenia & Bipolar Disorder", "Symptoms, antipsychotics, lithium safety and therapeutic communication.", 20],
  ["Cancer & Chemotherapy Care", "Neutropenic precautions, side effects and palliative principles.", 19],
  ["Fluid & Electrolyte Imbalances", "Sodium, potassium, calcium and magnesium quick reference.", 23],
];

const carePlans: [string, string, number][] = [
  ["The Nursing Process (ADPIE) Explained", "Assessment, diagnosis, planning, implementation and evaluation.", 17],
  ["Writing NANDA Nursing Diagnoses", "Problem, etiology and signs/symptoms — the PES format.", 14],
  ["SMART Goals & Expected Outcomes", "Turning diagnoses into measurable, time-bound client outcomes.", 12],
  ["Building a Care Plan Step by Step", "A worked example from admission data to evaluation.", 21],
  ["Prioritization: Maslow, ABC & Safety", "Frameworks that decide which client you see first.", 16],
  ["Concept Mapping for Nursing Students", "Linking pathophysiology, findings and interventions visually.", 15],
  ["SBAR & Clinical Documentation", "Handoff communication and legally sound charting.", 13],
  ["Delegation & Scope of Practice", "RN vs LPN vs UAP — what can safely be delegated.", 14],
];

const nmcLessons: [string, string, number][] = [
  ["NMC CBT Part 1: Format & Pass Mark", "What the Test of Competence covers, how the numeracy and clinical papers are scored, and booking through Pearson VUE.", 14],
  ["The NMC Code Explained", "Prioritise people, practise effectively, preserve safety and promote professionalism — with exam-style examples.", 18],
  ["Numeracy for the CBT", "Tablets, liquids, infusion rates, drops per minute and weight-based dosing worked step by step.", 22],
  ["Mental Capacity Act & Consent (UK)", "Capacity assessment, best interests, DoLS and advance decisions as they appear in the CBT.", 17],
  ["Safeguarding in UK Practice", "Adults at risk, child protection, Gillick competence, PREVENT and mandatory FGM reporting.", 19],
  ["NEWS2 & Escalation", "Scoring, trigger thresholds and what the UK escalation response should be.", 13],
  ["Sepsis Six & UK Sepsis Pathways", "Recognition, the one-hour bundle and how it is examined.", 12],
  ["OSCE: The Four Assessment Stations", "Assessment, planning, implementation and evaluation — what examiners look for.", 21],
  ["OSCE: Practical Skills Walkthrough", "ANTT dressing, IM injection, catheterisation, NG tube and in-hospital resuscitation.", 24],
  ["Revalidation & Professional Accountability", "Practice hours, CPD, reflective accounts, confirmation and delegation responsibility.", 15],
];

export const LESSON_SEEDS: LessonSeed[] = [
  {
    title: "Welcome: How to Use All Nursing Exams Prep Hub",
    description:
      "A guided tour of the dashboard: building study tasks, searching the 20,000-question bank, running practice quizzes, taking mock exams and reading your progress analytics.",
    section: "App Orientation",
    topic: "Getting Started",
    durationMin: 9,
    searchQuery: "how to use an nclex study app orientation walkthrough",
    premium: false,
  },
  {
    title: "Build Your 6-Week NCLEX Study Plan",
    description:
      "Use the task manager to schedule content review, question drills and remediation blocks that actually fit your rotation schedule.",
    section: "App Orientation",
    topic: "Study Planning",
    durationMin: 11,
    searchQuery: "nclex 6 week study plan schedule",
    premium: false,
  },
  ...bodySystems.map(([title, description, durationMin], i) => ({
    title,
    description,
    section: "Body Systems",
    topic: title,
    durationMin,
    searchQuery: `${title} anatomy physiology nursing lecture nclex review`,
    premium: i > 1,
  })),
  ...conditions.map(([title, description, durationMin], i) => ({
    title,
    description,
    section: "Common Conditions",
    topic: title,
    durationMin,
    searchQuery: `${title} nursing management nclex review lecture`,
    premium: i > 1,
  })),
  ...carePlans.map(([title, description, durationMin], i) => ({
    title,
    description,
    section: "Care Plans & Nursing Process",
    topic: title,
    durationMin,
    searchQuery: `${title} nursing students tutorial`,
    premium: i > 0,
  })),
  ...nmcLessons.map(([title, description, durationMin], i) => ({
    exam: "NMC",
    title,
    description,
    section: "NMC UK Registration",
    topic: title,
    durationMin,
    searchQuery: `${title} NMC CBT OSCE UK nurses`,
    premium: i > 1,
  })),
];

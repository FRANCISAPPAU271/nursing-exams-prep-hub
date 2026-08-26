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

export type TopicVideoInfo = {
  youtubeId: string;
  channel: string;
  keyPoints: string[];
  examTips: string[];
};

export const TOPIC_VIDEO_MAP: Record<string, TopicVideoInfo> = {
  "Getting Started": {
    youtubeId: "UxFCpHIJsiY",
    channel: "RegisteredNurseRN (Pass NCLEX First Try & Exam Orientation)",
    keyPoints: [
      "Use the Study Task Manager to schedule daily 50-question review blocks.",
      "Switch between NCLEX and UK NMC tabs depending on your target license.",
      "Review the rationale for every option — right and wrong — to build clinical judgement.",
      "Complete at least three full-length timed mock exams before your test date.",
    ],
    examTips: [
      "NCLEX tests safe minimum practice under US/Canada guidelines.",
      "NMC CBT tests UK clinical guidelines, the NMC Code, and numeracy.",
    ],
  },
  "Study Planning": {
    youtubeId: "gdnwec8GiLo",
    channel: "SimpleNursing - Nurse Mike (3-Step NCLEX Study Plan)",
    keyPoints: [
      "Dedicate weeks 1-2 to high-yield fundamentals, pharmacology, and drug calculations.",
      "Weeks 3-4 focus on Med-Surg body systems: cardiovascular, respiratory, neuro, and renal.",
      "Weeks 5-6 reserve for full-length timed mock tests and weakness remediation.",
      "Never study passively: test yourself first, then review explanations.",
    ],
    examTips: [
      "Aim to maintain at least 70% accuracy across every category before booking your exam.",
      "Use spaced repetition to review missed concepts within 48 hours.",
    ],
  },
  "Cardiovascular System": {
    youtubeId: "X9ZZ6tcxArI",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Blood flows: Vena Cava -> RA -> Tricuspid -> RV -> Pulmonic -> Lungs -> LA -> Mitral -> LV -> Aortic -> Systemic.",
      "Cardiac output = Heart Rate x Stroke Volume (Normal: 4-8 L/min).",
      "Mean Arterial Pressure (MAP) must stay >= 65 mmHg for vital organ perfusion.",
      "S1 (lub) = AV valves close (mitral/tricuspid). S2 (dub) = Semilunar valves close (aortic/pulmonic).",
    ],
    examTips: [
      "An S3 heart sound in an adult is an early sign of fluid overload / heart failure.",
      "Hypotension with distended neck veins and muffled heart sounds = Cardiac Tamponade (Beck's triad).",
    ],
  },
  "Respiratory System": {
    youtubeId: "bHZsvBdUC2I",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Ventilation is mechanical movement of air; gas exchange occurs at the alveolar-capillary membrane.",
      "Type II alveolar cells secrete surfactant to reduce surface tension and prevent atelectasis.",
      "Normal arterial blood gases: pH 7.35-7.45, PaCO2 35-45, PaO2 80-100, HCO3 22-26.",
      "ROME memory trick: Respiratory Opposite (pH up, CO2 down), Metabolic Equal (pH up, HCO3 up).",
    ],
    examTips: [
      "Sudden silent chest in a severe asthma attack indicates impending respiratory arrest — emergency!",
      "Tracheal deviation away from the affected side indicates tension pneumothorax — needle decompression.",
    ],
  },
  "Neurological System": {
    youtubeId: "qPix_X-9t7E",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Glasgow Coma Scale (GCS): Eye (4), Verbal (5), Motor (6). Score 8 or below = intubate.",
      "Normal Intracranial Pressure (ICP): 5-15 mmHg. Sustained > 20 requires immediate intervention.",
      "Cushing's Triad for increased ICP: Widening pulse pressure (severe systolic hypertension), bradycardia, and irregular respirations.",
      "Cranial Nerves: II (Optic), III (Oculomotor pupil constrict), VII (Facial symmetry), X (Vagus swallow/gag).",
    ],
    examTips: [
      "Never do lumbar puncture if signs of increased ICP are present (risk of brain herniation).",
      "Position patient with elevated head of bed 30 degrees midline to promote cerebral venous drainage.",
    ],
  },
  "Gastrointestinal System": {
    youtubeId: "yIoTRGfcMqM",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Liver synthesizes albumin, clotting factors, bile, and metabolizes ammonia into urea.",
      "Pancreas produces amylase (carbs), lipase (fats), protease (proteins), and insulin/glucagon.",
      "Gastric pH is 1.5-3.5; aspirate pH <= 5.5 is expected for stomach placement verification.",
      "Parietal cells produce intrinsic factor, essential for vitamin B12 absorption in the ileum.",
    ],
    examTips: [
      "Coffee-ground emesis or black tarry stools (melena) indicates upper GI bleeding.",
      "In acute pancreatitis: keep NPO to rest the pancreas; provide aggressive IV fluids and pain management.",
    ],
  },
  "Renal & Urinary System": {
    youtubeId: "l128tW1H5a8",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Kidneys filter ~180 L/day; normal minimum adult urine output is 0.5 mL/kg/hr (~30 mL/hr).",
      "Serum creatinine (0.6-1.2 mg/dL) is the most reliable indicator of renal function.",
      "Blood Urea Nitrogen (BUN: 10-20 mg/dL) rises with dehydration as well as renal impairment.",
      "Erythropoietin stimulated by kidney hypoxia promotes RBC production in bone marrow.",
    ],
    examTips: [
      "Oliguria (< 400 mL/day) with peaked T waves on ECG indicates life-threatening hyperkalemia.",
      "In chronic kidney disease, restrict potassium, phosphorus, sodium, and fluid intake.",
    ],
  },
  "Endocrine System": {
    youtubeId: "eWHH9je2zG4",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Thyroid hormones (T3/T4) regulate basal metabolic rate; TSH is secreted by anterior pituitary.",
      "Adrenal cortex produces cortisol (glucocorticoid) and aldosterone (sodium/water retention, potassium excretion).",
      "Parathyroid hormone (PTH) raises serum calcium by bone resorption and renal reabsorption.",
      "Posterior pituitary stores ADH (water reabsorption in collecting ducts) and oxytocin.",
    ],
    examTips: [
      "Addisonian crisis: severe hypotension, hyponatremia, hyperkalemia, hypoglycemia — treat with IV hydrocortisone.",
      "Thyroid storm: fever, tachycardia, agitation, delirium — treat with beta-blockers, antithyroid meds, and cooling.",
    ],
  },
  "Musculoskeletal System": {
    youtubeId: "rDGqkMHPDqE",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Bone remodeling is balanced by osteoclasts (resorption) and osteoblasts (bone formation).",
      "The 6 Ps of Neurovascular Assessment: Pain (out of proportion), Pallor, Poikilothermia, Pulselessness, Paresthesia, Paralysis.",
      "Traction principles: ropes unobstructed, weights hang freely, patient aligned in bed.",
    ],
    examTips: [
      "Compartment Syndrome: unrelieved pain with passive stretch is the earliest indicator — notify provider immediately!",
      "Fat Embolism Syndrome (after long bone fracture): triad of dyspnea, confusion, and petechial rash on chest.",
    ],
  },
  "Integumentary System": {
    youtubeId: "Orumw-PyNjw",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Skin layers: Epidermis (avascular barrier), Dermis (nerves, vessels, collagen), Subcutaneous fat.",
      "Pressure Injury Stages: Stage 1 (non-blanchable erythema), Stage 2 (partial-thickness skin loss), Stage 3 (full-thickness skin loss), Stage 4 (exposed bone/muscle/tendon).",
      "Braden Scale: lower score = higher risk of pressure ulcer development (< 18 requires prevention protocol).",
    ],
    examTips: [
      "Never massage reddened bony prominences — causes capillary breakdown and tissue necrosis.",
      "Rule of Nines for burns: Head 9%, Each Arm 9%, Chest/Abdomen 18%, Back 18%, Each Leg 18%, Perineum 1%.",
    ],
  },
  "Hematologic System": {
    youtubeId: "9-XoM2144tk",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Normal CBC: Hemoglobin (12-18 g/dL), Hematocrit (36-50%), Platelets (150,000-450,000/mm3), WBC (4,500-11,000).",
      "Blood transfusion rules: verify with two nurses, 0.9% normal saline ONLY, stay with patient for first 15 minutes.",
      "Signs of acute hemolytic transfusion reaction: fever, chills, low back pain, tachycardia, hypotension, dark urine.",
    ],
    examTips: [
      "If any reaction occurs during blood transfusion: STOP the transfusion immediately and infuse normal saline with new tubing!",
      "Platelets < 50,000 requires bleeding precautions; < 20,000 carries high risk of spontaneous intracranial hemorrhage.",
    ],
  },
  "Immune & Lymphatic System": {
    youtubeId: "GIJK3dwCWCw",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Innate immunity: non-specific skin, mucous membranes, phagocytes, complement.",
      "Adaptive immunity: B-cells produce antibodies (humoral); T-cells provide cell-mediated immunity.",
      "Neutropenic precautions: Absolute Neutrophil Count (ANC) < 1,000/mm3 (no fresh flowers, raw foods, strict hand hygiene).",
      "Anaphylaxis: Type I hypersensitivity (IgE-mediated) — immediate priority is intramuscular Epinephrine!",
    ],
    examTips: [
      "In neutropenic patients, a low-grade temperature of 38.0°C (100.4°F) is a medical emergency.",
      "Epinephrine 1:1,000 (0.3-0.5 mg) IM in the anterolateral thigh is the first-line medication for anaphylaxis.",
    ],
  },
  "Reproductive System": {
    youtubeId: "_7rsH2loIY8",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Menstrual cycle: Follicular phase (estrogen rises) -> Ovulation (LH surge) -> Luteal phase (progesterone).",
      "GTPAL: Gravida (total pregnancies), Term (>= 37 wks), Preterm (20-36 wks), Abortions (< 20 wks), Living children.",
      "True labor vs False labor: True labor has regular contractions that increase in frequency/intensity and produce cervical dilation.",
    ],
    examTips: [
      "Painless bright red vaginal bleeding in 3rd trimester = Placenta Previa. Never perform digital vaginal exams!",
      "Painful dark red bleeding with board-like rigid abdomen = Placental Abruption. Emergency cesarean section.",
    ],
  },
  "Sensory System": {
    youtubeId: "o0DYP-u1rNM",
    channel: "CrashCourse Anatomy & Physiology",
    keyPoints: [
      "Glaucoma: increased intraocular pressure damaging optic nerve (loss of peripheral vision; tunnel vision).",
      "Cataracts: clouding of the lens (painless, gradual blurring of vision; glare sensitivity).",
      "Retinal Detachment: sudden onset of floaters, flashes of light, and a shadow/curtain falling across field of vision.",
      "Meniere's Disease: inner ear disorder with vertigo, tinnitus, and sensorineural hearing loss.",
    ],
    examTips: [
      "Retinal detachment is an ocular emergency — maintain bed rest and cover affected eye.",
      "Never irrigate the ear if tympanic membrane perforation or vegetable foreign body (like a bean) is suspected.",
    ],
  },
  "Heart Failure": {
    youtubeId: "Oc9e-9HEsOE",
    channel: "RegisteredNurseRN",
    keyPoints: [
      "Left-sided Heart Failure (L = Lungs): pulmonary congestion, crackles, dyspnea, orthopnea, cough.",
      "Right-sided Heart Failure (R = Rest of body): JVD, peripheral edema, ascites, hepatomegaly, weight gain.",
      "BNP > 100 pg/mL indicates ventricular stretch from volume overload.",
      "Daily weight monitoring rule: report weight gain of > 2-3 lbs in a day or > 5 lbs in a week.",
    ],
    examTips: [
      "Digoxin: check apical pulse for 1 full minute; hold if < 60 bpm. Therapeutic range: 0.5-2.0 ng/mL.",
      "Digoxin toxicity signs: yellow-green halos, nausea, vomiting, bradycardia, confusion.",
    ],
  },
  "Myocardial Infarction": {
    youtubeId: "29sJDWdLnNM",
    channel: "RegisteredNurseRN",
    keyPoints: [
      "STEMI: ST-segment elevation on 12-lead ECG indicating complete coronary artery occlusion.",
      "Troponin I (> 0.04 ng/mL) is the gold standard biomarker (elevates in 3-4 hours, stays elevated 10-14 days).",
      "Initial MONA protocol: Morphine, Oxygen (if SpO2 < 90%), Nitroglycerin, Aspirin (chewed).",
      "Percutaneous Coronary Intervention (PCI) goal: door-to-balloon time < 90 minutes.",
    ],
    examTips: [
      "Contraindications for Nitroglycerin: SBP < 90 mmHg, right ventricular MI, or phosphodiesterase inhibitors (sildenafil) within 24-48h.",
      "Post-cardiac catheterization: keep affected leg straight for 4-6 hours; monitor site for hematoma and check distal pulses.",
    ],
  },
  "Hypertension": {
    youtubeId: "IOSNDtppnco",
    channel: "LevelUpRN",
    keyPoints: [
      "Hypertensive crisis: SBP > 180 and/or DBP > 120 mmHg.",
      "First-line medications: ACE inhibitors (-pril), ARBs (-sartan), CCBs (-dipine), Thiazide diuretics.",
      "ACE inhibitor adverse effects: dry persistent cough, hyperkalemia, angioedema (life-threatening airway emergency).",
      "DASH diet: low sodium (< 2,300 mg/day, ideally 1,500 mg), rich in potassium, calcium, and magnesium.",
    ],
    examTips: [
      "Never stop antihypertensive medications abruptly — risk of rebound hypertensive crisis.",
      "Orthostatic hypotension teaching: rise slowly, sit on edge of bed for a few moments before standing.",
    ],
  },
  "Diabetes Mellitus": {
    youtubeId: "Ek6hnu1zaog",
    channel: "RegisteredNurseRN",
    keyPoints: [
      "Type 1: autoimmune beta-cell destruction; absolute insulin deficiency; prone to DKA.",
      "Type 2: insulin resistance and relative deficiency; managed with lifestyle, oral agents (Metformin), and insulin.",
      "DKA (Type 1): glucose > 250, ketones, metabolic acidosis (pH < 7.30, HCO3 < 18), Kussmaul respirations, fruity breath.",
      "HHS (Type 2): glucose > 600, severe dehydration, hyperosmolality, NO significant ketoacidosis.",
    ],
    examTips: [
      "Rule of 15 for hypoglycemia (glucose < 70): give 15g fast-acting carbs, recheck in 15 minutes, repeat if still < 70.",
      "Hold Metformin 48 hours before and after IV contrast dye to prevent contrast-induced nephropathy and lactic acidosis.",
    ],
  },
  "Stroke (CVA)": {
    youtubeId: "U8s427-tv58",
    channel: "RegisteredNurseRN",
    keyPoints: [
      "FAST assessment: Face drooping, Arm weakness, Speech difficulty, Time to call emergency.",
      "Ischemic stroke (~85%): thrombolytic therapy (tPA / Alteplase) must be given within 3 to 4.5 hours of symptom onset.",
      "Hemorrhagic stroke (~15%): do NOT give tPA or anticoagulants; control blood pressure.",
      "Immediate CT scan of head without contrast to rule out hemorrhage prior to tPA administration.",
    ],
    examTips: [
      "Strict NPO until formal swallow evaluation is completed to prevent aspiration pneumonia.",
      "For hemi-spatial neglect (common in right-brain stroke): approach patient and place objects on unaffected side initially, teach patient to scan room.",
    ],
  },
  "Sepsis & Shock": {
    youtubeId: "XuGPoQWzIco",
    channel: "RegisteredNurseRN",
    keyPoints: [
      "Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection.",
      "Septic Shock: persistent hypotension requiring vasopressors to maintain MAP >= 65 and lactate > 2 mmol/L despite fluid resuscitation.",
      "Sepsis 1-Hour Bundle: measure lactate, blood cultures BEFORE antibiotics, broad-spectrum antibiotics, 30 mL/kg crystalloid for hypotension/lactate >= 4, vasopressors.",
      "First-line vasopressor: Norepinephrine (Levophed).",
    ],
    examTips: [
      "Draw blood cultures BEFORE administering the first dose of antibiotics, but do not delay antibiotics > 1 hour.",
      "Trending serum lactate downwards indicates tissue reperfusion and treatment efficacy.",
    ],
  },
  "The Nursing Process (ADPIE) Explained": {
    youtubeId: "Ug4fDIJNQhw",
    channel: "NursingSOS & Nursing Process",
    keyPoints: [
      "A - Assessment: systematic collection of subjective (symptoms) and objective (signs) data.",
      "D - Diagnosis: identifying actual and potential health problems using NANDA-I format.",
      "P - Planning: setting measurable SMART goals and prioritizing interventions (Maslow / ABC).",
      "I - Implementation: carrying out evidence-based nursing interventions and documenting.",
      "E - Evaluation: determining whether client goals were met, partially met, or not met, and revising.",
    ],
    examTips: [
      "Always ASSESS before INTERVENING — unless the client is in immediate respiratory or cardiac arrest.",
      "The nursing process is cyclical and continuous, not linear.",
    ],
  },
  "Writing NANDA Nursing Diagnoses": {
    youtubeId: "RYT0JV07gEs",
    channel: "The Nursing Process & Care Plans",
    keyPoints: [
      "PES format: Problem (NANDA label) + Etiology (Related to / r/t) + Signs/Symptoms (As evidenced by / aeb).",
      "Never use a medical diagnosis in the 'related to' clause (e.g. 'r/t COPD' is wrong; 'r/t alveolar-capillary membrane changes' is correct).",
      "Risk diagnoses have no 'as evidenced by' signs because the problem has not yet occurred.",
    ],
    examTips: [
      "On NCLEX and NMC, prioritize actual diagnoses (ineffective airway clearance) over risk diagnoses (risk for falls).",
    ],
  },
};

export function getVideoInfo(topic: string): TopicVideoInfo {
  return (
    TOPIC_VIDEO_MAP[topic] || {
      youtubeId: "X9ZZ6tcxArI",
      channel: "Nursing Education & Clinical Review",
      keyPoints: [
        "Review the core pathophysiology and clinical presentation for this topic.",
        "Identify priority nursing assessments before administering medications or interventions.",
        "Monitor for hallmark signs of deterioration, adverse drug reactions, and complication alerts.",
        "Practice related NCLEX and NMC questions to test your clinical judgement.",
      ],
      examTips: [
        "Prioritize Airway, Breathing, and Circulation (ABC) and unstable clients over chronic/stable findings.",
        "Assess before intervening unless the client is in immediate life-threatening danger.",
      ],
    }
  );
}

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

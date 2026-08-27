/**
 * Compact NCLEX clinical dataset.
 *
 * Format: [category, condition, [ [finding, priorityAction, keyDrug, keyLab], ... ]]
 *
 * Each condition carries several DISTINCT clinical facts. Every (condition x fact
 * x template) combination produces a question with genuinely different clinical
 * content and a different rationale — never a re-labelled copy.
 */

export type NclexFact = [finding: string, action: string, drug: string, lab: string];

export const NCLEX_DATA: [category: string, condition: string, facts: NclexFact[]][] = [
  // ── Cardiovascular ───────────────────────────────────────────────
  ["Cardiovascular", "heart failure", [
    ["crackles in the lower lung fields", "sit the client upright and restrict sodium and fluid", "furosemide", "B-type natriuretic peptide"],
    ["a weight gain of 1.5 kg in 24 hours", "record a daily weight and notify the provider", "furosemide", "daily weight record"],
    ["orthopnoea with two-pillow sleeping", "elevate the head of the bed and assess oxygenation", "oxygen therapy", "oxygen saturation"],
    ["bilateral pitting ankle oedema", "elevate the legs and assess for skin breakdown", "spironolactone", "serum potassium"],
    ["a new S3 heart sound", "assess for fluid overload and report the finding", "furosemide", "B-type natriuretic peptide"],
  ]],
  ["Cardiovascular", "myocardial infarction", [
    ["crushing substernal chest pressure radiating to the jaw", "obtain a 12-lead ECG and give chewable aspirin", "aspirin", "troponin I"],
    ["ST elevation in leads II, III and aVF", "activate the catheterisation team immediately", "alteplase", "ECG"],
    ["a blood pressure of 86/50 mmHg with pale clammy skin", "treat for cardiogenic shock and call for help", "intravenous fluids", "mean arterial pressure"],
    ["nausea and diaphoresis with epigastric pain", "assess the ECG and cardiac enzymes rather than assuming indigestion", "morphine", "troponin I"],
    ["a systolic pressure of 82 mmHg after nitroglycerin", "stop the nitroglycerin and give intravenous fluids", "intravenous fluids", "blood pressure"],
  ]],
  ["Cardiovascular", "atrial fibrillation", [
    ["an irregularly irregular pulse of 140 beats per minute", "assess the client and anticipate anticoagulation", "diltiazem", "ECG"],
    ["sudden weakness on one side of the body", "treat as a stroke and obtain an urgent CT scan", "alteplase", "CT of the head"],
    ["an INR of 5.2 on warfarin therapy", "hold the warfarin and report the result", "vitamin K", "INR"],
    ["a new left atrial thrombus on echocardiogram", "anticipate anticoagulation before any rhythm attempt", "apixaban", "echocardiogram"],
    ["slurred speech and facial droop", "activate the stroke pathway immediately", "not applicable", "glucose and CT"],
  ]],
  ["Cardiovascular", "hypertensive emergency", [
    ["a blood pressure of 224/132 mmHg with blurred vision", "lower the pressure gradually with intravenous therapy", "nicardipine", "blood pressure"],
    ["chest pain with a blood pressure of 200/120 mmHg", "assess for aortic dissection and monitor both arms", "intravenous antihypertensive", "chest CT"],
    ["papilloedema with a severe headache", "reduce the pressure slowly to avoid cerebral hypoperfusion", "labetalol", "neurological assessment"],
    ["a seizure in a severely hypertensive client", "protect from injury and give prescribed antihypertensives", "labetalol", "blood pressure"],
    ["rebound hypertension after stopping medication", "teach the client never to stop treatment abruptly", "clonidine", "blood pressure"],
  ]],
  ["Cardiovascular", "cardiac tamponade", [
    ["muffled heart sounds with distended neck veins", "prepare for emergency pericardiocentesis", "intravenous fluids", "echocardiogram"],
    ["pulsus paradoxus greater than 10 mmHg", "report the finding and monitor haemodynamics", "intravenous fluids", "blood pressure"],
    ["a narrowing pulse pressure after cardiac surgery", "assess for tamponade and notify the surgeon", "intravenous fluids", "chest x-ray"],
    ["hypotension worsening with inspiration", "keep the client flat and prepare for drainage", "intravenous fluids", "echocardiogram"],
    ["tricuspid valve pressure after a stab wound", "prepare for emergency decompression", "not applicable", "chest x-ray"],
  ]],

  // ── Respiratory ──────────────────────────────────────────────────
  ["Respiratory", "asthma", [
    ["a silent chest with severe respiratory distress", "call the emergency team and prepare for ventilation", "nebulised salbutamol", "peak expiratory flow"],
    ["wheezing with an oxygen saturation of 88 percent", "give prescribed nebulised bronchodilator and oxygen", "salbutamol", "oxygen saturation"],
    ["a peak flow in the red zone", "give the rescue inhaler and reassess urgently", "prednisolone", "peak expiratory flow"],
    ["night-time wakening with wheeze three times a week", "review inhaler technique and adherence", "beclomethasone", "peak expiratory flow"],
    ["tracheal tug and accessory muscle use", "position upright and prepare for emergency treatment", "oxygen", "arterial blood gases"],
  ]],
  ["Respiratory", "pneumothorax", [
    ["absent breath sounds with tracheal deviation", "prepare for immediate needle decompression", "oxygen", "chest x-ray"],
    ["sudden pleuritic pain and dyspnoea after a chest drain fell out", "cover the site and call for urgent help", "oxygen", "chest x-ray"],
    ["subcutaneous emphysema around a chest drain", "assess the drain system for an air leak", "not applicable", "chest x-ray"],
    ["continuous bubbling in the water seal chamber", "check the tubing for a disconnect or leak", "not applicable", "chest x-ray"],
    ["a chest drain that has stopped swinging", "assess for blockage or a fully expanded lung", "not applicable", "chest x-ray"],
  ]],
  ["Respiratory", "pulmonary embolism", [
    ["sudden dyspnoea with sharp chest pain and tachycardia", "sit the client up, give oxygen and call for help", "heparin", "D-dimer"],
    ["haemoptysis with pleuritic pain after surgery", "assess for embolism and anticipate anticoagulation", "enoxaparin", "CT pulmonary angiogram"],
    ["a swollen painful calf with sudden breathlessness", "treat as an embolism and do not massage the leg", "heparin", "Doppler ultrasound"],
    ["hypotension with distended neck veins after surgery", "assess for a massive embolism and call for help", "thrombolysis", "ECG"],
    ["an oxygen saturation of 85 percent on room air", "give high-flow oxygen and prepare for imaging", "oxygen", "arterial blood gases"],
  ]],
  ["Respiratory", "pneumonia", [
    ["crackles with a productive rust-coloured sputum", "encourage deep breathing and give prescribed antibiotics", "amoxicillin", "chest x-ray"],
    ["a fever of 39.2 degrees with tachypnoea", "give prescribed antibiotics and monitor temperature", "ceftriaxone", "white blood cell count"],
    ["an oxygen saturation of 89 percent with confusion", "give oxygen and assess for sepsis", "oxygen", "arterial blood gases"],
    ["poor cough effort in a frail older client", "assist with clearing secretions and monitor aspiration risk", "not applicable", "oxygen saturation"],
    ["pleuritic pain on deep breathing", "encourage splinting with deep breathing and analgesia", "analgesia", "chest x-ray"],
  ]],
  ["Respiratory", "chronic obstructive pulmonary disease", [
    ["an oxygen saturation of 86 percent on room air", "give controlled oxygen to a target of 88 to 92 percent", "controlled oxygen", "arterial blood gases"],
    ["drowsiness with a rising carbon dioxide level", "assess for carbon dioxide retention and reduce oxygen", "not applicable", "arterial blood gases"],
    ["increasing dyspnoea with green sputum", "give prescribed nebulisers and antibiotics", "salbutamol", "sputum culture"],
    ["a barrel-shaped chest with pursed-lip breathing", "position upright and teach pursed-lip breathing", "not applicable", "spirometry"],
    ["a productive morning cough with weight loss", "assess nutrition and refer for respiratory review", "bronchodilator", "chest x-ray"],
  ]],
  ["Respiratory", "tuberculosis", [
    ["a cough for six weeks with night sweats and weight loss", "isolate the client and collect sputum samples", "rifampicin", "sputum AFB"],
    ["haemoptysis with a positive sputum smear", "start airborne precautions and prescribed therapy", "isoniazid", "sputum culture"],
    ["orange-red urine on anti-tuberculosis therapy", "reassure the client that this is an expected effect", "rifampicin", "liver enzymes"],
    ["refusal to continue treatment after two months", "arrange directly observed therapy and adherence support", "pyrazinamide", "sputum AFB"],
    ["a household contact with a chronic cough", "screen all household contacts for tuberculosis", "not applicable", "sputum AFB"],
  ]],

  // ── Endocrine ────────────────────────────────────────────────────
  ["Endocrine", "diabetic ketoacidosis", [
    ["a blood glucose of 26 mmol/L with Kussmaul breathing", "start intravenous fluids and an insulin infusion", "intravenous insulin", "serum ketones"],
    ["fruity breath with vomiting and abdominal pain", "check the glucose and ketones immediately", "intravenous insulin", "serum ketones"],
    ["a glucose falling to 12 mmol/L on an insulin infusion", "add dextrose to the intravenous fluids", "intravenous dextrose", "blood glucose"],
    ["a potassium of 3.1 mmol/L during treatment", "replace potassium before continuing the insulin infusion", "potassium chloride", "serum potassium"],
    ["dehydration with a capillary refill of three seconds", "give rapid intravenous crystalloid resuscitation", "intravenous crystalloid", "vital signs"],
  ]],
  ["Endocrine", "hypoglycaemia", [
    ["a blood glucose of 2.8 mmol/L with sweating and confusion", "give 15 grams of fast-acting carbohydrate", "oral glucose gel", "blood glucose"],
    ["an unconscious client with a glucose of 2.2 mmol/L", "give intravenous dextrose and never oral fluid", "intravenous dextrose", "blood glucose"],
    ["a glucose of 3.0 mmol/L before a meal in a client on insulin", "treat before the meal and reassess", "fast-acting carbohydrate", "blood glucose"],
    ["repeated night-time hypoglycaemia", "review the evening insulin dose with the provider", "insulin", "blood glucose"],
    ["a client who cannot swallow with a low glucose", "give glucagon or intravenous dextrose", "glucagon", "blood glucose"],
  ]],
  ["Endocrine", "hyperthyroidism", [
    ["a heart rate of 150 with fever and agitation", "assess for thyroid storm and call for help", "propranolol", "thyroid function tests"],
    ["exophthalmos with a visible neck swelling", "protect the eyes and refer for endocrine review", "carbimazole", "thyroid function tests"],
    ["weight loss with a good appetite and tremor", "assess thyroid function and provide a high-calorie diet", "carbimazole", "thyroid function tests"],
    ["a thyroidectomy client with a tingling face", "check the calcium level for post-operative hypocalcaemia", "calcium gluconate", "serum calcium"],
    ["a hoarse voice after thyroid surgery", "assess the airway and report possible nerve injury", "not applicable", "serum calcium"],
  ]],
  ["Endocrine", "hypothyroidism", [
    ["cold intolerance with a heart rate of 48", "assess thyroid function and warm the client", "levothyroxine", "thyroid stimulating hormone"],
    ["lethargy with dry skin and constipation", "give prescribed levothyroxine on an empty stomach", "levothyroxine", "thyroid stimulating hormone"],
    ["a swollen face with a hoarse voice and slow speech", "assess for severe hypothyroidism and report", "levothyroxine", "thyroid function tests"],
    ["bradycardia with hypothermia and confusion", "treat as myxoedema coma and call for help", "intravenous levothyroxine", "thyroid function tests"],
    ["weight gain with heavy menstrual bleeding", "check thyroid function and monitor the cycle", "levothyroxine", "thyroid function tests"],
  ]],
  ["Endocrine", "Addison disease", [
    ["hypotension with hyperpigmented skin creases", "give prescribed hydrocortisone and monitor the pressure", "hydrocortisone", "serum cortisol"],
    ["vomiting with a sodium of 122 mmol/L", "give intravenous fluids and hydrocortisone", "hydrocortisone", "serum sodium"],
    ["collapse after abruptly stopping steroids", "treat as an Addisonian crisis immediately", "intravenous hydrocortisone", "serum cortisol"],
    ["a potassium of 6.2 mmol/L with weakness", "assess the heart rhythm and treat the hyperkalaemia", "intravenous calcium", "ECG"],
    ["a craving for salty food with weight loss", "assess adrenal function and consider salt replacement", "fludrocortisone", "serum sodium"],
  ]],

  // ── Renal & Fluid ────────────────────────────────────────────────
  ["Renal", "acute kidney injury", [
    ["a urine output of 0.3 mL/kg/hr for six hours", "assess fluid status and review nephrotoxic medicines", "not applicable", "serum creatinine"],
    ["a creatinine rising from 80 to 320 micromol/L", "report the trend and stop nephrotoxic medicines", "not applicable", "serum creatinine"],
    ["hyperkalaemia with peaked T waves", "give intravenous calcium and prepare for dialysis", "intravenous calcium gluconate", "ECG"],
    ["a distended bladder with no urine output", "perform a bladder scan and catheterise if indicated", "urinary catheter", "bladder scan volume"],
    ["fluid overload with pulmonary oedema", "restrict fluids and prepare for dialysis", "not applicable", "chest x-ray"],
  ]],
  ["Renal", "chronic kidney disease", [
    ["a haemoglobin of 8 g/dL with fatigue", "assess erythropoietin therapy and iron status", "erythropoietin", "haemoglobin level"],
    ["pruritus with a phosphate of 2.4 mmol/L", "give phosphate binders with meals", "calcium acetate", "serum phosphate"],
    ["a potassium of 6.4 mmol/L with muscle weakness", "restrict potassium and give calcium gluconate", "intravenous calcium", "ECG"],
    ["metabolic acidosis with deep rapid breathing", "assess the bicarbonate level and report", "sodium bicarbonate", "serum bicarbonate"],
  ]],
  ["Renal", "hyperkalaemia", [
    ["peaked T waves on the monitor", "give intravenous calcium to protect the heart", "intravenous calcium gluconate", "ECG"],
    ["a potassium of 6.8 mmol/L with muscle weakness", "give calcium, insulin and dextrose", "insulin and dextrose", "serum potassium"],
    ["worsening hyperkalaemia on ACE inhibitor therapy", "hold the ACE inhibitor and recheck the potassium", "not applicable", "serum potassium"],
    ["bradycardia with a potassium of 7.1 mmol/L", "prepare for urgent dialysis", "not applicable", "ECG"],
    ["a wide QRS complex on the ECG", "give intravenous calcium immediately", "intravenous calcium", "ECG"],
  ]],
  ["Renal", "hyponatraemia", [
    ["a sodium of 118 mmol/L with confusion", "institute seizure precautions and restrict free water", "hypertonic saline", "serum sodium"],
    ["a headache with a sodium of 120 mmol/L", "assess neurological status and report", "hypertonic saline", "serum sodium"],
    ["nausea with a sodium of 126 mmol/L after surgery", "review intravenous fluids and restrict water", "not applicable", "serum sodium"],
    ["a seizure with a sodium of 114 mmol/L", "give prescribed hypertonic saline slowly", "hypertonic saline", "serum sodium"],
    ["rapid correction of a chronic low sodium", "correct slowly to avoid osmotic demyelination", "not applicable", "serum sodium"],
  ]],

  // ── Neurological ─────────────────────────────────────────────────
  ["Neurological", "stroke", [
    ["facial droop with slurred speech for one hour", "activate the stroke pathway and check the glucose", "alteplase", "CT of the head"],
    ["a Glasgow Coma Scale score falling from 15 to 9", "protect the airway and call for urgent imaging", "not applicable", "CT of the head"],
    ["dysphagia detected on a swallow screen", "keep the client nil by mouth and refer to speech therapy", "not applicable", "swallow assessment"],
    ["a blood pressure of 200/110 mmHg before thrombolysis", "report the pressure before giving thrombolysis", "alteplase", "blood pressure"],
    ["neglect of the affected side after a right-sided stroke", "approach from the unaffected side and teach scanning", "not applicable", "not applicable"],
  ]],
  ["Neurological", "raised intracranial pressure", [
    ["a widening pulse pressure with bradycardia", "elevate the head of the bed and call for help", "mannitol", "intracranial pressure"],
    ["vomiting with a worsening headache at dawn", "assess neurological status and notify the provider", "mannitol", "CT of the head"],
    ["unequal pupils with a deteriorating conscious level", "prepare for emergency imaging and intervention", "mannitol", "pupil assessment"],
    ["a client coughing against a closed ventilator circuit", "check the circuit and reduce the stimulation", "sedation", "intracranial pressure"],
    ["seizure activity after a head injury", "protect from injury and give prescribed anticonvulsant", "phenytoin", "EEG"],
  ]],
  ["Neurological", "seizures", [
    ["a generalised seizure lasting more than five minutes", "protect from injury and give prescribed anticonvulsant", "intravenous lorazepam", "blood glucose"],
    ["a seizure in a client with an unknown glucose", "check the glucose immediately during the event", "intravenous dextrose", "blood glucose"],
    ["cyanosis with tonic-clonic movements", "position on the side and protect the airway", "not applicable", "oxygen saturation"],
    ["a drowsy client after a seizure", "reassess the airway, glucose and neurological status", "not applicable", "blood glucose"],
    ["repeated seizures without regaining consciousness", "treat as status epilepticus and call for help", "intravenous lorazepam", "EEG"],
  ]],
  ["Neurological", "head injury", [
    ["clear fluid draining from the nose after trauma", "do not suction and test the fluid for glucose", "not applicable", "CT of the head"],
    ["a deteriorating conscious level with vomiting", "prepare for urgent imaging and neurosurgical review", "not applicable", "CT of the head"],
    ["a black eye with a battle sign behind the ear", "assess for a base of skull fracture", "not applicable", "CT of the head"],
    ["a pupil becoming fixed and dilated", "call for emergency help and reduce the pressure", "mannitol", "pupil assessment"],
    ["restlessness after a head injury in an older client", "assess for a bleed rather than assuming agitation", "not applicable", "CT of the head"],
  ]],

  // ── Gastrointestinal ─────────────────────────────────────────────
  ["Gastrointestinal", "upper gastrointestinal bleed", [
    ["coffee-ground vomiting with a pulse of 118", "insert large-bore access and crossmatch blood", "intravenous fluids", "haemoglobin level"],
    ["black tarry stools with dizziness", "assess for shock and prepare for transfusion", "packed red blood cells", "haemoglobin level"],
    ["a haemoglobin falling from 12 to 7 g/dL", "transfuse as prescribed and monitor for rebleeding", "packed red blood cells", "haemoglobin level"],
    ["vomiting blood after frequent NSAID use", "stop the NSAID and give prescribed acid suppression", "omeprazole", "endoscopy"],
    ["abdominal distension with absent bowel sounds after a bleed", "assess for perforation and keep the client nil by mouth", "not applicable", "abdominal x-ray"],
  ]],
  ["Gastrointestinal", "acute abdomen", [
    ["a rigid board-like abdomen with absent bowel sounds", "keep nil by mouth and prepare for surgery", "intravenous fluids", "abdominal x-ray"],
    ["sudden severe pain with guarding after a febrile illness", "assess for perforation and call the surgeon", "intravenous antibiotics", "abdominal x-ray"],
    ["rebound tenderness in the right iliac fossa", "keep the client nil by mouth and report the finding", "intravenous fluids", "white blood cell count"],
    ["vomiting with a distended abdomen and no flatus", "insert a nasogastric tube and assess for obstruction", "nasogastric tube", "abdominal x-ray"],
    ["a fever with a tender wound after abdominal surgery", "assess for dehiscence and notify the surgeon", "intravenous antibiotics", "wound swab"],
  ]],
  ["Gastrointestinal", "liver cirrhosis", [
    ["flapping tremor with drowsiness in liver disease", "give prescribed lactulose and assess consciousness", "lactulose", "serum ammonia"],
    ["a distended abdomen with shifting dullness", "monitor weight and girth and restrict sodium", "spironolactone", "serum sodium"],
    ["haematemesis with known varices", "prepare for emergency endoscopy and blood transfusion", "terlipressin", "haemoglobin level"],
    ["a low albumin with oedema and ascites", "restrict sodium and assess nutritional needs", "albumin infusion", "serum albumin"],
    ["pruritus with a deeply jaundiced client", "assess bilirubin and provide skin care", "not applicable", "serum bilirubin"],
  ]],
  ["Gastrointestinal", "intestinal obstruction", [
    ["vomiting with a distended abdomen and no flatus", "insert a nasogastric tube and keep nil by mouth", "nasogastric tube", "abdominal x-ray"],
    ["colicky pain with visible bowel loops", "assess for strangulation and notify the surgeon", "intravenous fluids", "abdominal x-ray"],
    ["a rising pulse with localised pain and tenderness", "assess for strangulation and prepare for surgery", "intravenous fluids", "white blood cell count"],
    ["feculent vomiting with a distended abdomen", "assess for a distal obstruction and decompress", "nasogastric tube", "abdominal x-ray"],
    ["dehydration after prolonged vomiting", "replace fluids and monitor electrolytes", "intravenous fluids", "serum electrolytes"],
  ]],
  ["Gastrointestinal", "acute pancreatitis", [
    ["severe epigastric pain radiating to the back", "keep nil by mouth and give intravenous fluids", "intravenous fluids", "serum lipase"],
    ["a serum lipase three times the upper limit", "confirm the diagnosis and keep the client nil by mouth", "not applicable", "serum lipase"],
    ["a falling calcium with bruising on the flanks", "report the severity and monitor closely", "intravenous calcium", "serum calcium"],
    ["a rising respiratory rate 48 hours after admission", "assess for acute respiratory distress syndrome", "oxygen", "arterial blood gases"],
    ["severe pain requiring strong analgesia", "give prescribed analgesia and assess the response", "pethidine", "pain score"],
  ]],

  // ── Pharmacology ─────────────────────────────────────────────────
  ["Pharmacology", "digoxin therapy", [
    ["an apical pulse of 52 beats per minute before a dose", "withhold the dose and notify the provider", "digoxin", "serum digoxin"],
    ["yellow-green halos around lights with nausea", "assess for digoxin toxicity and check the level", "digoxin immune fab", "serum digoxin"],
    ["a potassium of 3.0 mmol/L on digoxin therapy", "report the hypokalaemia which increases toxicity risk", "potassium chloride", "serum potassium"],
    ["bradycardia with dizziness in a client on digoxin", "check the apical pulse and withhold the dose", "digoxin", "ECG"],
    ["a client taking digoxin with an antacid", "separate the doses to avoid reduced absorption", "digoxin", "serum digoxin"],
  ]],
  ["Pharmacology", "warfarin therapy", [
    ["an INR of 6.0 with bleeding gums", "hold the warfarin and give prescribed vitamin K", "vitamin K", "INR"],
    ["a new bruise with an INR of 4.5", "assess for bleeding and report the INR", "not applicable", "INR"],
    ["a client starting an antibiotic on warfarin", "monitor the INR more closely for interaction", "warfarin", "INR"],
    ["a client eating large amounts of green leafy vegetables", "teach consistent intake rather than avoidance", "warfarin", "INR"],
    ["two missed warfarin doses", "advise the client to report and follow the protocol", "warfarin", "INR"],
    ["an INR below the therapeutic range with clots", "anticipate a dose adjustment and recheck", "warfarin", "INR"],
  ]],
  ["Pharmacology", "heparin therapy", [
    ["bleeding gums with a prolonged aPTT", "stop the infusion and report the result", "protamine sulfate", "aPTT"],
    ["a platelet count falling from 240,000 to 80,000", "stop heparin and assess for thrombocytopenia", "not applicable", "platelet count"],
    ["an aPTT of 120 seconds on an infusion", "hold the infusion and notify the provider", "protamine sulfate", "aPTT"],
    ["a new red painful swelling at the injection site", "assess the site and rotate injection areas", "not applicable", "not applicable"],
    ["a client on heparin with haematuria", "stop the infusion and assess for bleeding", "protamine sulfate", "urinalysis"],
  ]],
  ["Pharmacology", "insulin therapy", [
    ["a client drawing up insulin with a 21-gauge needle", "teach the correct insulin syringe technique", "insulin", "not applicable"],
    ["lipohypertrophy at every injection site", "teach rotation of injection sites", "insulin", "not applicable"],
    ["a cloudy insulin vial in use", "mix gently by rolling rather than shaking", "insulin", "not applicable"],
    ["a glucose of 15 mmol/L before breakfast every day", "review the morning dose and fasting pattern", "insulin", "blood glucose"],
    ["insulin stored in the freezer compartment", "discard it and store in the refrigerator door", "insulin", "not applicable"],
  ]],
  ["Pharmacology", "antibiotic therapy", [
    ["a rash developing 20 minutes after the first dose", "stop the antibiotic and assess for anaphylaxis", "adrenaline", "vital signs"],
    ["an antibiotic due at 09:00 given at 14:00", "document the delay and report the medication error", "not applicable", "not applicable"],
    ["a client with Clostridioides difficile on antibiotics", "stop the causative antibiotic and start the specific therapy", "oral vancomycin", "stool test"],
    ["a client taking antibiotics bought from a local shop", "teach the danger of self-medication and resistance", "not applicable", "not applicable"],
    ["an incomplete antibiotic course for pneumonia", "teach the client to complete the full course", "not applicable", "not applicable"],
  ]],
  ["Pharmacology", "opioid analgesia", [
    ["a respiratory rate of 8 per minute after morphine", "give prescribed naloxone and support ventilation", "naloxone", "respiratory rate"],
    ["a sedation score of 3 with pinpoint pupils", "withhold the opioid and assess the airway", "naloxone", "oxygen saturation"],
    ["constipation on regular opioids", "prescribe and give a regular laxative", "lactulose", "not applicable"],
    ["a client requesting more analgesia than prescribed", "assess the pain and report for review", "not applicable", "pain score"],
    ["itching with nausea after an opioid dose", "assess and give prescribed antiemetic support", "antiemetic", "not applicable"],
  ]],

  // ── Maternal & Child ─────────────────────────────────────────────
  ["Maternal & Child", "pre-eclampsia", [
    ["a blood pressure of 165/112 mmHg with proteinuria", "give prescribed magnesium sulfate and start precautions", "magnesium sulfate", "urine protein"],
    ["a severe headache with visual disturbance in pregnancy", "assess reflexes and report for urgent review", "magnesium sulfate", "blood pressure"],
    ["absent knee reflexes on magnesium sulfate therapy", "stop the infusion and give calcium gluconate", "calcium gluconate", "reflex assessment"],
    ["a respiratory rate of 10 per minute on magnesium sulfate", "stop the infusion and give the antidote", "calcium gluconate", "respiratory rate"],
    ["epigastric pain with a rising blood pressure at 34 weeks", "assess for impending eclampsia and call for help", "magnesium sulfate", "blood pressure"],
  ]],
  ["Maternal & Child", "postpartum haemorrhage", [
    ["a boggy uterus with heavy bleeding after delivery", "massage the uterus and give the prescribed uterotonic", "oxytocin", "haemoglobin level"],
    ["a full bladder with a deviated uterus after delivery", "empty the bladder and reassess the uterus", "urinary catheter", "not applicable"],
    ["blood loss estimated at 900 mL after a delivery", "call for help and start intravenous resuscitation", "intravenous fluids", "haemoglobin level"],
    ["continuous oozing with no firm clot formation", "assess for coagulation problems and refer urgently", "blood products", "coagulation profile"],
    ["a uterus that will not contract after the third baby", "give a second uterotonic and prepare for transfer", "carboprost", "blood loss"],
  ]],
  ["Maternal & Child", "newborn jaundice", [
    ["yellow palms and soles on day two of life", "refer urgently for bilirubin measurement", "phototherapy", "serum bilirubin"],
    ["a lethargic jaundiced baby who is feeding poorly", "refer urgently and support feeding", "phototherapy", "serum bilirubin"],
    ["a baby with jaundice in the first 24 hours of life", "treat as pathological and refer immediately", "phototherapy", "serum bilirubin"],
    ["a baby under phototherapy with loose green stools", "reassure the mother and protect the eyes", "phototherapy", "not applicable"],
    ["a rising bilirubin despite phototherapy", "prepare for exchange transfusion", "exchange transfusion", "serum bilirubin"],
    ["a jaundiced baby whose mother has diabetes", "check the glucose and refer for assessment", "phototherapy", "blood glucose"],
  ]],
  ["Maternal & Child", "neonatal sepsis", [
    ["a three-day-old baby feeding poorly with a low temperature", "refer urgently for parenteral antibiotics", "intravenous ampicillin", "blood culture"],
    ["a baby with grunting and a high temperature", "assess for sepsis and refer for treatment", "intravenous antibiotics", "blood culture"],
    ["a baby with a bulging fontanelle and fever", "refer urgently for lumbar puncture and antibiotics", "intravenous ceftriaxone", "cerebrospinal fluid"],
    ["a baby with an umbilical stump discharging pus", "clean the cord and start prescribed antibiotics", "intravenous antibiotics", "not applicable"],
    ["a baby with a temperature of 35.5 degrees and poor feeding", "warm the baby and assess for sepsis", "intravenous antibiotics", "blood culture"],
  ]],
  ["Maternal & Child", "severe acute malnutrition", [
    ["a mid-upper arm circumference in the red zone", "refer for therapeutic feeding and treat infection", "therapeutic milk", "mid-upper arm circumference"],
    ["bilateral pitting oedema of the feet in a child", "admit for severe acute malnutrition management", "F-75 therapeutic milk", "serum albumin"],
    ["a child with severe wasting and no appetite", "begin nasogastric feeding and treat infection", "F-75 therapeutic milk", "weight for height"],
    ["a child developing diarrhoea during refeeding", "slow the feed and assess for refeeding syndrome", "not applicable", "serum potassium"],
    ["a caregiver giving diluted formula to save money", "counsel on correct preparation and support the family", "therapeutic milk", "not applicable"],
  ]],
  ["Maternal & Child", "childhood pneumonia", [
    ["chest indrawing with a respiratory rate of 60 in a child", "give prescribed antibiotics and oxygen", "intravenous amoxicillin", "oxygen saturation"],
    ["a child who is unable to drink with fast breathing", "refer urgently for parenteral treatment", "intravenous antibiotics", "oxygen saturation"],
    ["grunting with nasal flaring in an infant", "assess the oxygen and refer for treatment", "oxygen", "oxygen saturation"],
    ["a child with fever and cough not drinking fluids", "encourage fluids and reassess the hydration", "not applicable", "temperature"],
    ["a cough not improving after three days of treatment", "reassess and review the antibiotic choice", "not applicable", "chest x-ray"],
  ]],

  // ── Safety & Infection ───────────────────────────────────────────
  ["Safety & Infection", "sepsis", [
    ["a fever of 39 degrees with a blood pressure of 84/50", "give oxygen, cultures and antibiotics within one hour", "intravenous antibiotics", "serum lactate"],
    ["confusion with a respiratory rate of 28 and fever", "treat as sepsis and follow the one-hour bundle", "intravenous antibiotics", "serum lactate"],
    ["a lactate of 4.5 mmol/L with hypotension", "give fluids and vasopressors as prescribed", "noradrenaline", "serum lactate"],
    ["a client with a urinary catheter and new fever", "remove the catheter if not needed and send cultures", "intravenous antibiotics", "urine culture"],
    ["mottled skin with a capillary refill of four seconds", "assess for shock and give rapid fluids", "intravenous fluids", "serum lactate"],
  ]],
  ["Safety & Infection", "surgical site infection", [
    ["a wound with redness and purulent discharge on day five", "take a swab and start prescribed antibiotics", "intravenous antibiotics", "wound swab"],
    ["a wound breaking open with a serosanguinous discharge", "cover with a sterile dressing and notify the surgeon", "not applicable", "wound swab"],
    ["a fever with a tender inflamed wound after surgery", "assess the wound and report the findings", "intravenous antibiotics", "white blood cell count"],
    ["a wound treated without any hand hygiene", "stop the procedure and perform hand hygiene", "not applicable", "not applicable"],
    ["a diabetic client with a slow-healing wound", "optimise glucose control and assess nutrition", "insulin", "random blood glucose"],
  ]],
  ["Safety & Infection", "Clostridioides difficile", [
    ["watery diarrhoea after a course of antibiotics", "collect a stool specimen and start the specific therapy", "oral vancomycin", "stool test"],
    ["diarrhoea in a client on a proton pump inhibitor", "review the medicine and follow infection precautions", "not applicable", "stool test"],
    ["a client with C. difficile and alcohol hand rub in use", "switch to soap and water hand washing", "not applicable", "not applicable"],
    ["a client with C. difficile sharing a ward with others", "isolate the client and use dedicated equipment", "not applicable", "not applicable"],
    ["recurrent diarrhoea after completing treatment", "report the recurrence for review", "not applicable", "stool test"],
  ]],
  ["Safety & Infection", "blood transfusion reaction", [
    ["back pain and fever ten minutes into a transfusion", "stop the transfusion and keep the line open with saline", "0.9 percent sodium chloride", "urinalysis"],
    ["a temperature rise of 1.5 degrees during transfusion", "stop the transfusion and assess the client", "not applicable", "vital signs"],
    ["dark urine with loin pain during a transfusion", "stop immediately and return the unit to the laboratory", "not applicable", "urinalysis"],
    ["an oxygen saturation falling during a transfusion", "stop the transfusion and assess for fluid overload", "not applicable", "oxygen saturation"],
    ["a client transfused without proper identification checks", "stop and repeat the two-person identification check", "not applicable", "not applicable"],
  ]],
  ["Safety & Infection", "medication safety", [
    ["an unclear verbal order for a high-alert medicine", "read back and clarify the order before giving", "not applicable", "not applicable"],
    ["a medicine about to be given without checking allergies", "stop and verify the allergy status first", "not applicable", "not applicable"],
    ["two clients with similar names on the same ward", "verify identity with two identifiers before any medicine", "not applicable", "not applicable"],
    ["a dose calculation the nurse is unsure about", "ask a second nurse or the pharmacist to verify", "not applicable", "not applicable"],
    ["a medicine label that is illegible", "do not give it and obtain a clear prescription", "not applicable", "not applicable"],
  ]],

  // ── Psychosocial ─────────────────────────────────────────────────
  ["Psychosocial", "suicidal ideation", [
    ["a client saying life is not worth living with a plan", "initiate one-to-one observation and remove means", "not applicable", "risk assessment"],
    ["a client giving away possessions and writing a note", "assess the risk urgently and keep the client safe", "not applicable", "risk assessment"],
    ["a client refusing to talk about suicidal thoughts", "assess directly and document the findings", "not applicable", "risk assessment"],
    ["a client discharged after a suicide attempt", "arrange follow-up and involve the family safely", "not applicable", "risk assessment"],
    ["a client with access to medicines at home and low mood", "teach the family to remove means of self-harm", "not applicable", "risk assessment"],
  ]],
  ["Psychosocial", "acute psychosis", [
    ["a client hearing voices commanding them to harm others", "ask directly about the voices and assess safety", "haloperidol", "not applicable"],
    ["a client refusing food believing it is poisoned", "offer sealed alternatives and build trust", "not applicable", "not applicable"],
    ["a disorganised client unable to care for basic needs", "assist with hygiene and provide a calm environment", "antipsychotic", "not applicable"],
    ["an aggressive client escalating on the ward", "use verbal de-escalation before any restraint", "not applicable", "not applicable"],
    ["a client with rigid muscles and a fever on antipsychotics", "treat as neuroleptic malignant syndrome and refer urgently", "not applicable", "serum creatine kinase"],
  ]],
  ["Psychosocial", "alcohol withdrawal", [
    ["tremor and sweating 48 hours after the last drink", "institute seizure precautions and give benzodiazepines", "diazepam", "withdrawal score"],
    ["visual hallucinations two days after stopping alcohol", "assess the withdrawal score and give treatment", "diazepam", "withdrawal score"],
    ["a seizure in a client withdrawing from alcohol", "protect from injury and give prescribed benzodiazepine", "diazepam", "not applicable"],
    ["a client with thiamine deficiency and confusion", "give thiamine before any glucose infusion", "thiamine", "not applicable"],
    ["a client wanting to stop drinking for good", "arrange counselling and relapse prevention support", "not applicable", "not applicable"],
  ]],
  ["Psychosocial", "severe anxiety", [
    ["hyperventilation with a sense of impending doom", "stay with the client and teach slow breathing", "not applicable", "oxygen saturation"],
    ["a client unable to speak during a panic attack", "remain calm, use short sentences and stay present", "not applicable", "not applicable"],
    ["chest pain with a normal ECG during an anxious episode", "assess fully before attributing it to anxiety", "not applicable", "ECG"],
    ["a client avoiding all social situations for months", "refer for psychological therapy and support", "not applicable", "not applicable"],
    ["a client using alcohol to control anxiety", "assess for dependence and offer support", "not applicable", "not applicable"],
  ]],
  ["Psychosocial", "grief and loss", [
    ["a client crying quietly after being told of a death", "sit with the client and allow silence", "not applicable", "not applicable"],
    ["a client asking why the death happened to them", "listen without giving false reassurance", "not applicable", "not applicable"],
    ["a client unable to sleep or eat six weeks after a loss", "assess for depression and offer support", "not applicable", "not applicable"],
    ["a client planning to visit the grave alone tomorrow", "respect the choice and check their support network", "not applicable", "not applicable"],
    ["a family disagreeing about funeral arrangements", "facilitate communication and involve counselling", "not applicable", "not applicable"],
  ]],

  // ── Fundamentals & Delegation ────────────────────────────────────
  ["Fundamentals", "pressure injury prevention", [
    ["non-blanchable redness over the sacrum", "reposition every two hours and offload the area", "barrier cream", "Braden score"],
    ["a Braden score of 12 on admission", "start a pressure-relieving mattress and turn chart", "not applicable", "Braden score"],
    ["a client with incontinence and broken skin", "clean, dry and apply a barrier product promptly", "barrier cream", "not applicable"],
    ["a client in one position for four hours", "reposition immediately and document the turning schedule", "not applicable", "not applicable"],
    ["a stage two pressure injury developing in hospital", "document, report and review the prevention plan", "not applicable", "wound assessment"],
  ]],
  ["Fundamentals", "fluid balance", [
    ["a urine output of 20 mL per hour for four hours", "report the oliguria and assess fluid status", "not applicable", "urine output"],
    ["a fluid balance showing a negative balance of 2 litres", "assess for dehydration and report the trend", "not applicable", "fluid balance chart"],
    ["an intake of 5 litres with only 800 mL output", "assess for retention and notify the provider", "not applicable", "fluid balance chart"],
    ["a client unable to drink after surgery", "start intravenous fluids as prescribed", "intravenous fluids", "serum electrolytes"],
    ["oedema with a positive fluid balance", "assess for overload and restrict fluids as prescribed", "not applicable", "daily weight"],
  ]],
  ["Fundamentals", "patient safety and falls", [
    ["an unsteady client with a new sedative prescription", "keep the bed low and the call bell in reach", "not applicable", "fall risk score"],
    ["a client found on the floor beside the bed", "assess for injury and complete an incident report", "not applicable", "neurological assessment"],
    ["a client climbing over the cot sides at night", "reassess the need and use a safer alternative", "not applicable", "not applicable"],
    ["wet flooring beside a confused client", "clean and dry the area and add supervision", "not applicable", "not applicable"],
    ["a client with a history of falls wanting to walk alone", "supervise the walk and provide a walking aid", "not applicable", "not applicable"],
  ]],
  ["Fundamentals", "delegation", [
    ["a stable client needing routine vital signs", "delegate to the support worker and follow up", "not applicable", "not applicable"],
    ["a client needing a complex wound assessment", "retain the assessment and do not delegate it", "not applicable", "not applicable"],
    ["teaching a newly diagnosed diabetic client", "retain teaching as it cannot be delegated", "not applicable", "not applicable"],
    ["a client with an changing neurological observation", "assess personally rather than delegating", "not applicable", "neurological assessment"],
    ["a support worker unsure about a delegated task", "explain the task and supervise until competent", "not applicable", "not applicable"],
  ]],
  ["Fundamentals", "documentation", [
    ["a note written two hours after the event", "document the time of writing and the actual event time", "not applicable", "not applicable"],
    ["a record with a crossed-out error and no signature", "follow the policy for correcting an entry", "not applicable", "not applicable"],
    ["a client record left open on a public computer", "log out and secure the record immediately", "not applicable", "not applicable"],
    ["an entry with a personal opinion about the client", "record objective observations instead", "not applicable", "not applicable"],
    ["care given but not documented", "document the care as soon as possible", "not applicable", "not applicable"],
  ]],
  ["Fundamentals", "nutrition support", [
    ["a serum albumin of 24 g/L with a poor intake", "refer to the dietitian for supplementation", "protein supplement", "serum albumin"],
    ["a client eating less than half of every meal", "assess the intake and involve the dietitian", "protein supplement", "weight record"],
    ["unintentional weight loss of five percent in a month", "assess nutrition and monitor the weight weekly", "not applicable", "weight record"],
    ["a client with dysphagia coughing on thin fluids", "keep nil by mouth and refer for a swallow assessment", "not applicable", "swallow assessment"],
    ["a client with a nasogastric tube and an unclear aspirate", "confirm tube position before feeding", "not applicable", "gastric aspirate pH"],
  ]],
];

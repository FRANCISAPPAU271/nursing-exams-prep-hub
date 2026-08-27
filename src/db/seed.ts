import "dotenv/config";
import { db, pool } from "./index";
import { attempts, lessons, payouts, questions, referrals, tasks, users } from "./schema";
import { LESSON_SEEDS } from "../lib/library";
import { GHANA_NMC_CATEGORIES } from "../lib/ghana-nmc-topics";
import { MIDWIFERY_CATEGORIES } from "../lib/midwifery-topics";
import { buildReferralCode } from "../lib/referrals";
import { hashPassword } from "../lib/auth";
import { sql } from "drizzle-orm";

type Topic = { name: string; finding: string; action: string; drug: string; lab: string };

const CATEGORIES: { category: string; clientNeed: string; topics: Topic[] }[] = [
  {
    category: "Medical-Surgical",
    clientNeed: "Physiological Adaptation",
    topics: [
      { name: "acute pancreatitis", finding: "epigastric pain radiating to the back", action: "maintain NPO status and provide IV fluids", drug: "morphine sulfate", lab: "serum lipase" },
      { name: "cirrhosis", finding: "asterixis", action: "administer lactulose as prescribed", drug: "lactulose", lab: "serum ammonia" },
      { name: "acute kidney injury", finding: "urine output of 15 mL/hr", action: "notify the provider immediately", drug: "furosemide", lab: "serum creatinine" },
      { name: "COPD exacerbation", finding: "pursed-lip breathing with accessory muscle use", action: "place the client in high-Fowler position", drug: "albuterol", lab: "arterial blood gases" },
      { name: "deep vein thrombosis", finding: "unilateral calf swelling and warmth", action: "maintain bed rest and avoid massaging the limb", drug: "heparin", lab: "aPTT" },
      { name: "hyperkalemia", finding: "peaked T waves on the ECG", action: "obtain a 12-lead ECG and notify the provider", drug: "sodium polystyrene sulfonate", lab: "serum potassium" },
      { name: "myocardial infarction", finding: "crushing substernal chest pressure", action: "administer oxygen and obtain an ECG", drug: "nitroglycerin", lab: "troponin I" },
      { name: "heart failure", finding: "a 3 lb weight gain in 24 hours", action: "restrict sodium and monitor daily weights", drug: "furosemide", lab: "B-type natriuretic peptide" },
      { name: "diabetic ketoacidosis", finding: "Kussmaul respirations with fruity breath", action: "start an IV insulin infusion with normal saline", drug: "regular insulin", lab: "serum ketones" },
      { name: "pneumonia", finding: "crackles in the right lower lobe", action: "encourage incentive spirometry every hour while awake", drug: "ceftriaxone", lab: "white blood cell count" },
      { name: "hypothyroidism", finding: "cold intolerance and fatigue", action: "teach the client to take the medication on an empty stomach", drug: "levothyroxine", lab: "TSH" },
      { name: "Addison disease", finding: "hypotension with hyperpigmentation", action: "monitor for signs of addisonian crisis", drug: "hydrocortisone", lab: "serum sodium" },
      { name: "peptic ulcer disease", finding: "coffee-ground emesis", action: "assess vital signs and prepare for endoscopy", drug: "pantoprazole", lab: "hemoglobin" },
      { name: "stroke", finding: "facial droop with slurred speech", action: "keep the client NPO until a swallow screen is completed", drug: "alteplase", lab: "CT of the head" },
      { name: "sepsis", finding: "a temperature of 38.9 C with hypotension", action: "obtain blood cultures before starting antibiotics", drug: "vancomycin", lab: "serum lactate" },
      { name: "burn injury", finding: "circumferential eschar of the chest", action: "assess airway and prepare for escharotomy", drug: "silver sulfadiazine", lab: "hematocrit" },
      { name: "hip arthroplasty recovery", finding: "internal rotation of the operative leg", action: "maintain an abduction pillow between the legs", drug: "enoxaparin", lab: "hemoglobin" },
      { name: "chronic kidney disease", finding: "periorbital edema and pruritus", action: "restrict potassium and phosphorus in the diet", drug: "calcium acetate", lab: "serum phosphorus" },
      { name: "asthma", finding: "a suddenly silent chest", action: "call the rapid response team", drug: "prednisone", lab: "peak expiratory flow" },
      { name: "pulmonary embolism", finding: "sudden dyspnea with pleuritic chest pain", action: "elevate the head of the bed and apply oxygen", drug: "warfarin", lab: "D-dimer" },
    ],
  },
  {
    category: "Pharmacology",
    clientNeed: "Pharmacological Therapies",
    topics: [
      { name: "digoxin therapy", finding: "a heart rate of 52/min", action: "hold the dose and notify the provider", drug: "digoxin", lab: "serum digoxin level" },
      { name: "warfarin therapy", finding: "an INR of 6.2", action: "hold the dose and prepare vitamin K", drug: "warfarin", lab: "INR" },
      { name: "lithium therapy", finding: "coarse hand tremor and vomiting", action: "hold the dose and obtain a lithium level", drug: "lithium carbonate", lab: "serum lithium" },
      { name: "vancomycin therapy", finding: "flushing of the face and neck during infusion", action: "slow the infusion rate", drug: "vancomycin", lab: "trough level" },
      { name: "gentamicin therapy", finding: "new-onset tinnitus", action: "notify the provider about ototoxicity", drug: "gentamicin", lab: "serum creatinine" },
      { name: "heparin infusion", finding: "a platelet count of 78,000/mm3", action: "stop the infusion and notify the provider", drug: "heparin", lab: "platelet count" },
      { name: "insulin administration", finding: "diaphoresis and confusion", action: "give 15 g of a fast-acting carbohydrate", drug: "insulin glargine", lab: "capillary glucose" },
      { name: "opioid analgesia", finding: "a respiratory rate of 8/min", action: "administer naloxone as prescribed", drug: "hydromorphone", lab: "oxygen saturation" },
      { name: "ACE inhibitor therapy", finding: "a persistent dry cough", action: "notify the provider for a possible medication change", drug: "lisinopril", lab: "serum potassium" },
      { name: "statin therapy", finding: "diffuse muscle aching", action: "report possible rhabdomyolysis to the provider", drug: "atorvastatin", lab: "creatine kinase" },
      { name: "corticosteroid therapy", finding: "a blood glucose of 260 mg/dL", action: "monitor glucose and never stop the drug abruptly", drug: "prednisone", lab: "blood glucose" },
      { name: "MAOI therapy", finding: "a severe occipital headache after eating aged cheese", action: "treat as hypertensive crisis and notify the provider", drug: "phenelzine", lab: "blood pressure" },
      { name: "phenytoin therapy", finding: "gingival hyperplasia", action: "reinforce meticulous oral hygiene", drug: "phenytoin", lab: "serum phenytoin" },
      { name: "furosemide therapy", finding: "muscle cramps with a potassium of 3.0 mEq/L", action: "anticipate a potassium supplement", drug: "furosemide", lab: "serum potassium" },
      { name: "metformin therapy", finding: "a scheduled contrast CT scan", action: "hold the medication before and after the procedure", drug: "metformin", lab: "serum creatinine" },
      { name: "clozapine therapy", finding: "a sore throat and fever", action: "obtain an absolute neutrophil count immediately", drug: "clozapine", lab: "ANC" },
      { name: "amiodarone therapy", finding: "a new dry cough with dyspnea", action: "report possible pulmonary toxicity", drug: "amiodarone", lab: "chest x-ray" },
      { name: "albuterol therapy", finding: "tachycardia and tremor", action: "explain that these are expected adverse effects", drug: "albuterol", lab: "heart rate" },
      { name: "methotrexate therapy", finding: "painful oral ulcers", action: "anticipate folic acid supplementation", drug: "methotrexate", lab: "CBC with differential" },
      { name: "potassium chloride IV", finding: "burning at the infusion site", action: "never give IV push and slow the rate", drug: "potassium chloride", lab: "serum potassium" },
    ],
  },
  {
    category: "Maternal-Newborn",
    clientNeed: "Health Promotion and Maintenance",
    topics: [
      { name: "preeclampsia", finding: "a blood pressure of 168/110 mm Hg with 3+ proteinuria", action: "initiate magnesium sulfate and seizure precautions", drug: "magnesium sulfate", lab: "24-hour urine protein" },
      { name: "postpartum hemorrhage", finding: "a boggy uterus displaced to the right", action: "massage the fundus and have the client void", drug: "oxytocin", lab: "hemoglobin" },
      { name: "labor induction", finding: "late decelerations on the fetal monitor", action: "stop the oxytocin and reposition to left side-lying", drug: "oxytocin", lab: "fetal heart tracing" },
      { name: "gestational diabetes", finding: "a fasting glucose of 118 mg/dL", action: "reinforce carbohydrate-controlled meal planning", drug: "insulin", lab: "1-hour glucose challenge" },
      { name: "placenta previa", finding: "painless bright red vaginal bleeding", action: "avoid any vaginal examination", drug: "betamethasone", lab: "hemoglobin" },
      { name: "placental abruption", finding: "a rigid, painful abdomen", action: "prepare for emergency cesarean birth", drug: "lactated Ringer solution", lab: "fibrinogen" },
      { name: "prolapsed umbilical cord", finding: "a pulsating cord at the introitus", action: "elevate the presenting part and call for help", drug: "terbutaline", lab: "fetal heart rate" },
      { name: "newborn assessment", finding: "acrocyanosis at 5 minutes of life", action: "document this expected finding", drug: "vitamin K", lab: "Apgar score" },
      { name: "neonatal hypoglycemia", finding: "jitteriness with a glucose of 32 mg/dL", action: "feed the newborn and recheck the glucose", drug: "dextrose gel", lab: "heel-stick glucose" },
      { name: "breastfeeding support", finding: "cracked, painful nipples", action: "reinforce correct latch technique", drug: "lanolin", lab: "infant weight" },
      { name: "magnesium sulfate therapy", finding: "absent deep tendon reflexes", action: "stop the infusion and prepare calcium gluconate", drug: "calcium gluconate", lab: "serum magnesium" },
      { name: "Rh incompatibility", finding: "an Rh-negative mother with an Rh-positive newborn", action: "administer Rho(D) immune globulin within 72 hours", drug: "Rho(D) immune globulin", lab: "indirect Coombs test" },
      { name: "hyperemesis gravidarum", finding: "ketonuria with a 5% weight loss", action: "start IV fluids and antiemetics", drug: "ondansetron", lab: "urine ketones" },
      { name: "preterm labor", finding: "regular contractions at 30 weeks", action: "anticipate betamethasone for fetal lung maturity", drug: "betamethasone", lab: "fetal fibronectin" },
      { name: "postpartum depression", finding: "tearfulness and hopelessness at 3 weeks", action: "screen with a validated tool and refer", drug: "sertraline", lab: "EPDS score" },
      { name: "neonatal jaundice", finding: "jaundice appearing in the first 24 hours", action: "notify the provider and obtain a bilirubin level", drug: "phototherapy", lab: "total bilirubin" },
      { name: "first-stage labor", finding: "cervical dilation of 4 cm with contractions every 5 minutes", action: "encourage ambulation and position changes", drug: "fentanyl", lab: "cervical exam" },
      { name: "epidural anesthesia", finding: "a blood pressure of 84/50 mm Hg", action: "give an IV fluid bolus and turn the client to the side", drug: "ephedrine", lab: "maternal blood pressure" },
      { name: "amniotomy", finding: "green-tinged amniotic fluid", action: "notify the provider and prepare for neonatal resuscitation", drug: "oxygen", lab: "fetal heart tracing" },
      { name: "prenatal teaching", finding: "a report of no fetal movement for 12 hours", action: "instruct the client to come in for evaluation", drug: "prenatal vitamins", lab: "nonstress test" },
    ],
  },
  {
    category: "Pediatrics",
    clientNeed: "Health Promotion and Maintenance",
    topics: [
      { name: "croup", finding: "a barking cough with inspiratory stridor", action: "provide cool humidified air and nebulized epinephrine", drug: "dexamethasone", lab: "oxygen saturation" },
      { name: "epiglottitis", finding: "drooling with a tripod position", action: "avoid inspecting the throat and call for airway support", drug: "ceftriaxone", lab: "lateral neck x-ray" },
      { name: "bronchiolitis", finding: "nasal flaring with wheezing in an infant", action: "suction the nares and monitor oxygenation", drug: "ribavirin", lab: "RSV antigen" },
      { name: "febrile seizures", finding: "a generalized seizure with a temperature of 39.5 C", action: "protect the airway and give antipyretics", drug: "acetaminophen", lab: "temperature" },
      { name: "Kawasaki disease", finding: "a strawberry tongue with peeling palms", action: "monitor cardiac status and give IVIG", drug: "immune globulin", lab: "echocardiogram" },
      { name: "cystic fibrosis", finding: "bulky, foul-smelling stools", action: "give pancreatic enzymes with all meals and snacks", drug: "pancrelipase", lab: "sweat chloride" },
      { name: "sickle cell crisis", finding: "severe joint pain with dehydration", action: "provide hydration, oxygen, and analgesia", drug: "morphine", lab: "reticulocyte count" },
      { name: "nephrotic syndrome", finding: "periorbital edema with frothy urine", action: "monitor daily weights and urine protein", drug: "prednisone", lab: "urine protein" },
      { name: "intussusception", finding: "currant jelly stools", action: "notify the provider immediately", drug: "IV fluids", lab: "abdominal ultrasound" },
      { name: "pyloric stenosis", finding: "projectile nonbilious vomiting", action: "correct fluid and electrolyte imbalance before surgery", drug: "IV fluids", lab: "serum chloride" },
      { name: "type 1 diabetes in children", finding: "polyuria, polydipsia, and weight loss", action: "teach glucose monitoring and insulin administration", drug: "insulin lispro", lab: "hemoglobin A1C" },
      { name: "acute otitis media", finding: "ear tugging with a bulging tympanic membrane", action: "teach completion of the full antibiotic course", drug: "amoxicillin", lab: "otoscopic exam" },
      { name: "lead poisoning", finding: "irritability with developmental delay", action: "identify and remove the lead source", drug: "succimer", lab: "blood lead level" },
      { name: "developmental milestones", finding: "an 8-month-old unable to sit unsupported", action: "refer for developmental evaluation", drug: "none", lab: "Denver II screening" },
      { name: "immunization schedule", finding: "a mild fever after vaccination", action: "reassure the caregiver and advise acetaminophen", drug: "acetaminophen", lab: "immunization record" },
      { name: "cleft lip repair", finding: "the infant rubbing the suture line", action: "apply elbow immobilizers", drug: "acetaminophen", lab: "weight gain" },
      { name: "spina bifida", finding: "an exposed myelomeningocele sac", action: "cover with sterile saline gauze and position prone", drug: "sterile saline", lab: "head circumference" },
      { name: "asthma in school-age children", finding: "a peak flow in the yellow zone", action: "administer the rescue inhaler as prescribed", drug: "albuterol", lab: "peak flow" },
      { name: "child maltreatment", finding: "bruises in various stages of healing", action: "report the suspicion to child protective services", drug: "none", lab: "skeletal survey" },
      { name: "dehydration in infants", finding: "a sunken fontanel with dry mucous membranes", action: "begin oral rehydration therapy", drug: "oral rehydration solution", lab: "urine specific gravity" },
    ],
  },
  {
    category: "Mental Health",
    clientNeed: "Psychosocial Integrity",
    topics: [
      { name: "major depressive disorder", finding: "a sudden burst of energy after weeks of withdrawal", action: "increase suicide precautions and monitor closely", drug: "fluoxetine", lab: "PHQ-9" },
      { name: "bipolar mania", finding: "pressured speech with 2 hours of sleep", action: "provide a low-stimulation environment and finger foods", drug: "lithium carbonate", lab: "serum lithium" },
      { name: "schizophrenia", finding: "command hallucinations to harm others", action: "ask directly about the content of the voices", drug: "risperidone", lab: "metabolic panel" },
      { name: "alcohol withdrawal", finding: "tremors and hallucinations 48 hours after the last drink", action: "institute seizure precautions and give benzodiazepines", drug: "lorazepam", lab: "CIWA score" },
      { name: "opioid withdrawal", finding: "yawning, rhinorrhea, and piloerection", action: "provide supportive care and prescribed medications", drug: "methadone", lab: "COWS score" },
      { name: "anorexia nervosa", finding: "a potassium of 2.8 mEq/L with bradycardia", action: "monitor for refeeding syndrome and cardiac status", drug: "potassium chloride", lab: "serum potassium" },
      { name: "panic disorder", finding: "hyperventilation with a sense of doom", action: "stay with the client and speak in short, simple sentences", drug: "alprazolam", lab: "oxygen saturation" },
      { name: "post-traumatic stress disorder", finding: "flashbacks with hypervigilance", action: "use grounding techniques and ensure safety", drug: "sertraline", lab: "PCL-5" },
      { name: "borderline personality disorder", finding: "splitting behavior among staff", action: "maintain consistent limits across the team", drug: "none", lab: "risk assessment" },
      { name: "neuroleptic malignant syndrome", finding: "rigidity with a temperature of 40 C", action: "stop the antipsychotic and cool the client", drug: "dantrolene", lab: "creatine kinase" },
      { name: "serotonin syndrome", finding: "clonus, agitation, and hyperthermia", action: "discontinue the serotonergic agents", drug: "cyproheptadine", lab: "temperature" },
      { name: "delirium", finding: "acute fluctuating confusion in an older adult", action: "search for the underlying physiologic cause", drug: "haloperidol", lab: "urinalysis" },
      { name: "Alzheimer disease", finding: "sundowning behavior in the evening", action: "maintain a consistent routine and adequate lighting", drug: "donepezil", lab: "MMSE" },
      { name: "generalized anxiety disorder", finding: "restlessness with persistent worry", action: "teach relaxation and breathing techniques", drug: "buspirone", lab: "GAD-7" },
      { name: "suicidal ideation", finding: "a specific plan with available means", action: "initiate one-to-one continuous observation", drug: "none", lab: "C-SSRS" },
      { name: "electroconvulsive therapy", finding: "short-term memory loss after treatment", action: "reorient the client and reassure the family", drug: "methohexital", lab: "cognitive screen" },
      { name: "obsessive-compulsive disorder", finding: "ritual handwashing that delays meals", action: "allow time for the ritual while gradually setting limits", drug: "fluvoxamine", lab: "Y-BOCS" },
      { name: "substance use counseling", finding: "denial of a drinking problem", action: "use motivational interviewing techniques", drug: "naltrexone", lab: "liver enzymes" },
      { name: "seclusion and restraint", finding: "escalating aggression toward staff", action: "attempt least restrictive interventions first", drug: "olanzapine", lab: "provider order" },
      { name: "grief and loss", finding: "crying while discussing a recent death", action: "sit quietly and allow the client to express feelings", drug: "none", lab: "coping assessment" },
    ],
  },
  {
    category: "Fundamentals",
    clientNeed: "Basic Care and Comfort",
    topics: [
      { name: "pressure injury prevention", finding: "nonblanchable erythema over the sacrum", action: "reposition every 2 hours and offload pressure", drug: "barrier cream", lab: "Braden score" },
      { name: "nasogastric tube care", finding: "an aspirate pH of 5.5", action: "verify placement with an x-ray before feeding", drug: "enteral formula", lab: "gastric pH" },
      { name: "urinary catheter care", finding: "the drainage bag resting on the floor", action: "keep the bag below bladder level and off the floor", drug: "none", lab: "urinalysis" },
      { name: "oxygen therapy", finding: "an oxygen saturation of 88% on room air", action: "apply oxygen and elevate the head of the bed", drug: "oxygen", lab: "pulse oximetry" },
      { name: "fall prevention", finding: "an unsteady gait with new sedatives", action: "keep the bed low with the call light in reach", drug: "none", lab: "Morse Fall Scale" },
      { name: "pain assessment", finding: "grimacing while denying pain", action: "use a behavioral pain scale and reassess", drug: "acetaminophen", lab: "pain score" },
      { name: "wound care", finding: "yellow slough in the wound bed", action: "anticipate debridement and moist wound healing", drug: "hydrogel", lab: "wound culture" },
      { name: "sterile technique", finding: "the sterile field below waist level", action: "consider the field contaminated and restart", drug: "none", lab: "none" },
      { name: "hand hygiene", finding: "visibly soiled hands", action: "wash with soap and water rather than alcohol rub", drug: "none", lab: "none" },
      { name: "nutrition support", finding: "an albumin of 2.4 g/dL", action: "consult the dietitian for protein supplementation", drug: "protein supplement", lab: "serum albumin" },
      { name: "mobility and transfers", finding: "the client leaning heavily during transfer", action: "use a gait belt and get additional assistance", drug: "none", lab: "none" },
      { name: "intake and output", finding: "an output of 200 mL over 8 hours", action: "report the oliguria to the provider", drug: "none", lab: "urine output" },
      { name: "vital sign interpretation", finding: "an apical pulse of 44/min", action: "recheck and notify the provider", drug: "none", lab: "vital signs" },
      { name: "specimen collection", finding: "a midstream urine sample needed", action: "teach cleansing from front to back before collection", drug: "none", lab: "urine culture" },
      { name: "IV site assessment", finding: "coolness and swelling at the IV site", action: "stop the infusion and remove the catheter", drug: "none", lab: "none" },
      { name: "blood transfusion", finding: "chills and back pain 10 minutes into the transfusion", action: "stop the transfusion and keep the line open with saline", drug: "0.9% sodium chloride", lab: "type and crossmatch" },
      { name: "restraint use", finding: "restraints applied without a current order", action: "obtain a provider order and reassess frequently", drug: "none", lab: "none" },
      { name: "end-of-life care", finding: "noisy respirations from secretions", action: "reposition and consider an antisecretory agent", drug: "glycopyrrolate", lab: "none" },
      { name: "sleep promotion", finding: "frequent nighttime awakenings", action: "cluster care and reduce nighttime interruptions", drug: "melatonin", lab: "none" },
      { name: "elimination", finding: "no bowel movement for 4 days", action: "assess bowel sounds and increase fluids and fiber", drug: "docusate sodium", lab: "abdominal exam" },
    ],
  },
  {
    category: "Safety & Infection Control",
    clientNeed: "Safe and Effective Care Environment",
    topics: [
      { name: "airborne precautions", finding: "a client with suspected tuberculosis", action: "place in a negative-pressure room and wear an N95", drug: "isoniazid", lab: "sputum AFB" },
      { name: "droplet precautions", finding: "a client with meningococcal meningitis", action: "wear a surgical mask within 3 feet", drug: "ceftriaxone", lab: "CSF culture" },
      { name: "contact precautions", finding: "a client with Clostridioides difficile", action: "use soap and water and dedicated equipment", drug: "oral vancomycin", lab: "C. difficile toxin" },
      { name: "medication safety", finding: "an unclear verbal order", action: "read back and verify the order with the prescriber", drug: "none", lab: "none" },
      { name: "client identification", finding: "an armband that does not match the MAR", action: "stop and verify identity with two identifiers", drug: "none", lab: "none" },
      { name: "fire safety", finding: "smoke coming from a client room", action: "rescue the client, then activate the alarm", drug: "none", lab: "none" },
      { name: "seizure precautions", finding: "a client with a history of tonic-clonic seizures", action: "pad the side rails and keep suction available", drug: "levetiracetam", lab: "EEG" },
      { name: "latex allergy", finding: "a client allergic to bananas and avocados", action: "use latex-free supplies", drug: "epinephrine", lab: "allergy testing" },
      { name: "radiation safety", finding: "a client with a brachytherapy implant", action: "limit time, maximize distance, and use shielding", drug: "none", lab: "none" },
      { name: "delegation", finding: "a stable client needing vital signs", action: "delegate the task to assistive personnel", drug: "none", lab: "none" },
      { name: "incident reporting", finding: "a medication given to the wrong client", action: "assess the client, then complete an incident report", drug: "none", lab: "none" },
      { name: "hazardous drug handling", finding: "preparation of a chemotherapeutic agent", action: "use a biologic safety cabinet and double gloves", drug: "cyclophosphamide", lab: "none" },
      { name: "disaster triage", finding: "multiple casualties arriving at once", action: "treat clients with the greatest chance of survival first", drug: "none", lab: "triage tag" },
      { name: "surgical time-out", finding: "an unmarked surgical site", action: "stop the procedure and verify the site", drug: "none", lab: "none" },
      { name: "needle safety", finding: "a used needle on the bedside table", action: "dispose of it in the sharps container immediately", drug: "none", lab: "none" },
      { name: "protective isolation", finding: "an ANC of 400/mm3", action: "restrict fresh flowers and raw foods", drug: "filgrastim", lab: "ANC" },
      { name: "equipment safety", finding: "a frayed electrical cord on an IV pump", action: "remove the device from service and tag it", drug: "none", lab: "none" },
      { name: "informed consent", finding: "a client who cannot describe the procedure", action: "notify the provider before the client signs", drug: "none", lab: "none" },
      { name: "handoff communication", finding: "an incomplete shift report", action: "use SBAR to clarify missing information", drug: "none", lab: "none" },
      { name: "ergonomics", finding: "a bariatric client needing repositioning", action: "use a mechanical lift and additional staff", drug: "none", lab: "none" },
    ],
  },
  {
    category: "Critical Care",
    clientNeed: "Physiological Adaptation",
    topics: [
      { name: "mechanical ventilation", finding: "a high-pressure alarm sounding", action: "assess for secretions, kinks, or biting", drug: "propofol", lab: "arterial blood gases" },
      { name: "ARDS", finding: "refractory hypoxemia despite high FiO2", action: "anticipate low tidal volume ventilation and prone positioning", drug: "cisatracurium", lab: "PaO2/FiO2 ratio" },
      { name: "septic shock", finding: "a MAP of 58 mm Hg after fluids", action: "start a vasopressor infusion", drug: "norepinephrine", lab: "serum lactate" },
      { name: "cardiogenic shock", finding: "cool clammy skin with crackles", action: "support perfusion and reduce afterload", drug: "dobutamine", lab: "cardiac index" },
      { name: "hypovolemic shock", finding: "tachycardia with narrow pulse pressure", action: "give rapid isotonic fluid resuscitation", drug: "lactated Ringer solution", lab: "hemoglobin" },
      { name: "increased intracranial pressure", finding: "widening pulse pressure with bradycardia", action: "elevate the head of the bed 30 degrees midline", drug: "mannitol", lab: "ICP reading" },
      { name: "chest tube management", finding: "continuous bubbling in the water seal chamber", action: "assess the system for an air leak", drug: "none", lab: "chest x-ray" },
      { name: "arterial line care", finding: "a dampened waveform", action: "check for kinks and assess the pressure bag", drug: "heparinized saline", lab: "blood pressure" },
      { name: "ventricular fibrillation", finding: "a pulseless chaotic rhythm", action: "begin CPR and defibrillate immediately", drug: "epinephrine", lab: "rhythm strip" },
      { name: "atrial fibrillation with RVR", finding: "an irregular rate of 160/min", action: "anticipate rate control and anticoagulation", drug: "diltiazem", lab: "ECG" },
      { name: "cardiac tamponade", finding: "muffled heart sounds with JVD and hypotension", action: "prepare for pericardiocentesis", drug: "IV fluids", lab: "echocardiogram" },
      { name: "tension pneumothorax", finding: "tracheal deviation with absent breath sounds", action: "prepare for immediate needle decompression", drug: "oxygen", lab: "chest x-ray" },
      { name: "DKA management", finding: "a glucose falling to 250 mg/dL on insulin drip", action: "add dextrose to the IV fluids", drug: "regular insulin", lab: "serum glucose" },
      { name: "continuous renal replacement therapy", finding: "hypotension during treatment", action: "reduce the ultrafiltration rate and notify the provider", drug: "none", lab: "serum electrolytes" },
      { name: "sedation management", finding: "a RASS score of -4", action: "reduce sedation and perform a spontaneous awakening trial", drug: "dexmedetomidine", lab: "RASS" },
      { name: "post-cardiac arrest care", finding: "return of spontaneous circulation", action: "initiate targeted temperature management", drug: "amiodarone", lab: "arterial blood gases" },
      { name: "traumatic brain injury", finding: "clear drainage from the nose", action: "test the drainage for glucose and avoid nasal suction", drug: "none", lab: "CT of the head" },
      { name: "spinal cord injury", finding: "a pounding headache with a BP of 210/110 mm Hg", action: "sit the client upright and check for bladder distention", drug: "nifedipine", lab: "blood pressure" },
      { name: "massive transfusion", finding: "oozing from IV sites after 8 units", action: "anticipate platelets and fresh frozen plasma", drug: "fresh frozen plasma", lab: "coagulation panel" },
      { name: "burn resuscitation", finding: "urine output of 0.2 mL/kg/hr", action: "increase the fluid rate per the Parkland formula", drug: "lactated Ringer solution", lab: "urine output" },
    ],
  },
  {
    category: "Leadership & Management",
    clientNeed: "Management of Care",
    topics: [
      { name: "prioritization", finding: "four clients needing attention at once", action: "assess the client with the airway concern first", drug: "none", lab: "none" },
      { name: "delegation to LPN", finding: "a stable client requiring a dressing change", action: "delegate the task to the LPN", drug: "none", lab: "none" },
      { name: "delegation to UAP", finding: "a client needing assistance with bathing", action: "assign the task to assistive personnel", drug: "none", lab: "none" },
      { name: "advance directives", finding: "a client asking about a living will", action: "provide information and involve case management", drug: "none", lab: "none" },
      { name: "confidentiality", finding: "a family member asking for lab results", action: "verify authorization before disclosing information", drug: "none", lab: "none" },
      { name: "conflict resolution", finding: "two staff members arguing at the desk", action: "move the discussion to a private area", drug: "none", lab: "none" },
      { name: "quality improvement", finding: "a rising rate of catheter infections", action: "review evidence-based bundle compliance", drug: "none", lab: "infection rates" },
      { name: "discharge planning", finding: "a client living alone after a hip repair", action: "arrange home health and equipment before discharge", drug: "none", lab: "none" },
      { name: "resource management", finding: "short staffing on the unit", action: "notify the charge nurse and prioritize care", drug: "none", lab: "none" },
      { name: "client advocacy", finding: "a client refusing a prescribed procedure", action: "support the client's right to refuse and notify the provider", drug: "none", lab: "none" },
      { name: "interdisciplinary collaboration", finding: "a client with complex wound needs", action: "consult the wound care specialist", drug: "none", lab: "none" },
      { name: "supervision", finding: "a new graduate performing a first catheterization", action: "observe and provide direct supervision", drug: "none", lab: "none" },
      { name: "ethics", finding: "a family requesting information be withheld", action: "involve the ethics committee", drug: "none", lab: "none" },
      { name: "documentation", finding: "an error in the electronic record", action: "follow policy to amend without deleting the original", drug: "none", lab: "none" },
      { name: "case management", finding: "a client unable to afford medications", action: "refer to social services for assistance", drug: "none", lab: "none" },
      { name: "triage in the clinic", finding: "a client with crushing chest pain in the waiting room", action: "take the client back immediately", drug: "aspirin", lab: "ECG" },
      { name: "change management", finding: "staff resistance to a new protocol", action: "involve staff in planning and provide education", drug: "none", lab: "none" },
      { name: "legal responsibility", finding: "a suspected medication error by a peer", action: "report it through the chain of command", drug: "none", lab: "none" },
      { name: "cultural competence", finding: "a client requesting a same-gender caregiver", action: "accommodate the request when possible", drug: "none", lab: "none" },
      { name: "telephone orders", finding: "a phone order for a high-alert medication", action: "read back the order and have it signed within policy", drug: "none", lab: "none" },
    ],
  },
  {
    category: "Health Assessment",
    clientNeed: "Reduction of Risk Potential",
    topics: [
      { name: "cardiac assessment", finding: "an S3 heart sound", action: "assess for fluid overload and notify the provider", drug: "furosemide", lab: "BNP" },
      { name: "respiratory assessment", finding: "diminished breath sounds at the left base", action: "encourage deep breathing and reassess", drug: "none", lab: "chest x-ray" },
      { name: "neurologic assessment", finding: "a Glasgow Coma Scale score of 8", action: "protect the airway and notify the provider", drug: "none", lab: "CT of the head" },
      { name: "abdominal assessment", finding: "absent bowel sounds after surgery", action: "keep NPO and continue monitoring", drug: "none", lab: "abdominal x-ray" },
      { name: "peripheral vascular assessment", finding: "a nonpalpable pedal pulse", action: "use a Doppler and compare bilaterally", drug: "none", lab: "ankle-brachial index" },
      { name: "skin assessment", finding: "poor skin turgor with tenting", action: "assess hydration and encourage fluids", drug: "none", lab: "BUN" },
      { name: "pain reassessment", finding: "unrelieved pain 1 hour after medication", action: "reassess and notify the provider", drug: "none", lab: "pain score" },
      { name: "preoperative assessment", finding: "a client who ate breakfast before surgery", action: "notify the surgical team immediately", drug: "none", lab: "none" },
      { name: "postoperative assessment", finding: "a saturated dressing 2 hours after surgery", action: "reinforce the dressing and notify the surgeon", drug: "none", lab: "hemoglobin" },
      { name: "ECG interpretation", finding: "ST-segment elevation in leads II, III, and aVF", action: "activate the cardiac catheterization team", drug: "aspirin", lab: "troponin" },
      { name: "lab interpretation", finding: "a sodium of 118 mEq/L", action: "institute seizure precautions and restrict free water", drug: "3% sodium chloride", lab: "serum sodium" },
      { name: "acid-base interpretation", finding: "a pH of 7.30 with a PaCO2 of 55 mm Hg", action: "improve ventilation and notify the provider", drug: "none", lab: "arterial blood gases" },
      { name: "fluid balance", finding: "bounding pulses with jugular venous distention", action: "restrict fluids and notify the provider", drug: "furosemide", lab: "daily weight" },
      { name: "nutritional assessment", finding: "a BMI of 16", action: "consult nutrition services", drug: "none", lab: "prealbumin" },
      { name: "diagnostic testing", finding: "an allergy to shellfish before a contrast study", action: "notify radiology and the provider", drug: "diphenhydramine", lab: "creatinine" },
      { name: "geriatric assessment", finding: "a new onset of confusion in an older adult", action: "screen for infection and medication effects", drug: "none", lab: "urinalysis" },
      { name: "musculoskeletal assessment", finding: "pain with passive stretch in a casted limb", action: "report possible compartment syndrome immediately", drug: "none", lab: "compartment pressure" },
      { name: "endocrine assessment", finding: "a positive Chvostek sign", action: "monitor for hypocalcemia and seizure risk", drug: "calcium gluconate", lab: "serum calcium" },
      { name: "immune assessment", finding: "a temperature of 38.3 C during chemotherapy", action: "treat as a neutropenic emergency", drug: "cefepime", lab: "ANC" },
      { name: "genitourinary assessment", finding: "bladder distention with no void for 8 hours", action: "perform a bladder scan", drug: "none", lab: "bladder scan volume" },
    ],
  },
];

const DIFFICULTIES = ["easy", "medium", "hard"];

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Draft = { stem: string; correct: string; distractors: string[]; rationale: string };

function buildDrafts(t: Topic, category: string, exam = "NCLEX"): Draft[] {
  // Ghana papers (NMC RGN + Midwifery) say "patient" and "doctor"; US (NCLEX)
  // papers say "client" and "provider". Midwifery leads with the midwife/woman.
  const ghana = exam !== "NCLEX";
  const isMid = exam === "MIDWIFERY";
  const P = ghana ? "patient" : "client";
  const Pc = ghana ? "Patient" : "Client";
  const PROVIDER = ghana ? "doctor" : "provider";
  const NURSE = isMid ? "midwife" : "nurse";
  const scenario = isMid
    ? `A midwife is caring for a woman and is considering ${t.name}.`
    : `A ${NURSE} is caring for a ${P} and is considering ${t.name}.`;
  return [
    {
      stem: `${scenario} Which finding should be reported to the ${PROVIDER}?`,
      correct: `The ${P} has ${t.finding}.`,
      distractors: [
        `The ${P} reports mild tiredness after walking on the ward.`,
        `The ${P} requests a change to the menu choice.`,
        `The ${P} asks for more information about the discharge plan.`,
      ],
      rationale: `${t.finding.charAt(0).toUpperCase() + t.finding.slice(1)} is a hallmark concern in ${t.name} and requires prompt escalation. The other findings are expected or non-urgent.`,
    },
    {
      stem: `A ${NURSE} notes ${t.finding} in a ${P}. In relation to ${t.name}, which action should be taken first?`,
      correct: `The ${NURSE} should ${t.action}.`,
      distractors: [
        `The ${NURSE} should document the finding and reassess in 4 hours.`,
        `The ${NURSE} should encourage the ${P} to rest quietly.`,
        `The ${NURSE} should wait for the next scheduled ward round.`,
      ],
      rationale: `When ${t.finding} occurs in ${t.name}, the priority nursing action is to ${t.action}. Delaying intervention can worsen ${P} outcomes.`,
    },
    {
      stem: `A ${NURSE} is reviewing results relating to ${t.name}. Which is most important to monitor?`,
      correct: `The ${t.lab}.`,
      distractors: [
        "The serum amylase taken on admission.",
        `The ${P}\u2019s baseline height and weight.`,
        "The most recent visual acuity screening.",
      ],
      rationale: `The ${t.lab} directly reflects the status of ${t.name} and guides treatment decisions. The other data are not the priority monitoring parameter.`,
    },
    {
      stem: `A ${NURSE} is giving information about ${t.name}. Which ${P} statement shows understanding?`,
      correct: `\u201cI will report ${t.finding} straight away.\u201d`,
      distractors: [
        "\u201cI can stop all of my medicines once I feel better.\u201d",
        "\u201cI should avoid follow-up appointments unless I have severe pain.\u201d",
        "\u201cI will double my next dose if I forget one.\u201d",
      ],
      rationale: `Recognizing and reporting ${t.finding} promotes early intervention in ${t.name}. The other statements reflect unsafe self-management and require further teaching.`,
    },
    {
      stem: `Before acting on ${t.name} using ${t.drug}, which assessment is essential?`,
      correct: `Evaluate the ${t.lab} and assess for ${t.finding}.`,
      distractors: [
        `Confirm the ${P}\u2019s preferred visiting hours.`,
        `Verify the ${P} has completed the admission survey.`,
        `Ask the ${P} to rate satisfaction with nursing care.`,
      ],
      rationale: `Before giving ${t.drug}, the nurse must evaluate the ${t.lab} and assess for ${t.finding} to ensure safe administration. The other options do not affect drug safety.`,
    },
    {
      stem: `A ${NURSE} is planning care in relation to ${t.name}. Which intervention should be included?`,
      correct: `${t.action.charAt(0).toUpperCase() + t.action.slice(1)}.`,
      distractors: [
        `Limit the ${P}\u2019s fluid intake to 500 mL daily without a prescription.`,
        "Restrict all visitors for the whole admission.",
        `Keep the ${P} on strict bed rest indefinitely.`,
      ],
      rationale: `Evidence-based care for ${t.name} includes the intervention to ${t.action}. The other options are inappropriate or require a specific prescription.`,
    },
    {
      stem: `A ${NURSE} is prioritising care on the ward. Which ${P} should be assessed first?`,
      correct: `The ${P} with ${t.finding}.`,
      distractors: [
        `The ${P} awaiting discharge information in 2 hours.`,
        `The ${P} requesting a routine analgesia review.`,
        `The ${P} who needs help ordering lunch.`,
      ],
      rationale: `The ${P} with ${t.name} and ${t.finding} shows a change in condition and takes priority using the ABC and acute-versus-chronic frameworks.`,
    },
    {
      stem: `A ${NURSE} is evaluating care relating to ${t.name}. Which outcome shows the plan is working?`,
      correct: `The ${t.lab} trends toward the expected reference range.`,
      distractors: [
        `The ${P} sleeps more than 14 hours per day.`,
        `The ${P} reports increasing intensity of symptoms.`,
        `The ${P} requires escalating doses of rescue medicine.`,
      ],
      rationale: `Improvement in the ${t.lab} shows a therapeutic response in ${t.name}. The other findings suggest deterioration.`,
    },
    {
      stem: `In ${category.toLowerCase()}, which record entry about ${t.name} is most appropriate?`,
      correct: `\u201c${Pc} has ${t.finding}; nurse acted to ${t.action}; ${PROVIDER} informed.\u201d`,
      distractors: [
        `\u201c${Pc} appears to be doing poorly today.\u201d`,
        `\u201c${Pc} seems anxious and probably needs sedation.\u201d`,
        `\u201c${Pc} uncooperative; refused everything offered.\u201d`,
      ],
      rationale: `Documentation should be objective, describe the finding, the nursing action, and communication. Subjective or judgmental entries are inappropriate.`,
    },
    {
      stem: `Which task relating to ${t.name} may safely be delegated to a ${ghana ? "healthcare assistant" : "nursing assistant"}?`,
      correct: `Obtaining and recording routine observations for a stable ${P}.`,
      distractors: [
        `Evaluating the ${P}\u2019s response to ${t.drug}.`,
        `Interpreting the trend in the ${t.lab}.`,
        `Teaching the ${P} about ${t.name} at home.`,
      ],
      rationale: `Assessment, evaluation, teaching and clinical judgement cannot be delegated. Routine observations on a stable ${P} are within the support worker scope.`,
    },
  ];
}

async function main() {
  const force = process.argv.includes("--force");
  // Demo data (sample student, tasks, referrals, and a demo admin whose
  // password is public) is STRICTLY opt-in. It is only ever created when
  // SEED_DEMO=true is set explicitly. Any other value — unset, "false", or a
  // production/automated re-seed — loads content only, never demo accounts.
  const SEED_DEMO = process.env.SEED_DEMO === "true";
  const existing = await db.execute<{ count: string }>(sql`select count(*)::text as count from questions`);
  const count = Number(existing.rows[0]?.count ?? 0);

  if (force || count < 44000) {
    await db.execute(sql`truncate table questions restart identity cascade`);
    const rows: (typeof questions.$inferInsert)[] = [];
    let n = 0;

    const build = (
      exam: string,
      groups: { category: string; clientNeed: string; topics: Topic[] }[],
      variants: number,
    ) => {
      for (const cat of groups) {
        for (const topic of cat.topics) {
          const drafts = buildDrafts(topic, cat.category, exam);
          for (let variant = 0; variant < variants; variant++) {
            for (const d of drafts) {
              n++;
              const opts = shuffleWithSeed([d.correct, ...d.distractors], n * 7 + variant);
              rows.push({
                exam,
                stem: variant === 0 ? d.stem : `${d.stem} (Case ${variant + 1})`,
                options: opts,
                correctIndex: opts.indexOf(d.correct),
                rationale: d.rationale,
                category: cat.category,
                difficulty: DIFFICULTIES[n % 3],
                clientNeed: cat.clientNeed,
              });
            }
          }
        }
      }
    };

    // NCLEX: 10 categories x 20 topics x 10 variants x 10 drafts = 20,000
    build("NCLEX", CATEGORIES, 10);
    // Ghana NMC (RGN): 10 categories x 12 topics x 10 variants x 10 drafts = 12,000
    build("GHANA_NMC", GHANA_NMC_CATEGORIES, 10);
    // Midwifery: 10 categories x 12 topics x 10 variants x 10 drafts = 12,000
    build("MIDWIFERY", MIDWIFERY_CATEGORIES, 10);
    for (let i = 0; i < rows.length; i += 1000) {
      await db.insert(questions).values(rows.slice(i, i + 1000));
    }
    console.log(
      `Inserted ${rows.length} questions (NCLEX ${rows.filter((r) => r.exam === "NCLEX").length}, Ghana NMC ${rows.filter((r) => r.exam === "GHANA_NMC").length}, Midwifery ${rows.filter((r) => r.exam === "MIDWIFERY").length})`,
    );
  } else {
    console.log(`Questions already seeded: ${count}`);
  }

  // Learning library
  await db.execute(sql`truncate table lessons restart identity`);
  await db.insert(lessons).values(
    LESSON_SEEDS.map((l, i) => ({
      title: l.title,
      description: l.description,
      section: l.section,
      topic: l.topic,
      durationMin: l.durationMin,
      searchQuery: l.searchQuery,
      premium: l.premium,
      exam: l.exam ?? "ALL",
      sortOrder: i,
    })),
  );
  console.log(`Seeded ${LESSON_SEEDS.length} lessons`);

  if (!SEED_DEMO) {
    console.log("Skipping demo data (SEED_DEMO=false). Content is seeded.");
    await pool.end();
    return;
  }

  // Demo user
  const demoEmail = "demo@nursingprep.app";
  const existingUser = await db.execute<{ id: number }>(
    sql`select id from users where email = ${demoEmail} limit 1`,
  );
  let userId = existingUser.rows[0]?.id;
  if (!userId) {
    const inserted = await db
      .insert(users)
      .values({
        name: "Amara Okoye",
        email: demoEmail,
        passwordHash: hashPassword("demo1234"),
        role: "student",
      })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  // The demo account is ONLY an admin when demo seeding is explicitly enabled
  // (local/staging). In production it must never hold admin rights.
  if (SEED_DEMO) {
    await db.update(users).set({ role: "admin" }).where(sql`id = ${userId}`);
  }

  // Referral programme demo data
  await db
    .update(users)
    .set({ referralCode: "AMARA7XQ2", walletBalance: 150 })
    .where(sql`id = ${userId} and referral_code is null`);

  const refCount = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from referrals where referrer_id = ${userId}`,
  );
  if (Number(refCount.rows[0]?.count ?? 0) === 0) {
    const friends = [
      ["Kwame Mensah", "kwame.mensah@example.com", "converted", 50, "monthly", 18],
      ["Efua Boateng", "efua.boateng@example.com", "converted", 100, "semester", 12],
      ["Selina Adjei", "selina.adjei@example.com", "converted", 50, "monthly", 9],
      ["Yaw Owusu", "yaw.owusu@example.com", "signed_up", 0, null, 4],
      ["Nana Ama Darko", "nana.darko@example.com", "signed_up", 0, null, 2],
    ] as const;
    for (const [name, email, status, reward, plan, daysAgo] of friends) {
      const created = new Date(Date.now() - daysAgo * 86400000);
      const inserted = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash: hashPassword("demo1234"),
          referralCode: buildReferralCode(name),
          referredByUserId: userId,
          plan: plan ?? "free",
          planExpiresAt: plan ? new Date(Date.now() + 30 * 86400000) : null,
        })
        .onConflictDoNothing()
        .returning({ id: users.id });
      const refereeId = inserted[0]?.id;
      if (!refereeId) continue;
      await db.insert(referrals).values({
        referrerId: userId,
        refereeId,
        refereeName: name,
        refereeEmail: email,
        code: "AMARA7XQ2",
        status,
        rewardAmount: reward,
        plan: plan ?? null,
        convertedAt: status === "converted" ? created : null,
        createdAt: created,
      });
    }
  }

  const payCount = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from payouts where user_id = ${userId}`,
  );
  if (Number(payCount.rows[0]?.count ?? 0) === 0) {
    await db.insert(payouts).values({
      userId,
      amount: 500,
      method: "mtn_momo",
      destination: "0244123456",
      status: "requested",
      note: "Referral rewards withdrawal",
    });
  }

  const taskCount = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from tasks where user_id = ${userId}`,
  );
  if (Number(taskCount.rows[0]?.count ?? 0) === 0) {
    const day = (d: number) => new Date(Date.now() + d * 86400000);
    await db.insert(tasks).values([
      { userId, title: "Complete 50 pharmacology questions", notes: "Focus on anticoagulants and insulins.", category: "Pharmacology", priority: "high", status: "in_progress", dueDate: day(1), targetQuestions: 50 },
      { userId, title: "Review acid-base balance", notes: "ROME method drills + 20 questions.", category: "Health Assessment", priority: "medium", status: "todo", dueDate: day(3), targetQuestions: 20 },
      { userId, title: "Maternal-newborn content review", notes: "Preeclampsia, postpartum hemorrhage, fetal monitoring.", category: "Maternal-Newborn", priority: "high", status: "todo", dueDate: day(4), targetQuestions: 40 },
      { userId, title: "Prioritization & delegation drill", notes: "Management of care questions, timed.", category: "Leadership & Management", priority: "medium", status: "todo", dueDate: day(6), targetQuestions: 30 },
      { userId, title: "Peds growth & development flashcards", notes: "Milestones by age group.", category: "Pediatrics", priority: "low", status: "todo", dueDate: day(8), targetQuestions: 15 },
      { userId, title: "Mental health medications review", notes: "Lithium, clozapine, MAOIs.", category: "Mental Health", priority: "medium", status: "done", completed: true, dueDate: day(-2), targetQuestions: 25 },
      { userId, title: "Infection control precautions quiz", notes: "Airborne / droplet / contact.", category: "Safety & Infection Control", priority: "low", status: "done", completed: true, dueDate: day(-5), targetQuestions: 20 },
    ]);
    await db.insert(attempts).values([
      { userId, category: "Pharmacology", total: 25, correct: 19 },
      { userId, category: "Mental Health", total: 20, correct: 17 },
      { userId, category: "Critical Care", total: 15, correct: 9 },
      { userId, category: "Fundamentals", total: 30, correct: 26 },
      { userId, category: "Pediatrics", total: 10, correct: 7 },
    ]);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

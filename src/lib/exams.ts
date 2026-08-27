export type ExamId = "NCLEX" | "GHANA_NMC" | "MIDWIFERY";

export type Exam = {
  id: ExamId;
  name: string;
  full: string;
  flag: string;
  blurb: string;
  /** Timed mock exam format */
  mock: { questions: number; minutes: number; label: string };
  categories: string[];
};

export const EXAMS: Exam[] = [
  {
    id: "NCLEX",
    name: "NCLEX",
    full: "NCLEX-RN / NCLEX-PN (USA & Canada)",
    flag: "🇺🇸",
    blurb:
      "Licensure for registered and practical nurses in the United States and Canada, built around the four Client Needs categories.",
    mock: { questions: 75, minutes: 90, label: "75 questions · 90 minutes" },
    categories: [
      "Medical-Surgical",
      "Pharmacology",
      "Maternal-Newborn",
      "Pediatrics",
      "Mental Health",
      "Fundamentals",
      "Safety & Infection Control",
      "Critical Care",
      "Leadership & Management",
      "Health Assessment",
    ],
  },
  {
    id: "GHANA_NMC",
    name: "Ghana NMC",
    full: "NMC Ghana Licensing Examination — Registered General Nursing",
    flag: "🇬🇭",
    blurb:
      "The Nursing and Midwifery Council of Ghana licensing exam for Registered General Nursing. Ghana clinical practice, the Ghana Health System, CHPS, and national treatment guidelines.",
    mock: { questions: 100, minutes: 120, label: "100 questions · 2 hours" },
    categories: [
      "Ghana Health System & CHPS",
      "Medical-Surgical Nursing (Ghana)",
      "Pharmacology & Ghana STG",
      "Community Health Nursing",
      "Maternal & Newborn Care",
      "Child Health (Ghana)",
      "Mental Health Nursing",
      "Communicable Diseases (Ghana)",
      "Professional Practice & NMC Ghana Code",
      "Emergency & Critical Care",
    ],
  },
  {
    id: "MIDWIFERY",
    name: "Midwifery",
    full: "NMC Ghana Licensing Examination — Midwifery",
    flag: "👶",
    blurb:
      "A dedicated midwifery question bank: antenatal care, normal and complicated labour, obstetric emergencies, the puerperium, newborn care, family planning and women's health.",
    mock: { questions: 100, minutes: 120, label: "100 questions · 2 hours" },
    categories: [
      "Antenatal Care",
      "Normal Labour & Delivery",
      "Obstetric Emergencies",
      "Puerperium & Postnatal Care",
      "Newborn Care",
      "Breastfeeding & Infant Feeding",
      "Family Planning",
      "Malaria & Infections in Pregnancy",
      "Midwifery Professional Practice",
      "Gynaecology & Women's Health",
    ],
  },
];

export const DEFAULT_EXAM: ExamId = "NCLEX";

export function getExam(id: string): Exam {
  return EXAMS.find((e) => e.id === id) ?? EXAMS[0];
}

export function categoriesFor(examId: string) {
  return getExam(examId).categories;
}

/** All categories across every exam track (used by the study task manager). */
export const ALL_CATEGORIES = Array.from(
  new Set(EXAMS.flatMap((e) => e.categories)),
);

/** Human label for a stored exam id, safe for unknown values. */
export function examLabel(id: string): string {
  return getExam(id).name;
}

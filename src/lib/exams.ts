export type ExamId = "NCLEX" | "NMC";

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
    id: "NMC",
    name: "NMC",
    full: "NMC CBT Part 1 & OSCE (United Kingdom)",
    flag: "🇬🇧",
    blurb:
      "Registration for internationally educated nurses and midwives in the UK — the computer-based Test of Competence plus the practical OSCE.",
    mock: { questions: 120, minutes: 240, label: "120 questions · 4 hours" },
    categories: [
      "The NMC Code & Accountability",
      "Numeracy & Drug Calculations",
      "Safeguarding & Consent (UK)",
      "Infection Prevention (UK)",
      "Adult Nursing (UK)",
      "Mental Health Nursing (UK)",
      "Midwifery & Maternal Care (UK)",
      "Child & Young Person Nursing (UK)",
      "OSCE Skills & Stations",
      "Care Planning: APIE",
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

/** All categories across both exams (used by the study task manager). */
export const ALL_CATEGORIES = Array.from(
  new Set(EXAMS.flatMap((e) => e.categories)),
);

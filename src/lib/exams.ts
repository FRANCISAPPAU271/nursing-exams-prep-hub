export type ExamId = "NCLEX" | "MIDWIFERY";

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
      "Safe and Effective Care Environment",
      "Health Promotion and Maintenance",
      "Psychosocial Integrity",
      "Clinical Judgement",
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
      "Family Planning",
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

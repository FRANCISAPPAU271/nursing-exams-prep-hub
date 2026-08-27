export type ExamId = "ALL_NURSES";

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
    id: "ALL_NURSES",
    name: "Question Bank",
    full: "Question Bank for All Nurses",
    flag: "🩺",
    blurb:
      "A single question bank for every nurse — student or qualified, in any speciality. Clinical nursing, medicines, maternal and child health, mental health, infection prevention and fundamentals, each question with a full rationale.",
    mock: { questions: 100, minutes: 100, label: "100 questions · 100 minutes" },
    categories: [
      "Cardiovascular Nursing",
      "Respiratory Nursing",
      "Endocrine Nursing",
      "Renal Nursing",
      "Neurological Nursing",
      "Gastrointestinal Nursing",
      "Maternal & Child Health",
      "Mental Health Nursing",
      "Infection Prevention",
      "Fundamentals of Nursing",
    ],
  },
];

export const DEFAULT_EXAM: ExamId = "ALL_NURSES";

export function getExam(id: string): Exam {
  return EXAMS.find((e) => e.id === id) ?? EXAMS[0];
}

export function categoriesFor(examId: string) {
  return getExam(examId).categories;
}

/** All categories across every track. */
export const ALL_CATEGORIES = Array.from(
  new Set(EXAMS.flatMap((e) => e.categories)),
);

/** Human label for a stored exam id, safe for unknown values. */
export function examLabel(id: string): string {
  return getExam(id).name;
}

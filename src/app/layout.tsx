import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "All Nursing Exams Prep Hub — Nursing exams with a plan, not panic",
    template: "%s · All Nursing Exams Prep Hub",
  },
  description:
    "A single question bank for every nurse: 1,000+ practice questions with rationales, a study task manager, adaptive CAT tests, exam-accurate mock tests, care plans and video lessons.",
  keywords: [
    "NMC CBT",
    "Midwifery",
    "Test of Competence",
    "NCLEX",
    "NCLEX-RN",
    "nursing exam",
    "student nurses",
    "practice questions",
    "mock exam",
    "Ghana",
  ],
  openGraph: {
    title: "Nursing exams with a plan, not panic",
    description:
      "Nursing practice questions across 10 categories with rationales, study task manager, exam-accurate mock tests and a video learning library.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}

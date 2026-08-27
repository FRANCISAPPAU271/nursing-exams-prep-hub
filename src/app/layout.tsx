import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "All Nursing Exams Prep Hub — NMC exams and NCLEX with a plan, not panic",
    template: "%s · All Nursing Exams Prep Hub",
  },
  description:
    "Prepare for the Ghana NMC licensing exams, the Midwifery licensing exam, or the US NCLEX in one place: 44,000 practice questions with rationales, a study task manager, adaptive CAT tests, exam-accurate mock tests, care plans and video lessons.",
  keywords: [
    "NMC CBT",
    "Ghana NMC",
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
    title: "NMC exams and NCLEX with a plan, not panic",
    description:
      "44,000 Ghana NMC, Midwifery and NCLEX practice questions with rationales, study task manager, exam-accurate mock tests and a video learning library.",
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

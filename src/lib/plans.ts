export const MOMO_NUMBER = "0598872146";
export const MOMO_NETWORK = "MTN Mobile Money";
export const MOMO_NAME = "All Nursing Exams Prep Hub";
export const MOMO_USSD = "*170#";

/**
 * Prices are set in US dollars, but MTN Mobile Money settles in Ghana cedis.
 * This rate converts the plan price into the amount a student must actually
 * send. Review it whenever the exchange rate moves materially.
 */
export const USD_TO_GHS = 12;

/** Cedi amount a student should send for a given USD plan price. */
export function ghsAmount(priceUsd: number) {
  return Math.ceil(priceUsd * USD_TO_GHS);
}

/** Step-by-step MTN MoMo send-money instructions shown to students. */
export const MOMO_STEPS = [
  `Dial ${MOMO_USSD} on your MTN line`,
  "Choose 1 — Transfer Money",
  "Choose 1 — MoMo User",
  `Enter the number ${MOMO_NUMBER}`,
  "Enter the exact cedi amount shown on your payment page",
  "Enter your payment reference as the message",
  "Confirm with your MoMo PIN and keep the SMS",
];

export type Plan = {
  id: string;
  name: string;
  price: number; // whole US dollars
  months: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    months: 0,
    tagline: "Free forever",
    features: [
      "Unlimited study task manager",
      "Browse all 7,000+ practice questions",
      "Practice quizzes up to 10 questions",
      "FAQ & exam strategy guides",
    ],
  },
  {
    id: "monthly",
    name: "Pro Monthly",
    price: 5,
    months: 1,
    tagline: "Best for final-stretch revision",
    highlight: true,
    features: [
      "Everything in Starter",
      "Full 75-question timed mock exams",
      "Complete learning video library",
      "Care plan & nursing process modules",
      "Category analytics & remediation",
    ],
  },
  {
    id: "semester",
    name: "Pro Semester",
    price: 10,
    months: 4,
    tagline: "4 months — save 50%",
    features: [
      "Everything in Pro Monthly",
      "4 months of full access",
      "Priority content updates",
      "Downloadable study planner templates",
    ],
  },
  {
    id: "annual",
    name: "Pro Annual",
    price: 18,
    months: 12,
    tagline: "12 months — save 70%",
    features: [
      "Everything in Pro Semester",
      "12 months of full access",
      "Unlimited mock exam retakes",
      "Pass-or-extend guarantee",
    ],
  },
];

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}

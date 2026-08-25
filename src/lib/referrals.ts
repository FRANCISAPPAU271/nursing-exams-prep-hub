import { randomInt } from "crypto";

/** Referrer earns this share of every plan their referee activates. */
export const REFERRAL_RATE = 0.1;
/** Bonus days of Pro the new student gets for joining with a code. */
export const REFEREE_BONUS_DAYS = 5;
/** Minimum wallet balance (cents) before a payout can be requested. */
export const MIN_PAYOUT = 500; // $5

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function buildReferralCode(name: string) {
  const base = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 5)
    .padEnd(3, "X");
  const suffix = Array.from({ length: 4 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
  return `${base}${suffix}`;
}

export function rewardFor(planPriceUsd: number) {
  return Math.round(planPriceUsd * 100 * REFERRAL_RATE); // cents
}

export const REFERRAL_STEPS = [
  {
    icon: "🔗",
    title: "Share your link",
    body: "Every account gets a unique referral code and link. Send it to classmates, your cohort WhatsApp group or your ward colleagues.",
  },
  {
    icon: "🎁",
    title: "They get a head start",
    body: `Anyone who signs up with your code instantly receives ${REFEREE_BONUS_DAYS} days of Pro access — free video library and mock exams.`,
  },
  {
    icon: "💰",
    title: "You earn 10% cash",
    body: "When your referral activates any paid plan, 10% of what they paid lands in your rewards wallet automatically.",
  },
  {
    icon: "📲",
    title: "Cash out to MoMo",
    body: `Withdraw to any mobile money number once your balance reaches $${MIN_PAYOUT / 100}. Payouts are processed within 48 hours.`,
  },
];

export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

/**
 * All monetary values are stored in the database as integer **cents**.
 *
 * Display rule: never show trailing ".00". Whole dollars render as "$15".
 * Fractional values (only possible on small referral rewards) render with
 * two decimals so we never misreport what someone is owed.
 */
export function usd(cents: number) {
  const whole = cents % 100 === 0;
  return `${CURRENCY_SYMBOL}${whole ? cents / 100 : (cents / 100).toFixed(2)}`;
}

/** Format a whole-dollar plan price, e.g. 15 -> "$15". */
export function usdWhole(dollars: number) {
  return `${CURRENCY_SYMBOL}${Math.round(dollars)}`;
}

export const toCents = (dollars: number) => Math.round(dollars * 100);

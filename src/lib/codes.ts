import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateActivationCode() {
  const block = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
  return `PREP-${block()}-${block()}`;
}

export function generateReference() {
  return `NPH-${Date.now().toString(36).toUpperCase()}-${randomInt(1000, 9999)}`;
}

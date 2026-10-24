// Plain-code earnings extraction. Pure: text in, EarningsRead out.
// The total ALWAYS equals the sum of the parsed amounts, to the cent (E4).

import type { EarningsRead, EarningsWeekRead } from "./types";

const MONTHS =
  "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December";
// e.g. "Mar 1–7", "Mar 8-14", "March 22–31"
const RANGE_RE = new RegExp(
  `(?:${MONTHS})\\.?\\s*\\d{1,2}\\s*[–\\-]\\s*\\d{1,2}`,
  "gi",
);
// e.g. "$148.50", "$1,711.25", "$139", "$1000.00" (comma optional)
const AMOUNT_RE = /\$\s?(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g;

function parseAmount(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Read earnings from free text (OCR or a pasted block). Pairs each date range
 * with the next dollar amount when both are present; otherwise returns the bare
 * amounts. Total = sum of amounts (E4).
 */
export function readEarnings(text: string): EarningsRead {
  const amounts: number[] = [];
  let m: RegExpExecArray | null;
  const amountRe = new RegExp(AMOUNT_RE.source, "g");
  while ((m = amountRe.exec(text)) !== null) {
    const v = parseAmount(m[1]!);
    if (Number.isFinite(v)) amounts.push(v);
  }

  const ranges = text.match(RANGE_RE) ?? [];

  const weeks: EarningsWeekRead[] = amounts.map((amount, i) => ({
    period: ranges[i] ?? `Item ${i + 1}`,
    amount,
  }));

  const total = round2(amounts.reduce((s, a) => s + a, 0));
  return { weeks, total };
}

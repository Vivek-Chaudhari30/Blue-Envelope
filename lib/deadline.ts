// Deadline and formatting helpers. These live in the UI layer, NOT the rules
// engine (the engine must stay pure with no ambient clock).

// Sample renewal deadline from docs/SAMPLE_CONTENT.md.
export const DEADLINE = new Date("2026-12-15T23:59:00-05:00").getTime();

/** Whole days left until the deadline, never negative. Pass `now` for tests. */
export function daysLeft(now: number = Date.now()): number {
  return Math.max(0, Math.ceil((DEADLINE - now) / 86_400_000));
}

/** US dollar formatting with two decimals, e.g. $612.00. */
export function money(n: number): string {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

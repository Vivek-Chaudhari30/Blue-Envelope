// Grounding and banned-phrase checks for Luna output. Pure and property-tested.
// Grounding: every date, amount and line id a response returns must exist in
// the submitted text. Banned: no returned string may contain a promise phrase.

import { BANNED } from "@/lib/i18n";
import type { GuideOut, GuideReason } from "./schema";

/** Collect the free-text strings a response exposes to the member. */
function textValues(reason: GuideReason, out: GuideOut): string[] {
  switch (reason) {
    case "letter_repair":
      return [(out as { value: string }).value];
    case "letter_unknown_type":
      return [(out as { summary: string }).summary];
    case "earnings_normalize":
      return (out as { weeks: { period: string }[] }).weeks.map((w) => w.period);
    case "member_help":
      return [(out as { answer: string }).answer];
    case "cover_note":
      return [(out as { sentence: string }).sentence];
    default:
      return [];
  }
}

/** Numbers + simple dates in a string, for the cover_note grounding check. */
function numberAndDateTokens(s: string): string[] {
  const nums = s.match(/\$?\d[\d,.]*/g) ?? [];
  const months =
    "January|February|March|April|May|June|July|August|September|October|November|December";
  const dates = s.match(new RegExp(`(?:${months})\\s+\\d{1,2},?\\s+\\d{4}`, "gi")) ?? [];
  return [...nums.map((n) => n.replace(/[$,]/g, "")), ...dates];
}

/**
 * cover_note grounding: the rewritten sentence must not introduce any number
 * or date that is absent from the member's own words.
 */
export function coverNoteGrounded(sentence: string, memberWords: string): boolean {
  const have = new Set(numberAndDateTokens(memberWords));
  for (const tok of numberAndDateTokens(sentence)) {
    if (!have.has(tok) && !memberWords.includes(tok)) return false;
  }
  return true;
}

/** Numbers/dates/line ids that must be grounded in the submitted text. */
function groundedTokens(
  reason: GuideReason,
  out: GuideOut,
): { amounts: number[]; strings: string[] } {
  switch (reason) {
    case "letter_repair": {
      const o = out as { value: string; lineId: string };
      return { amounts: [], strings: [o.value, o.lineId] };
    }
    case "earnings_normalize": {
      const o = out as { weeks: { period: string; amount: number }[] };
      return {
        amounts: o.weeks.map((w) => w.amount),
        strings: o.weeks.map((w) => w.period),
      };
    }
    default:
      return { amounts: [], strings: [] };
  }
}

function amountInText(amount: number, text: string): boolean {
  // Require an EXACT representation in the text — the two-decimal form, or the
  // exact numeric string. A rounded whole-dollar match is deliberately NOT
  // accepted: $0.02 must not count as grounded just because $0.01 is present.
  const cents = amount.toFixed(2);
  const normalized = text.replace(/,/g, "");
  if (normalized.includes(cents)) return true;
  // Exact numeric token (handles whole dollars written without decimals).
  const tok = amount % 1 === 0 ? String(amount) : amount.toString();
  return new RegExp(`(?<![\\d.])${tok.replace(/\./g, "\\.")}(?![\\d])`).test(
    normalized,
  );
}

/** True when every returned date/amount/line id appears in the submitted text. */
export function isGrounded(
  reason: GuideReason,
  out: GuideOut,
  submittedText: string,
  lineIds: string[] = [],
): boolean {
  const { amounts, strings } = groundedTokens(reason, out);
  for (const a of amounts) {
    if (!amountInText(a, submittedText)) return false;
  }
  for (const s of strings) {
    if (!s) continue;
    // A line id is grounded if it's a known id; other strings must appear in text.
    if (lineIds.includes(s)) continue;
    if (!submittedText.includes(s)) return false;
  }
  return true;
}

/** True when no returned string contains a banned phrase in any language. */
export function hasBannedPhrase(reason: GuideReason, out: GuideOut): boolean {
  const all = Object.values(BANNED).flat().map((p) => p.toLowerCase());
  for (const v of textValues(reason, out)) {
    const lower = v.toLowerCase();
    if (all.some((p) => lower.includes(p))) return true;
  }
  return false;
}

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { isGrounded, hasBannedPhrase } from "@/lib/guide/ground";
import { BANNED } from "@/lib/i18n";

describe("guide grounding", () => {
  it("earnings_normalize: rejects an amount not present in the text", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999999 }),
        fc.integer({ min: 1, max: 999999 }),
        (present, absent) => {
          fc.pre(present !== absent);
          const text = `You earned $${(present / 100).toFixed(2)} in March.`;
          const out = {
            weeks: [{ period: "March", amount: absent / 100 }],
            total: absent / 100,
          };
          // "March" is in the text; the absent amount is not => not grounded.
          expect(isGrounded("earnings_normalize", out, text)).toBe(false);
        },
      ),
    );
  });

  it("earnings_normalize: accepts amounts present in the text", () => {
    const text = "Mar 1-7 $148.50 and Mar 8-14 $171.25";
    const out = {
      weeks: [
        { period: "Mar 1-7", amount: 148.5 },
        { period: "Mar 8-14", amount: 171.25 },
      ],
      total: 319.75,
    };
    expect(isGrounded("earnings_normalize", out, text)).toBe(true);
  });

  it("letter_repair: a value not in the text is not grounded", () => {
    const text = "Please respond by December 15, 2026.";
    const good = { field: "deadline" as const, value: "December 15, 2026", lineId: "l2" };
    const bad = { field: "deadline" as const, value: "January 1, 2099", lineId: "l2" };
    expect(isGrounded("letter_repair", good, text, ["l2"])).toBe(true);
    expect(isGrounded("letter_repair", bad, text, ["l2"])).toBe(false);
  });
});

describe("guide banned-phrase filter", () => {
  it("flags a banned phrase in any language", () => {
    const langs = Object.keys(BANNED) as (keyof typeof BANNED)[];
    for (const lang of langs) {
      for (const phrase of BANNED[lang]) {
        const out = { answer: `Good news — ${phrase} for this program.` };
        expect(hasBannedPhrase("member_help", out)).toBe(true);
      }
    }
  });

  it("passes clean, approved-framing text", () => {
    const out = {
      answer: "You may meet the rule. MassHealth makes the decision.",
    };
    expect(hasBannedPhrase("member_help", out)).toBe(false);
  });

  it("property: any answer containing an English banned phrase is caught", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...BANNED.en),
        fc.string(),
        fc.string(),
        (phrase, pre, post) => {
          const out = { answer: `${pre} ${phrase} ${post}` };
          expect(hasBannedPhrase("member_help", out)).toBe(true);
        },
      ),
    );
  });
});

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readLetter } from "@/lib/readers/letter-rules";
import { readEarnings } from "@/lib/readers/earnings-rules";
import type { OcrLine } from "@/lib/readers/types";

function line(id: string, text: string): OcrLine {
  return { id, text, bbox: { x: 0, y: 0, w: 1, h: 1 }, confidence: 95 };
}

describe("reader properties", () => {
  // E2: never invent a deadline. If the returned deadline date exists, it must
  // appear verbatim somewhere in the input text.
  it("E2: any returned deadline date appears verbatim in the text", () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { maxLength: 8 }), (texts) => {
        const lines = texts.map((t, i) => line(`l${i}`, t));
        const f = readLetter(lines);
        if (f.deadline) {
          const joined = texts.join(" ");
          expect(joined).toContain(f.deadline.date);
        }
      }),
    );
  });

  // E2 strengthened: text with no digits can never yield a deadline.
  it("E2: text with no digits yields no deadline", () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[A-Za-z .,]*$/), { maxLength: 6 }),
        (texts) => {
          const lines = texts.map((t, i) => line(`l${i}`, t));
          expect(readLetter(lines).deadline).toBeUndefined();
        },
      ),
    );
  });

  // E4: earnings total equals the sum of the parsed amounts, to the cent.
  it("E4: total equals the sum of parsed amounts", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 500000 }), { maxLength: 12 }),
        (cents) => {
          const text = cents
            .map((c) => `$${(c / 100).toFixed(2)}`)
            .join("  ");
          const r = readEarnings(text);
          const expected =
            Math.round(cents.reduce((s, c) => s + c, 0)) / 100;
          expect(r.total).toBeCloseTo(expected, 2);
          expect(r.weeks.length).toBe(cents.length);
        },
      ),
    );
  });
});

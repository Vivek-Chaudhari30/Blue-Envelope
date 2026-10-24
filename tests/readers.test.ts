import { describe, it, expect } from "vitest";
import { readLetter } from "@/lib/readers/letter-rules";
import { readEarnings } from "@/lib/readers/earnings-rules";
import type { OcrLine } from "@/lib/readers/types";
import { SAMPLE_WEEKS, SAMPLE_EARNINGS_TOTAL } from "@/content/sample-earnings";

function line(id: string, text: string, confidence = 95): OcrLine {
  return { id, text, bbox: { x: 0, y: 0, w: 1, h: 1 }, confidence };
}

// OCR lines approximating the sample renewal letter.
const SAMPLE_LINES: OcrLine[] = [
  line("l0", "HEALTH COVERAGE RENEWAL"),
  line("l1", "It is time to renew your MassHealth coverage. Some members must show 80 hours a month or income of at least $580 a month."),
  line("l2", "Please respond by December 15, 2026. If we do not hear from you, your coverage may end."),
  line("l3", "Tell us about your work, school, volunteering or job training for one month."),
  line("l4", "Send proof such as pay stubs or a letter from your employer."),
  line("l5", "You can respond online, by mail, by fax, or by phone."),
];

describe("letter rules", () => {
  it("extracts the deadline verbatim with its line id", () => {
    const f = readLetter(SAMPLE_LINES);
    expect(f.deadline?.date).toBe("December 15, 2026");
    expect(f.deadline?.lineId).toBe("l2");
  });

  it("finds asking, send and how lines", () => {
    const f = readLetter(SAMPLE_LINES);
    expect(f.asking?.lineId).toBe("l3");
    expect(f.send?.lineId).toBe("l4");
    expect(f.how?.lineId).toBe("l5");
  });

  it("detects the standard renewal notice", () => {
    expect(readLetter(SAMPLE_LINES).isStandardRenewal).toBe(true);
  });

  it("E2: returns NO deadline when the text has no date", () => {
    const noDate = [line("a", "Please respond soon or your coverage may end.")];
    expect(readLetter(noDate).deadline).toBeUndefined();
    expect(readLetter(noDate).needsGuide).toContain("deadline");
  });

  it("flags a non-standard letter type for the guide", () => {
    const other = [line("a", "Your appointment is confirmed for Tuesday.")];
    const f = readLetter(other);
    expect(f.isStandardRenewal).toBe(false);
    expect(f.needsGuide).toContain("type");
  });

  it("low OCR confidence on a matched field still needs the guide", () => {
    const lines = [line("a", "Please respond by December 15, 2026.", 30)];
    expect(readLetter(lines).needsGuide).toContain("deadline");
  });
});

describe("earnings rules", () => {
  it("reads the four sample weeks and totals $612.00", () => {
    const text = SAMPLE_WEEKS.map((w) => `${w.label} $${w.amount.toFixed(2)}`).join("\n");
    const r = readEarnings(text);
    expect(r.weeks).toHaveLength(4);
    expect(r.total).toBe(SAMPLE_EARNINGS_TOTAL);
    expect(r.total).toBe(612.0);
  });

  it("handles commas in amounts", () => {
    const r = readEarnings("Mar 1-7 $1,148.50");
    expect(r.total).toBe(1148.5);
  });
});

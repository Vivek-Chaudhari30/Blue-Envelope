import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { coverLines, pathSentence } from "@/lib/packet/cover";
import { coverNoteGrounded } from "@/lib/guide/ground";
import { BANNED } from "@/lib/i18n";
import type { Status } from "@/lib/rules/types";

const STATUSES: Status[] = ["age", "excused", "income", "school", "hours", "short"];
const bannedAll = Object.values(BANNED).flat().map((p) => p.toLowerCase());

describe("ready-to-send — cover page", () => {
  it("cover text never contains a banned phrase and always shows the deadline", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...STATUSES),
        fc.integer({ min: 0, max: 20000 }),
        fc.integer({ min: 0, max: 400 }),
        (status, income, hours) => {
          const lines = coverLines({
            deadline: "December 15, 2026",
            noticeDate: "November 2, 2026",
            status,
            income,
            hours,
            enclosures: ["March earnings summary"],
          });
          const text = lines.join("\n").toLowerCase();
          for (const phrase of bannedAll) expect(text.includes(phrase)).toBe(false);
          expect(lines.some((l) => l.includes("December 15, 2026"))).toBe(true);
        },
      ),
    );
  });

  it("path sentence never promises eligibility", () => {
    for (const s of STATUSES) {
      const low = pathSentence(s, 612, 74).toLowerCase();
      for (const phrase of BANNED.en) expect(low.includes(phrase)).toBe(false);
      expect(low).toContain("masshealth makes the decision");
    }
  });

  it("Name/Member ID are blank unless provided", () => {
    const blank = coverLines({ deadline: "December 15, 2026", noticeDate: "x", status: "income", income: 612, hours: 74, enclosures: [] });
    expect(blank.some((l) => l.startsWith("Name: ____"))).toBe(true);
    const filled = coverLines({ deadline: "December 15, 2026", noticeDate: "x", status: "income", income: 612, hours: 74, enclosures: [], name: "Maria Santos", memberId: "000-SAMPLE-00" });
    expect(filled.some((l) => l === "Name: Maria Santos")).toBe(true);
    expect(filled.some((l) => l.includes("000-SAMPLE-00"))).toBe(true);
  });
});

describe("ready-to-send — cover_note grounding", () => {
  it("rejects a rewrite that adds a number or date the member didn't write", () => {
    expect(coverNoteGrounded("I worked 80 hours in March.", "I worked a lot last month.")).toBe(false);
    expect(coverNoteGrounded("I worked last month and sent proof.", "I worked last month. I am sending proof.")).toBe(true);
  });

  it("property: a rewrite with a number absent from the words is rejected", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 9999 }), (n) => {
        const words = "I did my best to respond on time.";
        const rewrite = `I completed ${n} hours of work.`;
        expect(coverNoteGrounded(rewrite, words)).toBe(false);
      }),
    );
  });
});

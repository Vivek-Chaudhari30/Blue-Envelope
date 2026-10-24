import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { evaluate, INCOME_RULE, HOURS_RULE } from "@/lib/rules/engine";
import { SOURCES } from "@/lib/rules/sources";
import type { AgeBand, ExemptionId, RulesInput } from "@/lib/rules/types";

const AGES: AgeBand[] = ["under-19", "19-64", "65-plus"];
const EXEMPTIONS: ExemptionId[] = [
  "pregnant",
  "caregiver",
  "medicare",
  "health",
  "treatment",
  "veteran",
];

const hours = fc.double({ min: 0, max: 500, noNaN: true });
const money = fc.double({ min: 0, max: 20000, noNaN: true });
const bool = fc.boolean();

const arbInput: fc.Arbitrary<RulesInput> = fc.record({
  age: fc.constantFrom(...AGES),
  exemptions: fc
    .subarray(EXEMPTIONS)
    .map((xs) => (xs.length ? xs : (["none"] as ExemptionId[]))),
  act: fc.record({
    work: fc.record({ on: bool, hours, income: money }),
    volunteer: fc.record({ on: bool, hours }),
    training: fc.record({ on: bool, hours }),
    school: fc.record({ on: bool }),
  }),
});

function totalHours(i: RulesInput): number {
  const a = i.act;
  return (
    (a.work.on ? a.work.hours : 0) +
    (a.volunteer.on ? a.volunteer.hours : 0) +
    (a.training.on ? a.training.hours : 0)
  );
}

describe("rules engine — properties (RULES_SOURCE.md §4)", () => {
  it("P1: any exemption present (19-64) => excused", () => {
    fc.assert(
      fc.property(arbInput, fc.constantFrom(...EXEMPTIONS), (i, ex) => {
        i.age = "19-64";
        i.exemptions = [ex];
        expect(evaluate(i).status).toBe("excused");
      }),
    );
  });

  it("P2: age under-19 or 65-plus => age", () => {
    fc.assert(
      fc.property(
        arbInput,
        fc.constantFrom<AgeBand>("under-19", "65-plus"),
        (i, age) => {
          i.age = age;
          expect(evaluate(i).status).toBe("age");
        },
      ),
    );
  });

  it("P3: 19-64, no exemption, income >= 580 => income (any hours)", () => {
    fc.assert(
      fc.property(arbInput, (i) => {
        i.age = "19-64";
        i.exemptions = ["none"];
        i.act.work.on = true;
        i.act.work.income = INCOME_RULE + Math.floor(Math.random() * 100);
        expect(evaluate(i).status).toBe("income");
      }),
    );
  });

  it("P4: work+volunteer+training >= 80 and no earlier rule => hours", () => {
    fc.assert(
      fc.property(
        fc.record({ w: hours, v: hours, t: hours }),
        ({ w, v, t }) => {
          fc.pre(w + v + t >= HOURS_RULE);
          const i: RulesInput = {
            age: "19-64",
            exemptions: ["none"],
            act: {
              work: { on: true, hours: w, income: 0 }, // income 0 so income path can't fire
              volunteer: { on: true, hours: v },
              training: { on: true, hours: t },
              school: { on: false },
            },
          };
          expect(evaluate(i).status).toBe("hours");
        },
      ),
    );
  });

  it("P5: monotonicity — raising hours/income never moves a passing status to short", () => {
    fc.assert(
      fc.property(arbInput, hours, money, (i, dh, di) => {
        const before = evaluate(i);
        const passing =
          before.status === "income" ||
          before.status === "school" ||
          before.status === "hours";
        fc.pre(passing);
        const bumped: RulesInput = {
          ...i,
          act: {
            work: {
              on: true,
              hours: (i.act.work.on ? i.act.work.hours : 0) + dh,
              income: (i.act.work.on ? i.act.work.income : 0) + di,
            },
            volunteer: {
              on: i.act.volunteer.on,
              hours: i.act.volunteer.hours,
            },
            training: { on: i.act.training.on, hours: i.act.training.hours },
            school: { on: i.act.school.on },
          },
        };
        expect(evaluate(bumped).status).not.toBe("short");
      }),
    );
  });

  it("P6: short => short === 80 - hours and short > 0", () => {
    fc.assert(
      fc.property(arbInput, (i) => {
        const r = evaluate(i);
        fc.pre(r.status === "short");
        expect(r.short).toBe(HOURS_RULE - r.hours);
        expect(r.short!).toBeGreaterThan(0);
      }),
    );
  });

  it("P7: every result has >= 1 source whose id is in the table", () => {
    fc.assert(
      fc.property(arbInput, (i) => {
        const r = evaluate(i);
        expect(r.sources.length).toBeGreaterThanOrEqual(1);
        for (const s of r.sources) {
          expect(Object.prototype.hasOwnProperty.call(SOURCES, s.id)).toBe(true);
        }
      }),
    );
  });

  it("P8: determinism — same input => same output", () => {
    fc.assert(
      fc.property(arbInput, (i) => {
        expect(evaluate(i)).toEqual(evaluate(i));
      }),
    );
  });
});

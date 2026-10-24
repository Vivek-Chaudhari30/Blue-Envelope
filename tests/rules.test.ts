import { describe, it, expect } from "vitest";
import { evaluate, INCOME_RULE, HOURS_RULE } from "@/lib/rules/engine";
import type { RulesInput } from "@/lib/rules/types";

function base(): RulesInput {
  return {
    age: "19-64",
    exemptions: ["none"],
    act: {
      work: { on: false, hours: 0, income: 0 },
      volunteer: { on: false, hours: 0 },
      training: { on: false, hours: 0 },
      school: { on: false },
    },
  };
}

describe("rules engine", () => {
  it("Maria: 19-64, no exemptions, work 52h/$612, volunteer 22h => income, 74h, $612", () => {
    const r = evaluate({
      age: "19-64",
      exemptions: ["none"],
      act: {
        work: { on: true, hours: 52, income: 612 },
        volunteer: { on: true, hours: 22 },
        training: { on: false, hours: 10 },
        school: { on: false },
      },
    });
    expect(r.status).toBe("income");
    expect(r.hours).toBe(74);
    expect(r.income).toBe(612);
    expect(r.school).toBe(false);
    expect(r.sources.length).toBeGreaterThanOrEqual(1);
  });

  it("age under-19 => age (even with passing income)", () => {
    const i = base();
    i.age = "under-19";
    i.act.work = { on: true, hours: 200, income: 9999 };
    expect(evaluate(i).status).toBe("age");
  });

  it("age 65-plus => age", () => {
    const i = base();
    i.age = "65-plus";
    expect(evaluate(i).status).toBe("age");
  });

  it("exemption wins over income and hours", () => {
    const i = base();
    i.exemptions = ["caregiver"];
    i.act.work = { on: true, hours: 200, income: 9999 };
    const r = evaluate(i);
    expect(r.status).toBe("excused");
    expect(r.reasons).toEqual(["caregiver"]);
  });

  it("multiple exemptions keep all non-none reasons", () => {
    const i = base();
    i.exemptions = ["pregnant", "veteran", "none"];
    const r = evaluate(i);
    expect(r.status).toBe("excused");
    expect(r.reasons).toEqual(["pregnant", "veteran"]);
  });

  it("income path: income >= 580 beats school and hours", () => {
    const i = base();
    i.act.work = { on: true, hours: 1, income: INCOME_RULE };
    i.act.school = { on: true };
    expect(evaluate(i).status).toBe("income");
  });

  it("school path when income under rule", () => {
    const i = base();
    i.act.school = { on: true };
    expect(evaluate(i).status).toBe("school");
  });

  it("hours path: work + volunteer + training >= 80", () => {
    const i = base();
    i.act.work = { on: true, hours: 40, income: 0 };
    i.act.volunteer = { on: true, hours: 30 };
    i.act.training = { on: true, hours: 10 };
    const r = evaluate(i);
    expect(r.status).toBe("hours");
    expect(r.hours).toBe(80);
  });

  it("short: below 80 with no other path => short = 80 - hours", () => {
    const i = base();
    i.act.volunteer = { on: true, hours: 50 };
    const r = evaluate(i);
    expect(r.status).toBe("short");
    expect(r.hours).toBe(50);
    expect(r.short).toBe(HOURS_RULE - 50);
    expect(r.short).toBeGreaterThan(0);
  });

  it("R10: off activities contribute zero hours and income", () => {
    const i = base();
    i.act.work = { on: false, hours: 100, income: 1000 };
    i.act.volunteer = { on: false, hours: 100 };
    const r = evaluate(i);
    expect(r.hours).toBe(0);
    expect(r.income).toBe(0);
    expect(r.status).toBe("short");
    expect(r.short).toBe(HOURS_RULE);
  });
});

// Pure rules engine. No network, no AI, no ambient clock.
// Mirrors the prototype evaluate() in docs/design-reference/blue-envelope-app.html.
// Every threshold cites a source id from docs/RULES_SOURCE.md.

import type { RulesInput, RulesResult } from "./types";
import { source } from "./sources";

// source: mh-work-req — "$580 or more per month, no matter the hours"
export const INCOME_RULE = 580;
// source: mh-work-req — "80 or more hours per month"
export const HOURS_RULE = 80;

/** Coerce any input to a finite number >= 0 so wild property-test inputs stay well-defined. */
function num(x: unknown): number {
  const n = Number(x);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function evaluate(input: RulesInput): RulesResult {
  const a = input.act;

  // R10: an activity that is off contributes zero.
  const work = a.work.on ? num(a.work.hours) : 0;
  const vol = a.volunteer.on ? num(a.volunteer.hours) : 0;
  const train = a.training.on ? num(a.training.hours) : 0;
  const hours = work + vol + train;
  const income = a.work.on ? num(a.work.income) : 0;
  const school = a.school.on;

  // R8: every result carries at least the work-requirement source.
  const base = { hours, income, school, sources: [source("mh-work-req")] };

  // R7: strict evaluation order; first match wins.

  // R1: age gate.
  if (input.age !== "19-64") {
    return { status: "age", ...base };
  }

  // R2: any exemption other than "none".
  const reasons = input.exemptions.filter((e) => e !== "none");
  if (reasons.length > 0) {
    return { status: "excused", reasons, ...base };
  }

  // R3: income path. // source: mh-work-req
  if (income >= INCOME_RULE) {
    return { status: "income", ...base };
  }

  // R4: school half-time. // source: mh-work-req
  if (school) {
    return { status: "school", ...base };
  }

  // R5: hours path (work + volunteer + training). // source: mh-work-req
  if (hours >= HOURS_RULE) {
    return { status: "hours", ...base };
  }

  // R6: short.
  return { status: "short", short: HOURS_RULE - hours, ...base };
}

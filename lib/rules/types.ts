// Rules engine types. Pure data — no I/O, no framework imports.
// Source of truth: docs/RULES_SOURCE.md and .kiro/specs/rules-engine/.

export type AgeBand = "under-19" | "19-64" | "65-plus";

export type ExemptionId =
  | "pregnant"
  | "caregiver"
  | "medicare"
  | "health"
  | "treatment"
  | "veteran"
  | "none";

export interface Activities {
  work: { on: boolean; hours: number; income: number };
  volunteer: { on: boolean; hours: number };
  training: { on: boolean; hours: number };
  school: { on: boolean };
}

export interface RulesInput {
  age: AgeBand;
  exemptions: ExemptionId[];
  act: Activities;
}

export type Status = "age" | "excused" | "income" | "school" | "hours" | "short";

export interface Source {
  id: string;
  url: string;
  title: string;
  /** ISO date (YYYY-MM-DD) the official page was read. */
  readOn: string;
}

export interface RulesResult {
  status: Status;
  hours: number;
  income: number;
  school: boolean;
  reasons?: ExemptionId[];
  short?: number;
  sources: Source[];
}

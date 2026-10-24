# Rules Engine — Design

## Files

- `lib/rules/types.ts` — input/output types and `Source`.
- `lib/rules/sources.ts` — the source table mirrored from `docs/RULES_SOURCE.md`.
- `lib/rules/engine.ts` — the pure `evaluate(input)` function.

## Types

```ts
export type AgeBand = "under-19" | "19-64" | "65-plus";

export type ExemptionId =
  | "pregnant" | "caregiver" | "medicare"
  | "health" | "treatment" | "veteran" | "none";

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

export interface Source { id: string; url: string; title: string; readOn: string; }

export interface RulesResult {
  status: Status;
  hours: number;
  income: number;
  school: boolean;
  reasons?: ExemptionId[];
  short?: number;
  sources: Source[];
}
```

## Algorithm (mirrors the prototype `evaluate()`)

```
work  = act.work.on      ? num(act.work.hours)  : 0
vol   = act.volunteer.on ? num(act.volunteer.hours) : 0
train = act.training.on  ? num(act.training.hours)  : 0
hours = work + vol + train
income = act.work.on ? num(act.work.income) : 0
school = act.school.on
base = { hours, income, school, sources: [workReqSource] }

if age != "19-64"                 -> { status: "age", ...base }
ex = exemptions without "none"
if ex.length                      -> { status: "excused", reasons: ex, ...base }
if income >= 580                  -> { status: "income", ...base }
if school                         -> { status: "school", ...base }
if hours >= 80                    -> { status: "hours", ...base }
else                              -> { status: "short", short: 80 - hours, ...base }
```

`num(x)` coerces to a finite number ≥ 0 (NaN/negatives → 0) so property tests with wild inputs stay well-defined.

## Constants

`INCOME_RULE = 580`, `HOURS_RULE = 80`, exported from `engine.ts` so UI and tests share them. Source id for both: `mh-work-req`.

## Sources table (`sources.ts`)

Mirror the three rows from `docs/RULES_SOURCE.md`: `mh-work-req`, `mh-federal`, `kff-hardship`, each `{ id, title, url, readOn }`. The engine attaches `mh-work-req` to every result (R8); Coverage Twin later uses `kff-hardship`.

## Purity

No imports of `next`, `fs`, `Date` inside `evaluate`. Deadlines and "days left" are computed in the UI layer, not the engine.

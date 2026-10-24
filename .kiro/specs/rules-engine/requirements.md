# Rules Engine — Requirements (EARS)

Source of truth: `docs/RULES_SOURCE.md`. Every threshold and exemption here cites a source id from that table. The engine is pure TypeScript: no network, no AI, no `Date.now()` inside rule functions.

## Glossary

- **Activities:** work (hours + income), volunteer (hours), training (hours), school (half-time boolean).
- **Hours total:** work hours + volunteer hours + training hours (only for activities that are "on").
- **INCOME_RULE:** 580 (dollars/month). Source: `mh-work-req`.
- **HOURS_RULE:** 80 (hours/month). Source: `mh-work-req`.
- **Status:** one of `age`, `excused`, `income`, `school`, `hours`, `short`.

## Requirements

**R1 — Age gate.** WHEN the age band is not `19-64`, the engine SHALL return status `age`. Source: `mh-work-req`.

**R2 — Exemption.** WHEN the age band is `19-64` AND at least one exemption other than `none` is present, the engine SHALL return status `excused` with a `reasons` array of the selected exemption ids. Source: `mh-work-req`.

**R3 — Income path.** WHEN no earlier rule fired AND monthly income ≥ INCOME_RULE, the engine SHALL return status `income`, regardless of hours. Source: `mh-work-req`.

**R4 — School path.** WHEN no earlier rule fired AND school is half-time, the engine SHALL return status `school`. Source: `mh-work-req`.

**R5 — Hours path.** WHEN no earlier rule fired AND hours total ≥ HOURS_RULE, the engine SHALL return status `hours`. Source: `mh-work-req`.

**R6 — Short.** WHEN no earlier rule fired, the engine SHALL return status `short` with `short = HOURS_RULE − hours total` AND `short > 0`. Source: `mh-work-req`.

**R7 — Evaluation order.** The engine SHALL evaluate strictly in the order R1 → R2 → R3 → R4 → R5 → R6; the first matching rule wins.

**R8 — Sources on every result.** The engine SHALL include a `sources` array with at least one entry whose `id` exists in `docs/RULES_SOURCE.md`.

**R9 — Base fields.** Every result SHALL carry `hours`, `income` and `school` reflecting the inputs, so the UI can draw meters without re-deriving thresholds.

**R10 — Off activities contribute zero.** WHEN an activity's `on` flag is false, its hours and income SHALL NOT count toward totals.

**R11 — Determinism.** The engine SHALL be a pure function: same input ⇒ same output, no I/O, no ambient clock.

**R12 — Purity of thresholds.** The UI SHALL NOT re-implement any threshold; it reads `hours`, `income`, `school`, `status`, `short` from the engine result only.

## Maria (acceptance anchor)

Age `19-64`, no exemptions, work on (52 h, $612), volunteer on (22 h), training off, school off ⇒ status `income`, hours 74, income 612. (74 < 80 but income ≥ 580, so income path wins.)

## Properties (fast-check) — from `docs/RULES_SOURCE.md` §4

1. Any exemption present ⇒ status `excused`.
2. Age `under-19` or `65-plus` ⇒ status `age`.
3. 19–64, no exemption, income ≥ 580 ⇒ `income`, regardless of hours.
4. work + volunteer + training ≥ 80 (no earlier rule) ⇒ `hours`.
5. Monotonicity: increasing any hours or income never moves a passing status (`income`/`school`/`hours`) to `short`.
6. `short` ⇒ `short === 80 − hours` and `short > 0`.
7. Every result has ≥ 1 source whose id is in the table.
8. Determinism: same input ⇒ same output.

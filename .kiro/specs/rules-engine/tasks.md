# Rules Engine — Tasks

- [ ] 1. `lib/rules/types.ts` — types from design (R9, R1–R6 statuses).
- [ ] 2. `lib/rules/sources.ts` — three-row source table from `docs/RULES_SOURCE.md` (R8).
- [ ] 3. `lib/rules/engine.ts` — `evaluate()` pure, with `INCOME_RULE`/`HOURS_RULE`, `num()` coercion (R1–R7, R10, R11), `// source: mh-work-req` on each threshold.
- [ ] 4. `tests/rules.test.ts` — unit tests: Maria ⇒ income/74/612; one case per status; off-activities contribute zero (R10); evaluation order (R7).
- [ ] 5. `tests/rules.property.test.ts` — fast-check properties 1–8 from requirements. Record any counterexample in `KIRO_USAGE.md`.
- [ ] 6. Wire `npm run test:rules` to run both files. Must pass.

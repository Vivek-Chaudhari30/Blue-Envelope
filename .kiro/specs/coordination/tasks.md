# Coordination — Tasks

- [ ] 1. `lib/panel/types.ts` + `lib/panel/generate.ts` (pure `generatePanel(seed)`, mulberry32, ~40 synthetic, Maria always) and `scripts/generate-panel.ts` wrapper (`npm run generate:panel`).
- [ ] 2. `lib/panel/flags.ts` — `staleContact`, `continuityFlag`, `actNow`, all taking `now` (no ambient clock).
- [ ] 3. `app/navigator/page.tsx` + `components/navigator/*` — pipeline columns, flags, language; footer disclaimer.
- [ ] 4. `lib/store/types.ts`, `local-store.ts`, `redis-store.ts`, `index.ts` — PacketStore with `readForViewer` consent gate (C1–C5).
- [ ] 5. `app/partner/[token]/page.tsx` + confirm route handler + `components/partner/*` (P1–P3). Partner sees only `PartnerView`.
- [ ] 6. Wire the member flow: share/revoke through the store; Maria's card on the board respects consent (N7). Replace demo-only partner confirm with the real flow, keeping the demo fallback.
- [ ] 7. `tests/coordination.property.test.ts` — properties 11, 12, 13. Record any counterexample in `KIRO_USAGE.md`.
- [ ] 8. Extend `tests/e2e/maria.spec.ts`: share → navigator sees packet; partner sign-off reaches confirmed.

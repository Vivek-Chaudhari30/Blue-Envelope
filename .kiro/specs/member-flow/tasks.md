# Member Flow — Tasks

- [ ] 1. Scaffold Next.js (App Router, TS strict, Node 22+), npm scripts from `tech.md` (dev/build/lint/typecheck/test/test:rules/test:content/test:e2e).
- [ ] 2. `app/globals.css` — port `:root` tokens (light + both dark blocks), body crosshatch, all component styles from the prototype.
- [ ] 3. `app/layout.tsx` — fonts via `next/font/google`, `<html lang>`, stage/device/footer chrome, flow rail on desktop.
- [ ] 4. `components/flow/FlowContext.tsx` — state machine with Maria defaults, actions, start-over keeps lang.
- [ ] 5. `components/ui/*` — Button, Toggle, Option, Meter, Pill, Callout.
- [ ] 6. `components/flow/AppBar.tsx`, `FlowRail.tsx` — chrome + progress + language picker (G2, G3, G6).
- [ ] 7. `components/flow/Home.tsx` (H1–H3).
- [ ] 8. `components/flow/LetterXRay.tsx` (L1–L4) + read-aloud.
- [ ] 9. `components/flow/Questions.tsx` (Q1–Q5).
- [ ] 10. `components/flow/Path.tsx` (P1–P4) — calls `evaluate`, meters, earnings block.
- [ ] 11. `components/flow/Packet.tsx` (K1–K5).
- [ ] 12. `components/flow/Submit.tsx` (S1–S2).
- [ ] 13. `app/page.tsx` — wire the six screens to the state machine.
- [ ] 14. `tests/e2e/maria.spec.ts` — Playwright, iPhone viewport, whole story end to end.
- [ ] 15. build / lint / typecheck / test / test:e2e all green; verify live preview matches prototype on a phone.

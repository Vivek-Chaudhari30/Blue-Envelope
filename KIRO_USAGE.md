# Kiro Usage Log

A timestamped record of how Blue Envelope was built with Kiro, for the judges' "How we used Kiro" write-up (see `docs/KIRO_PLAN.md`). Each entry notes the Kiro feature, what it produced or caught, and the commit.

All times US Eastern.

## 2026-10-24 — Phase A (member flow)

- **11:23 · Steering** — Six always-on/`fileMatch` steering files (`product.md`, `tech.md`, `structure.md`, `design-system.md`, `plain-language.md`, `consent-privacy.md`, `policy-sources.md`) drove every decision. `plain-language.md` directly shaped the banned-phrase list that the content test enforces; `policy-sources.md` requires every rule to cite a source id. Starter pack committed `a5b462f`.
- **11:33 · Crew (branch + PR)** — Built autonomously on `crew/build`; opened PR #1 "Blue Envelope build (live)" and push after every finished task so teammates watch on GitHub.
- **11:33 · Specs** — `.kiro/specs/rules-engine` and `.kiro/specs/member-flow` written in EARS form from `docs/PRD.md` and `docs/RULES_SOURCE.md` before any code. Commit `48a5bc8`.
- **11:37 · Spec → code + property tests** — Rules engine implemented from its spec. 10 unit + 8 fast-check property tests (properties 1–8 from `RULES_SOURCE.md §4`) all green. Maria ⇒ `income` / 74h / $612. Every result carries ≥1 source id. Commit `c9c72bc`.
  - Property-based testing note: the monotonicity property (P5 — raising hours/income never flips a passing status to `short`) and determinism (P8) passed with fast-check shrinking and found no counterexample, giving confidence beyond the hand-written unit cases. No counterexamples to record yet.
- **11:41 · Subagent (Crew)** — Dispatched a parallel subagent (`kirocrew-lite`) to build the six-language locales + i18n + content test while the parent built the design tokens. **Caught a failure:** the subagent returned "success" in 9s having written zero files (verified by inspecting side effects, not trusting the claim). Rebuilt the i18n layer inline. Lesson recorded: the lite agent is too thin for multi-file build tasks; do them in the main session. Commit `dd52ff8`.
- **11:46 · Content gate** — Six locale files with identical key sets (property 10) and zero banned phrases in any language (property 9), enforced by `npm run test:content`. Steering's `plain-language.md` banned list is mirrored into `lib/i18n` `BANNED` and checked case-insensitively.
- **11:51 · Member flow** — Six screens (Home, Letter X-Ray, Questions, Path, Packet, Submit) built to match the prototype `docs/design-reference/blue-envelope-app.html`: ported tokens (light + dark), fonts via `next/font`, one `useReducer` state machine with Maria's defaults. `build` / `lint` / `typecheck` / `test` all green (23 unit/property tests). Commit `502468a`.
- **11:53 · e2e** — Playwright iPhone-viewport run of Maria's whole story, language switch, and the short path. 3/3 green. Two selector ambiguities were caught and tightened (not app bugs). Commit `559f11c`.
- **Hooks** — `.kiro/hooks/hooks.json`: rules tests on `lib/rules/**` save, content tests on `locales|content` save, typecheck on any `.ts(x)` save, an agent consent-guard on navigator/partner/store files, and a Stop hook that appends to this log.
- **MCP** — `.kiro/settings/mcp.json`: Playwright MCP (read mass.gov, drive the deployed app on a phone viewport), AWS Documentation MCP (correct Textract/Bedrock Converse usage for Phase B), Google Data Commons MCP (Coverage Twin, Phase C, disabled until the stretch).

### Translations — needs native review
All non-English locale strings are drafts (the 12 Home/X-Ray keys are ported verbatim from the prototype `T` object; the rest are machine-drafted at a sixth-grade level and screened against each language's banned-phrase list). Have a native speaker of es, pt, ht, zh, vi review before any real use.

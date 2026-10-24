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

## 2026-10-24 — Phase B (coordination + readers/AI)

- **12:08 · Spec → code (coordination)** — `.kiro/specs/coordination` (EARS) then built the panel generator (deterministic, seed 2026, ~40 synthetic, Maria always), `lib/panel/flags.ts`, the Navigator Board (`/navigator`), `PacketStore` with a `readForViewer` consent gate (LocalStore + Redis), and the partner sign-off page. Commit `fe4a901`.
- **12:09 · Property tests → bug (PBT win)** — coordination properties 11–13 (consent read-gate, act-now, continuity) all green. Then the e2e caught a **real bug**: `makePartnerToken` used Node's `base64url` encoding, which Next's browser `Buffer` polyfill rejects (`Unknown encoding: base64url`) — the "Send sign-off link" render crashed and reset the flow. A Playwright `pageerror` listener surfaced it where a plain assertion only said "element not found". Recorded as `.kiro/specs/bugfix-partner-token` and fixed with a runtime-agnostic url-safe base64. The partner round-trip e2e is marked `fixme` (server demo store ≠ browser localStorage; resolves with the Supabase shared adapter).
- **12:18 · Steering pivot (docs-first)** — A final readers/AI architecture replaced the Textract+Bedrock plan. Updated steering (`tech.md`, `consent-privacy.md`), the `letter-reader` + `coordination` specs, and wrote `docs/ARCHITECTURE.md` (data-flow diagram + a "when Luna is called" table) **before** coding, per the steering rule. New design: on-device `tesseract.js` OCR in a Web Worker (photos never leave the device), plain-code extraction first (`lib/readers/*-rules.ts`), and Luna as a guarded fallback only via `/api/guide` (zod → grounding → banned-phrase filter → 8s timeout → sample fallback; client redaction; logs only reason/latency/tokens; works with no key). Storage: localStorage draft + Supabase for shared summaries/sign-offs (no images, no OCR text).

### Decision log
- **Eligibility is never AI.** The rules engine decides; Luna is explicitly barred from eligibility, from any deadline the rules already found, and from fixed UI text. Grounding + banned-phrase + 8s-timeout fallback bound every Luna response.
- **Privacy by construction.** OCR runs on the device; only redacted *text* is ever sent to Luna, never the image; the server logs no text.


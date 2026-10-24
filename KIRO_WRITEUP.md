# How we built Blue Envelope with Kiro

A factual account, drawn from `KIRO_USAGE.md` and the git history. Every claim here corresponds to a committed spec, test, or workflow in this repo.

## Kiro tools used, and how they differed

- **Kiro Crew** — the main builder. It drove the whole project across phases: Phase A (member flow), Phase B (readers + AI + coordination), the community/referrals stage, and the finish/polish/docs stages. Crew committed after every finished task and pushed to a working branch, opening a pull request per checkpoint (PRs #1–#8, all merged). It also runs the two schedules below.
- **Kiro IDE** — built the Letter Chat feature in parallel on its own branch `kiro/letter-chat` (PR #3), scoped to new files plus minimal additive hooks so it merged cleanly with Crew's community work.
- **Kiro CLI** — wired into CI headless mode (`.github/workflows/kiro-review.yml`): on push to `main` it runs lint/typecheck/test/content and, when a token is configured, a headless plain-language review of changed locale files.
- **Kiro Web** — not used.

## Spec-driven development vs vibe coding

Nine specs under `.kiro/specs/`, each written **before** the code it governs, in EARS form:
`rules-engine`, `member-flow`, `coordination`, `letter-reader`, `letter-chat`, `community-referrals`, `ready-to-send`, plus two bugfix specs (`bugfix-partner-token`, `bugfix-suppression-leak`).

The spec-first discipline paid off most on the readers/AI pivot: when the architecture changed from Textract+Bedrock to on-device OCR + a guarded Luna fallback, we updated the steering and the `letter-reader` spec and wrote `docs/ARCHITECTURE.md` **before** writing code, so the privacy rules (photo never leaves the device, grounding, banned-phrase filter, 8-second fallback) were decided up front rather than retrofitted. The bugfix specs are the clearest contrast with vibe coding: each records current vs expected behavior and the fix, so the change is auditable.

## Agent hooks, and what they caught

`.kiro/hooks/hooks.json`: rules tests on `lib/rules/**` save; content tests (locale parity + banned phrases) on `locales|content` save; typecheck on any `.ts(x)` save; an **agent consent-guard** on navigator/partner/store files that checks edits against `consent-privacy.md`; and a Stop hook that keeps `KIRO_USAGE.md` current. The content hook is what kept all six locales at identical key sets and free of banned phrases across every change.

## Steering strategy

Nine steering files, split between always-on product/tech/structure rules and `fileMatch` rules that apply only where they matter:
- `plain-language.md` → the banned-phrase list enforced by `npm run test:content` AND by the Luna output filter, in all six languages.
- `consent-privacy.md` → the on-device-OCR + client-redaction + `readForViewer` design; photos never leave the device.
- `community-safety.md` (fileMatch on the community/referral paths) → kept eligibility, health, income, and letter content out of `lib/community/**` entirely; recognition only, no prizes; small-cell suppression before anything leaves the server.

Steering made the biggest difference where a growth or AI feature could have compromised a member: the safety rules were loaded exactly on the files that needed them.

## MCP

`.kiro/settings/mcp.json`: Playwright MCP (read mass.gov, drive the deployed app on a phone viewport), AWS Documentation MCP, and Google Data Commons MCP (disabled, stretch only).

## Property-based testing — the real counterexamples it found

fast-check found bugs hand-written unit tests would have missed:
1. **`$1000` no-comma amount** — the earnings total=sum property shrank to `[$1000.00]`: the amount regex required a comma for thousands, so `$1000.00` matched only `100`. Fixed the regex.
2. **`$0.02` vs `$0.01` grounding false-positive** — the Luna grounding property shrank to `[present=$0.01, absent=$0.02]`: a permissive rounded-whole-dollar check let an ungrounded `$0.02` match the `0` in `$0.01`. Tightened to require an exact representation — a real safety bug, since grounding is what stops Luna returning a value not in the member's letter.

Property tests also guard the privacy-critical invariants: no community API response contains a member id; suppressed towns (1–9) expose no count-recoverable field and the **county/statewide totals resist a differencing (subtraction) attack**; a referral counts once per invitee, never for self, capped per day; the ready-to-send name/Member ID never appear in a network body or localStorage; a `cover_note` rewrite adds no number or date the member didn't write.

## A bug we caught, and one we caught by inspecting side effects

- **base64url browser crash** (`bugfix-partner-token`) — `makePartnerToken` used Node's `base64url`, which Next's browser `Buffer` polyfill rejects; the "Send sign-off link" render crashed. A Playwright `pageerror` listener surfaced it where a plain assertion only said "element not found". Fixed with a runtime-agnostic base64.
- **A subagent that lied about success** — a `kirocrew-lite` subagent dispatched to build the six-language locales returned "success" in 9 seconds having written zero files. We caught it by inspecting the side effects (no files on disk) rather than trusting the completion, and rebuilt the i18n layer inline.

## Crew schedules

- **Policy watcher** (every 6 hours): compares the mass.gov work-requirements page against `docs/RULES_SOURCE.md` and opens a GitHub issue with the diff on change.
- **Deploy heartbeat** (every 30 minutes until 8 PM ET): runs Maria's flow on the live URL in a phone viewport and alerts only on failure.

## Powers

Not used.

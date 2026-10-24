# Kiro prompts for Blue Envelope

Everything Kiro needs is already in this repo:

- `docs/PRD.md` — what to build, phase by phase
- `docs/RULES_SOURCE.md` — every rule and its mass.gov source, plus the property tests
- `docs/SAMPLE_CONTENT.md` — Maria, the sample letter, earnings, organizations
- `docs/design-reference/blue-envelope-app.html` — the clickable prototype to match
- `docs/KIRO_PLAN.md` — hooks, MCP, schedules, write-up outline
- `.kiro/steering/*.md` — product, tech, structure, plain language, policy sources, consent, design system

Run the prompts in order. Prompt 2 is the main one.

---

## Prompt 1 · Kiro IDE · Spec mode (about 10 minutes)

Open the `Blue-Envelope` folder in Kiro IDE. Start a new **Spec**, paste this, and step through requirements → design → tasks. Turn on **Correctness** (property-based testing) when Kiro offers it. Don't run the tasks yet; Crew will.

```
Create a spec named "rules-engine" for Blue Envelope.

Read .kiro/steering/product.md, .kiro/steering/policy-sources.md and docs/RULES_SOURCE.md first.

Requirements: write one requirement per rule in docs/RULES_SOURCE.md sections 1–3, in EARS form (for example "WHEN the member's age band is under-19 or 65-plus, THE SYSTEM SHALL return status age"). Cover: the six ways to meet the requirement, every exemption code, the evaluation order in docs/PRD.md section 5, the "short" calculation, and that every result carries at least one source from the source table. Add a requirement that no user-facing result text ever asserts eligibility.

Design: a pure TypeScript module at lib/rules/ (engine.ts, sources.ts, types.ts) with no I/O, no AI and no Date.now() inside rule functions. Inputs and outputs exactly as in docs/PRD.md section 5.

Correctness: turn properties 1–8 from docs/RULES_SOURCE.md section 4 into property-based tests with fast-check under tests/rules.property.test.ts, plus unit tests for Maria's sample (expect status "income", hours 74, income 612).

Tasks: small, ordered, each ending with "npm run test:rules passes".
```

---

## Prompt 2 · Kiro Crew · New Project (the master build prompt)

Open Kiro Crew, create a **Project** in the `Blue-Envelope` folder, paste this as the goal, let Crew refine it into its plan, then start the **Task Runner**.

```
You are building Blue Envelope, a Hackachusetts 2026 entry (Healthcare & Biotech, challenge H2). The hack ends at 8:00 PM ET today, and the team records the demo video at 5:00 PM, so main must stay deployable after every phase.

BEFORE ANY CODE
1. Read every file in .kiro/steering/ and docs/. They are the source of truth. If something here conflicts with them, the docs win; tell me about the conflict.
2. Open docs/design-reference/blue-envelope-app.html in a browser (Playwright MCP is fine) and click through all six steps. The finished app must look and behave like it: same tokens, type, layout, copy, sample data and flow.
3. Read .kiro/specs/rules-engine/ if it exists and implement it first. If it doesn't exist, create it from docs/RULES_SOURCE.md before writing rules code.

NON-NEGOTIABLES (from .kiro/steering/product.md)
- Never tell a user they are eligible, approved, guaranteed, or that they qualify. Use "may meet" or "may be excused" and "MassHealth makes the decision".
- The member owns the packet. Sharing is off by default and can be revoked.
- Every rule cites a source from docs/RULES_SOURCE.md.
- Six languages (en, es, pt, ht, zh, vi), sixth-grade reading level, read-aloud.
- Synthetic data only. Footer on every page: "Independent tool · Not MassHealth · Sample data".
- Never commit secrets. Never add .kiro to .gitignore.

STACK
Exactly as in .kiro/steering/tech.md and structure.md: Next.js App Router, TypeScript strict, plain CSS with tokens ported from the prototype, Vitest + fast-check, Playwright, AWS SDK v3 (Textract + Bedrock Converse) behind READER_MODE with mock as the default, deploy to Vercel.

PHASE A — MEMBER FLOW (target 2:30 PM)
Use parallel subagents for these independent workstreams, then integrate:
  A1. Scaffold the Next.js app, globals.css tokens (light + dark), fonts, layout, app bar, progress bar, footer, desktop flow rail. Add npm scripts named in tech.md.
  A2. lib/rules from the rules-engine spec, with unit and property tests (npm run test:rules).
  A3. locales/*.json for all six languages (port the T object from the prototype; add every other UI string in English plus translations), lib/i18n, and npm run test:content (locale key parity + banned phrases from plain-language.md).
  A4. The six screens in components/flow/ exactly as in docs/PRD.md section 4 Phase A, using content/ from docs/SAMPLE_CONTENT.md, Maria's answers pre-filled, deadline 2026-12-15, sample earnings totaling $612.00.
Then: one Playwright test (tests/e2e/maria.spec.ts, iPhone viewport) that runs Maria's whole story. Deploy to Vercel. Commit and push to main.
Done when: build, lint, typecheck, test, test:e2e all pass; the deployed URL works on a phone; it matches the prototype side by side.

PHASE B — REAL AI AND COORDINATION (target 4:00 PM)
Parallel subagents:
  B1. app/api/read-letter: Textract DetectDocumentText → Bedrock Converse (Claude, model from BEDROCK_MODEL_ID) returns zod-validated JSON {lines:[{id,text,box}], highlights:{deadline,asking,send,how: lineIds}, explanations:{[lang]:{...}}}. LetterXRay draws numbered boxes over the user's own photo. Timeout + fallback to mock with a visible "sample" note.
  B2. app/api/read-earnings: Bedrock vision reads screenshots → [{period, amount}] → total vs $580. Create the four sample screenshots in public/samples/.
  B3. lib/store PacketStore (LocalStore default, RedisStore when Upstash env vars exist) with readForViewer consent checks; /partner/[token] sign-off page; packet status updates.
  B4. scripts/generate-panel.ts (seed 2026) and /navigator board: pipeline columns, continuity / stale-contact / act-now flags, Maria's packet visible only when she shares it.
Add property tests 11–13 from docs/RULES_SOURCE.md. Update the Playwright test. Deploy, commit, push.
Done when: with READER_MODE=mock everything still works; with AWS keys the photo is really read; the navigator sees Maria's packet only after sharing.

PHASE C — STRETCH (only if A and B pass on a phone before 4:30 PM)
Coverage Twin at /twin per docs/PRD.md, labeled "illustrative model, not a forecast", with property tests 14–16. Otherwise skip it and tell me.

KIRO EVIDENCE (judges score this)
- After scaffolding, create the hooks listed in docs/KIRO_PLAN.md in .kiro/hooks/ and the MCP config in .kiro/settings/mcp.json.
- Create specs member-flow, letter-reader and coordination in .kiro/specs/ (requirements, design, tasks) before building each phase.
- If a real bug appears, record it as a bugfix spec in .kiro/specs/.
- Keep KIRO_USAGE.md at the repo root: timestamped entries for every spec, hook run, steering rule that changed output, MCP use, subagent, and every property-test counterexample (input, cause, fix).

WORKING RULES
- Work in small steps. Run tests after each task; on failure, fix and retry before moving on. Checkpoint after each phase.
- Commit with clear scoped messages and push straight to main after each phase (no feature branches).
- Keep README.md current: what it is, live URL, setup, env vars (.env.example), mock mode, scripts, "Translations need native review".
- If you are blocked on credentials (AWS, Vercel, Upstash), stay in mock mode, note it in README, and message me; don't stop the run.
- After each phase, post a short status to my connected channel: what shipped, the URL, what's next, anything you need from me.
- Ask me before deleting files you didn't create, changing the stack, or adding paid services.
```

---

## Prompt 3 · Kiro Crew · Schedule + heartbeat (2 minutes, after Phase A deploys)

Paste in Crew chat:

```
Set up two recurring jobs for the Blue-Envelope project:

1. Policy watcher, every 6 hours: fetch https://www.mass.gov/info-details/new-work-and-education-requirements-for-masshealth-members, compare the requirements, exemptions and timing sections with docs/RULES_SOURCE.md. If anything changed, open a GitHub issue "policy: mass.gov rules changed" with the exact diff, propose the update to docs/RULES_SOURCE.md and the rules-engine spec requirements, and message me. If nothing changed, do nothing. Run it once now and show me the result.

2. Deploy heartbeat, every 30 minutes until 8:00 PM ET today: open the production URL in a phone viewport, run Maria's flow from home to "Send it to MassHealth", and alert me on my channel only if a step fails, with the step name and a screenshot.
```

---

## Prompt 4 · Kiro Web · Autonomous mode (optional, for the Coverage Twin)

At app.kiro.dev, connect the GitHub repo and start an autonomous task:

```
Implement the coverage-twin spec in .kiro/specs/coverage-twin/ for the Blue-Envelope repo. Follow .kiro/steering/. Build /twin as described in docs/PRD.md Phase C, label it "illustrative model, not a forecast", add property tests 14–16 from docs/RULES_SOURCE.md, and open a pull request with screenshots. Do not change files outside app/twin, lib/twin, tests/twin* and the spec folder.
```

---

## Prompt 5 · Kiro CLI · GitHub Actions (optional, 5 minutes)

Paste in Kiro IDE or Crew chat:

```
Add .github/workflows/kiro-review.yml: on push to main, install deps, run lint, typecheck, test, and test:content, then run Kiro CLI in headless mode to review changed files under locales/ against .kiro/steering/plain-language.md and post findings as a job summary. Use repository secrets for any Kiro credentials; never hard-code them. Log this in KIRO_USAGE.md.
```

---

## Prompt 6 · Write-up (5:15 PM)

```
Using KIRO_USAGE.md, docs/KIRO_PLAN.md and the git history, write KIRO_WRITEUP.md for the hackathon submission with these sections: tools used (IDE, Crew, CLI, Web) and how they differed; spec-driven development vs vibe coding; agent hooks and what they caught; steering strategy; MCP; property-based testing and the bugs it found (with real counterexamples); powers. Use only facts from the log. Then write SUBMISSION.md with a 150-word project description for the Healthcare & Biotech track, challenge H2.
```

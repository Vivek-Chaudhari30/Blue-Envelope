# Kiro Plan

How Blue Envelope uses each Kiro surface and feature. This file doubles as the outline for the "How we used Kiro" write-up that judges score under Implementation. Keep `KIRO_USAGE.md` (repo root) as a running log with timestamps, screenshots and what each feature caught.

## Surfaces

| Surface | What it does for us |
|---|---|
| **Kiro IDE** | Spec mode for the rules engine with Correctness (property-based tests are IDE-only). Steering, hooks and MCP configured here. Bugfix spec for the first real bug. |
| **Kiro Crew** | Main builder. A Crew **Project** turns the PRD into a plan and the **Task Runner** executes it with tests, retries and checkpoints. **Parallel subagents** build independent workstreams. A **schedule** watches the mass.gov rules page; a **heartbeat** checks the deployed site. Progress goes to a **channel** (Discord, Slack or Telegram). |
| **Kiro CLI** | Headless mode in GitHub Actions: on every push, run tests and a plain-language review of changed locale files. |
| **Kiro Web** | Autonomous mode builds one isolated feature (Coverage Twin) from its spec and opens a pull request. |

## Specs (`.kiro/specs/`)

1. `rules-engine` — created in the IDE, requirements in EARS style straight from `docs/RULES_SOURCE.md`, Correctness enabled for the 8 rules-engine properties.
2. `member-flow` — the six screens (PRD §4 Phase A).
3. `letter-reader` — Textract + Bedrock reader, mock mode, zod validation, overlay on the user's photo.
4. `coordination` — partner sign-off, PacketStore with consent, Navigator Board, continuity flags.
5. `coverage-twin` — stretch.
6. One **bugfix spec** for the first real bug found (record current vs expected behavior).

## Hooks (`.kiro/hooks/`, create after the app is scaffolded so the scripts exist)

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "Rules properties on save",
      "description": "Re-run rules engine unit and property tests whenever rules code changes",
      "trigger": "PostFileSave",
      "matcher": "lib/rules/.*\\.ts$",
      "action": { "type": "command", "command": "npm run test:rules" },
      "timeout": 120
    },
    {
      "name": "Locale parity and banned phrases",
      "description": "Every locale has the same keys as en; no promise phrases in any language",
      "trigger": "PostFileSave",
      "matcher": "(locales/.*\\.json|content/.*\\.ts)$",
      "action": { "type": "command", "command": "npm run test:content" },
      "timeout": 60
    },
    {
      "name": "Typecheck on save",
      "trigger": "PostFileSave",
      "matcher": "\\.(ts|tsx)$",
      "action": { "type": "command", "command": "npm run typecheck" },
      "timeout": 120
    },
    {
      "name": "Consent guard",
      "description": "Packet reads on the navigator and partner side must go through readForViewer",
      "trigger": "PostFileSave",
      "matcher": "(app/navigator/|app/partner/|lib/store/).*\\.(ts|tsx)$",
      "action": { "type": "agent", "prompt": "Review the file just saved against .kiro/steering/consent-privacy.md. If any code reads a packet without PacketStore.readForViewer, or exposes letter, earnings or answers to a partner, fix it and explain the change in one line." }
    },
    {
      "name": "Kiro usage log",
      "description": "Keep the write-up evidence current",
      "trigger": "Stop",
      "action": { "type": "agent", "prompt": "Append a dated entry to KIRO_USAGE.md: which Kiro features were used in this session (spec, task, hook, steering, MCP, property test, Crew), what each produced or caught, and the commit hashes. Keep it to five bullets." }
    }
  ]
}
```

## MCP servers (`.kiro/settings/mcp.json`)

| Server | Why | Notes |
|---|---|---|
| Playwright MCP (`npx @playwright/mcp`) | Read mass.gov pages into specs; click through the deployed app on a phone viewport | No extra install |
| GitHub MCP (remote) | Issues for policy changes, PR from Kiro Web | Sign in with GitHub |
| AWS Documentation MCP | Correct Textract and Bedrock Converse usage | Needs `uv` (`brew install uv`) |
| Google Data Commons MCP | Census uninsured and language data for the Coverage Twin | Needs `uv`; stretch only |

## Property-based tests

The 16 properties in `docs/RULES_SOURCE.md` §4. Record every counterexample fast-check finds (input, why it failed, the fix) in `KIRO_USAGE.md`. Judges ask whether PBT caught something unit tests missed.

## Crew schedule and heartbeat

- **Policy watcher:** every 6 hours, fetch the mass.gov work-requirements page, compare the rules sections with `docs/RULES_SOURCE.md`. If anything changed, open a GitHub issue titled `policy: mass.gov rules changed` with the diff, update `docs/RULES_SOURCE.md` on a branch, and update the `rules-engine` spec requirements. Property tests must pass before merge.
- **Deploy heartbeat:** every 30 minutes until 8 PM, load the production URL, run Maria's flow in a phone viewport, and alert the channel if any step fails.

## Write-up outline (fill from `KIRO_USAGE.md`)

1. Which Kiro tools we used (IDE, Crew, CLI, Web) and how they differed.
2. Spec-driven development: how specs were structured; spec vs vibe coding.
3. Agent hooks: which workflows we automated and what they caught.
4. Steering: the strategy that made the biggest difference (product principles plus fileMatch steering for language and consent).
5. MCP: what it enabled.
6. Property-based testing: which properties, and the bugs they found.
7. Powers: which ones we installed and what they added.

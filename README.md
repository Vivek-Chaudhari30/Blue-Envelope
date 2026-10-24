# Blue Envelope

Helps MassHealth members keep their coverage through the 2027 work and education requirements and six-month renewals. A member photographs the renewal notice that arrives in a blue envelope, sees it explained in their language, finds the easiest way they may already meet the rules, builds a proof packet, and sends it through MassHealth's official channels.

> **Independent tool · Not MassHealth · Sample data.** Every person, letter and amount shown is a labeled sample. This never tells anyone they are eligible or approved — MassHealth makes the decision. Built for Hackachusetts 2026 (Healthcare & Biotech, challenge H2).

**Live preview:** https://blue-envelope-six.vercel.app (auto-deploys on every push to `crew/build`; `main` is production).

## What it does (Phase A — shipping)

The six-screen member flow, working on a phone:

1. **Home** — "Got a blue envelope from MassHealth?" in six languages; photograph your letter or try a sample.
2. **Letter X-Ray** — the deadline, the request and what to send, highlighted on the letter and explained in plain words, with read-aloud.
3. **Four quick questions** — age, reasons that may excuse you, last month's activities, contact details (pre-filled with Maria's sample answers).
4. **Your easiest path** — a pure rules engine shows income / hours / school / excused / short, with meters and earnings screenshots added up.
5. **Proof packet** — a checklist, partner sign-off, deadline reminders, and consent to share (off by default).
6. **Send it to MassHealth** — the official channels plus 211 help.

## Stack

Next.js (App Router) · TypeScript strict · plain CSS tokens ported from the prototype · `next/font` (Bricolage Grotesque, Public Sans, IBM Plex Mono) · Vitest + fast-check · Playwright · (Phase B) AWS SDK v3 Textract + Bedrock behind `READER_MODE`, Upstash Redis optional · deploy on Vercel.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Node 22 or newer.

## Environment

The app runs **fully in mock mode with no keys** — the demo works out of the box. Copy `.env.example` to `.env.local` to change anything.

| Var | Purpose | Default |
|---|---|---|
| `READER_MODE` | `mock` returns the sample letter/earnings; `bedrock` uses AWS (Phase B) | `mock` |
| `AWS_REGION` | Region for Textract + Bedrock | — |
| `BEDROCK_MODEL_ID` | Claude model id for the Converse API | — |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Enable the Redis packet store; otherwise same-browser localStorage demo mode | — |

Never commit keys. AWS credentials come from your own environment/profile (`aws configure` / `aws sso login`).

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint (next/core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit
npm run test         # all Vitest unit + property tests
npm run test:rules   # rules engine + properties 1–8
npm run test:content # locale key parity + banned-phrase checks (properties 9–10)
npm run test:e2e     # Playwright, iPhone viewport, Maria's story
```

## Deploy

Push to `crew/build` builds a Vercel preview once the GitHub repo is connected to a Vercel project (Vercel dashboard → Add New → Project → import `Vivek-Chaudhari30/Blue-Envelope`). `main` is kept deployable at all times.

## Connect Supabase (optional — the app works fully without it)

Shared community data and partner sign-offs can be stored in Supabase. Without it, the app uses an in-memory demo store with the same interface, and `/community` still shows a seeded synthetic board plus your own latest activity.

1. In the Vercel dashboard: **Storage → Supabase → Connect** (or create a project at supabase.com). This sets `NEXT_PUBLIC_SUPABASE_URL` and the service role key in the project env.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to the Vercel project's Environment Variables (server-side only — never expose it to the client).
3. In the Supabase **SQL editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql). It creates `members`, `events`, `packets`, and `partner_signoffs` with indexes.
4. Redeploy. The app detects both env vars and switches the `CommunityStore` and `PacketStore` to Supabase automatically.

Supabase holds **only** shared summaries and sign-off state — never images, OCR text, or letter content.


## Translations — needs review

Non-English strings (es, pt, ht, zh, vi) are **drafts**. The Home and Letter X-Ray strings are ported verbatim from the prototype; the rest are machine-drafted at a sixth-grade reading level and screened against each language's banned-phrase list. Have a native speaker review before any real use.

## Security notes

- `next`, `zod` are pinned to patched versions. Two advisories remain on Next.js transitive deps (`postcss`, `sharp`) that only a future Next release can fix; they are build-time/image deps not reachable from the mock-mode request path, and forcing them would break the framework.
- All data is synthetic. No real PHI, member IDs, names, addresses or phone numbers.

## How we used Kiro

See `KIRO_USAGE.md` (running log) and `docs/KIRO_PLAN.md` (plan). Specs in `.kiro/specs/`, hooks in `.kiro/hooks/`, MCP config in `.kiro/settings/mcp.json`, steering in `.kiro/steering/`.

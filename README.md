# Blue Envelope

Helps MassHealth members keep their coverage through the 2027 work-and-education requirements and six-month renewals. A member photographs the renewal notice that arrives in a blue envelope, sees it explained in their language, finds the easiest way they may already meet the rules, builds a proof packet, and sends it through MassHealth's official channels. Health-center navigators and community partners help through consented sharing.

> **Independent tool · Not MassHealth · Sample data.** Every person, letter and amount shown is a labeled sample. This never tells anyone they are eligible or approved — **MassHealth makes the decision.** Built for Hackachusetts 2026 (Healthcare & Biotech, challenge H2).

**Live:** https://blue-envelope-six.vercel.app — no login. Tap **"Try a sample letter"**.

## 60-second tour

1. **Home** — "Got a blue envelope from MassHealth?" in six languages. Tap **Try a sample letter** (or photograph a real one — it's read on your phone).
2. **Letter X-Ray** — the deadline, the request and what to send, highlighted and explained in plain words, with read-aloud. Ask a question in the chat; every answer cites the letter line or a source. Edit anything we misread.
3. **Four quick questions** — pre-filled with Maria's answers; change them to see the result change. Optionally pick your town.
4. **Your easiest path** — a pure rules engine shows income / hours / school / excused / short, with meters. Add earnings screenshots → $612.
5. **Proof packet** — checklist, partner sign-off, reminders, "Add to my calendar" (.ics), consent to share (off by default).
6. **Send it to MassHealth** — official channels + 211. Then **"I sent it"** and **help a neighbor** with your share link. See the **[Community Board](https://blue-envelope-six.vercel.app/community)**.

Also: **[/navigator](https://blue-envelope-six.vercel.app/navigator)** (health-center board) and **[/community](https://blue-envelope-six.vercel.app/community)** (public progress).

## Architecture

```
On the member's phone (nothing leaves unless noted):
  photo ─► resize 1600px ─► tesseract.js OCR (Web Worker)  ─► plain-code rules (deadline/asking/send/how)
   │ photo NEVER leaves the device                               │
   └─ rules engine (pure, no AI) decides eligibility ───────────┘   missing/low-confidence?
                                                                     └─► redact ─► POST /api/guide (text only)

Server (Luna, only when rules can't help — never eligibility):
  Vercel AI SDK structured output ─► zod ─► grounding ─► banned-phrase filter ─► 8s timeout ─► sample fallback
  logs ONLY reason/latency/tokens · works fully with NO key

Storage:
  packet draft ─► localStorage        shared summaries + sign-offs ─► Supabase (no images, no OCR text) ─► readForViewer
```

Full detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/AI_GOVERNANCE.md`](docs/AI_GOVERNANCE.md).

## How it answers the H2 brief ("keeping residents connected to coverage")

- **Information gaps** — the letter is explained in six languages with read-aloud and an AI helper that always cites its evidence and never decides eligibility.
- **Accessible communication** — sixth-grade reading level, on-device OCR, voice input, phone-first design, 44px targets, dark mode.
- **Timely assistance** — deadline front-and-center with "N days left", calendar reminders (30/14/3 days), and a navigator board flagging act-now / continuity risk.
- **Coordination** — consented sharing with a health-center navigator (`readForViewer`) and a one-minute community-partner sign-off, plus a referral system so neighbors reach the tool.
- **The state stays responsible** — every flow ends at MassHealth's official channels; the app never says eligible/approved/guaranteed/qualify.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```
Node 22+.

## Environment (all optional — the app works fully with none set)

| Var | Purpose | Default |
|---|---|---|
| `GUIDANCE_MODEL` | Luna model via Vercel AI Gateway | `openai/gpt-6-luna` |
| `OPENAI_API_KEY` | Direct-OpenAI fallback for Luna | — |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Shared community + packet storage | — (demo store) |

**Mock / demo behavior:** with no AI key, OCR + plain-code rules run on-device and any gap shows the sample with a clear note. With no Supabase, a demo `CommunityStore`/`PacketStore` is used and `/community` shows a seeded synthetic board **plus your own latest activity** ("Including your latest activity"), so the demo never looks empty. See [Connect Supabase](#connect-supabase-optional--the-app-works-fully-without-it).

## Sample letter

A printable, watermarked sample renewal letter for the demo photo: [`public/samples/sample-letter.png`](public/samples/sample-letter.png). Print it and photograph it to see on-device OCR read the real image.

## Scripts

```bash
npm run dev / build / start / lint / typecheck
npm run test          # all Vitest unit + property tests
npm run test:rules    # rules engine + properties
npm run test:content  # locale key parity + banned-phrase checks
npm run test:e2e      # Playwright, iPhone viewport
npm run load:towns    # regenerate lib/community/towns.json (351 MA municipalities)
npm run seed:community # regenerate the synthetic Community Board history
```

## Tests

- 65 Vitest unit + property tests (rules, i18n/content, coordination, readers, redaction, guide grounding + prompt-injection, community, .ics).
- 7 Playwright e2e on an iPhone viewport (Maria's story, language switch, short path, share→navigator, on-device OCR, letter chat, community) + 1 skipped (partner round-trip, needs the Supabase shared store).
- CI: [`.github/workflows/kiro-review.yml`](.github/workflows/kiro-review.yml) runs lint/typecheck/test/content on push to `main`, plus an optional Kiro CLI headless locale review.

## Connect Supabase (optional — the app works fully without it)

1. Vercel dashboard → **Storage → Supabase → Connect** (sets `NEXT_PUBLIC_SUPABASE_URL` + the key).
2. Add `SUPABASE_SERVICE_ROLE_KEY` to the project env (server-side only).
3. In the Supabase **SQL editor**, run [`supabase/schema.sql`](supabase/schema.sql) (`members`, `events`, `packets`, `partner_signoffs` + indexes).
4. Redeploy. Supabase holds **only** shared summaries and sign-off state — never images, OCR text, or letter content.

## Known limitations

- **Translations need native review.** Non-English strings (es, pt, ht, zh, vi) are drafts: the Home/X-Ray strings are ported from the prototype; the rest are machine-drafted at a sixth-grade level and screened against each language's banned-phrase list.
- The demo `CommunityStore`/`PacketStore` is per-server-process; cross-device flows (a partner opening a sign-off link on another device) need Supabase.
- `next`/`zod` are pinned to patched versions; two advisories remain on Next.js transitive deps (`postcss`, `sharp`) that only a future Next release fixes — build-time/image deps, not reachable from the request path.
- The policy watcher and deploy heartbeat run as Kiro Crew schedules outside this repo.

## How we used Kiro

[`KIRO_USAGE.md`](KIRO_USAGE.md) (running log, with real property-test counterexamples and the subagent failure we caught) and [`docs/KIRO_PLAN.md`](docs/KIRO_PLAN.md). Specs in `.kiro/specs/`, hooks in `.kiro/hooks/`, MCP in `.kiro/settings/mcp.json`, steering in `.kiro/steering/`. `.kiro/` is committed.

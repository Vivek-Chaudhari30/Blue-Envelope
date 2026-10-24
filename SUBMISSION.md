# Blue Envelope — Submission

**Track:** Healthcare & Biotech · **Challenge:** H2 "Keeping residents connected to health coverage"
**Live:** https://blue-envelope-six.vercel.app (no login) · **Repo:** https://github.com/Vivek-Chaudhari30/Blue-Envelope

## Description (150 words)

Starting January 2027, about 360,000 MassHealth members must prove 80 hours a month of work, school, volunteering or training — or $580 in income — or lose coverage. In Arkansas's 2018 version, more than 95% of those who lost coverage were already working or should have been exempt. The failure was paperwork, not eligibility. Blue Envelope helps after the notice arrives: a member photographs the blue-envelope renewal letter, it is read **on their phone** and explained in six languages with read-aloud and an AI helper that always cites its evidence and never decides eligibility. A pure rules engine finds the easiest way they may already meet the rules, builds a proof packet as an on-device PDF, and sends it through MassHealth's own channels. Navigators and community partners help through consented sharing. The state still decides — we make sure eligible people get to the decision.

## Features

- **Letter X-Ray** — on-device OCR (tesseract.js), plain-code extraction of deadline/ask/proof/how, explained in six languages with read-aloud.
- **Ask about your letter** — pre-written answers plus a grounded AI helper (Luna) that cites a letter line or a policy source and falls back to a sample when unsure.
- **Rules engine** — pure, sourced, property-tested; income / hours / school / excused / short, with meters.
- **Proof packet** — checklist, partner sign-off, calendar reminders (.ics, 30/14/3 days), consent to share (off by default).
- **Ready-to-send packet** — a cover + earnings PDF built on the device; share via the OS share sheet or download; the member's Name/Member ID never leave the phone.
- **Navigator Board** — a synthetic patient panel with continuity / stale-contact / act-now flags; a member's packet is visible only after they share it.
- **Community Board + referrals** — recognition-only ("Neighbor Helper" badges), aggregates with small-cell suppression and differencing-attack resistance, never exposing a member.

## How it scales

Production roadmap in [`docs/ROADMAP_V2.md`](docs/ROADMAP_V2.md): accounts/roles, admin dashboard, audit log, data-rights requests, a real services directory, SMS reminders (needs 10DLC), and health-center partnerships — all gated behind legal/compliance review. The architecture already separates concerns to make this feasible: on-device OCR keeps documents off the server, the rules engine is pure and portable, Supabase holds only shared summaries behind a consent gate, and every aggregate is small-cell suppressed before it leaves the server.

## For judges — how to test (no login needed)

1. Open https://blue-envelope-six.vercel.app and tap **"Try a sample letter"** (or print [`public/samples/sample-letter.png`](public/samples/sample-letter.png) and photograph it to see on-device OCR read a real image).
2. Switch languages in the app bar — the home screen and every X-Ray explanation change.
3. Walk Maria's story: X-Ray → four questions → easiest path (income, $612) → proof packet → **Ready-to-send** (build the PDF) → "I sent it".
4. Visit **/navigator** (health-center board) and **/community** (public progress + town ranking, labeled "Demo data").
5. **Demo mode:** with no AI key the app runs fully on-device rules + the sample fallback; with no Supabase it uses a seeded synthetic community board plus your own latest activity. Everything works offline of those services.

## Kiro

`.kiro/` is committed (steering, specs, hooks, settings). See [`KIRO_WRITEUP.md`](KIRO_WRITEUP.md) and [`KIRO_USAGE.md`](KIRO_USAGE.md). All data is synthetic; the app never says eligible/approved/guaranteed/qualify.

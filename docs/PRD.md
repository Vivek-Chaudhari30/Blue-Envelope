# Blue Envelope — Product Requirements

> Hackachusetts 2026 · Healthcare & Biotech · H2 "Keeping residents connected to health coverage"
> Visual and interaction reference: `docs/design-reference/blue-envelope-app.html` (open it in a browser and click through it; the real app must look and behave like it).

## 1. Problem

Starting **January 1, 2027**, MassHealth members aged 19–64 without young children, a disability, or a condition that limits work must show **80 hours a month** of work, volunteering, job training or school, or **$580 a month** in income. About **360,000** members may face these rules (Governor's office). Many will also renew **every six months** instead of every year. If MassHealth can't confirm a member meets the rules from data it already has, the member gets a renewal notice **in a blue envelope** and must prove it.

Arkansas tried this in 2018: about 18,000 adults lost coverage within months, and a Harvard study (NEJM 2019) found **more than 95%** of the people targeted were already working or should have been exempt. Confusion and lack of internet kept people from reporting.

The official H2 brief adds: renewal involves multiple organizations, incomplete or outdated records, and notices that don't reach people. Coverage gaps interrupt medication, appointments and treatment. Consider information gaps, accessible communication, timely assistance, and coordination among members, MassHealth, health centers and community partners. **The state remains responsible for eligibility decisions.**

Mass.gov already has a screener that tells people *whether* the rules affect them. **Blue Envelope does not rebuild it.** It helps after the screener: understand the notice, gather proof, and get the right helper involved in time.

## 2. Users

| User | Device | Job to be done |
|---|---|---|
| **Member** (primary). Example: Maria, 34, Lowell, speaks Portuguese, drives for DoorDash, volunteers at a food pantry, refills an asthma inhaler monthly | Phone, often low data, sometimes limited English or literacy | "I got a blue envelope. What does it want, do I already qualify, and what do I send before the deadline?" |
| **Community partner** (food pantry, job program, school) | Phone or laptop | Confirm a member's hours in under a minute |
| **Health center navigator** | Laptop | See which patients have renewals coming, who is at risk of a coverage gap, and help them finish |
| **State / planners** | Laptop | See statewide impact of coordination (Coverage Twin, stretch) |

## 3. Principles (non-negotiable)

1. **The state decides.** Never say "you're eligible", "you're approved", "guaranteed" or "you qualify". Say "may meet", "may be excused", and "MassHealth makes the decision". Every path ends at MassHealth's official channels.
2. **The member owns the packet.** Nobody else sees a member's documents unless the member turns sharing on, and they can turn it off anytime.
3. **Every rule has a source.** Each threshold and exemption cites the mass.gov URL and the date it was read (`docs/RULES_SOURCE.md`).
4. **Plain words, six languages.** Sixth-grade reading level. English, Spanish, Portuguese, Haitian Creole, Chinese (Simplified), Vietnamese. Read-aloud.
5. **Synthetic data only.** Every person, letter and amount is a labeled sample. No real PHI. The sample letter is watermarked "SAMPLE · NOT AN OFFICIAL NOTICE".
6. **Independent tool.** Footer on every screen: "Independent tool · Not MassHealth · Sample data". No MassHealth logo.

## 4. Scope by phase

Hack ends 8:00 PM ET; video recorded 5–6 PM. **Main must always be deployable.**

### Phase A — Member flow (must ship, target 2:30 PM)
The six screens from the reference prototype, working on a phone, deployed:

1. **Home — "Got a blue envelope from MassHealth?"**
   - Envelope illustration, headline and subtitle translated in all 6 languages (language picker in the app bar).
   - Primary: "Take a photo of your letter" (`<input type="file" accept="image/*" capture="environment">`).
   - Secondary: "Try a sample letter".
   - Trust chips: Free · 6 languages · Read aloud · You choose who sees your papers.
   - Note linking to MassHealth's own screener (mass.gov work-requirements page).
2. **Letter X-Ray**
   - Shows the letter with 4 numbered highlights: (1) deadline (red, with live "N days left"), (2) what they're asking, (3) what to send, (4) how to send it.
   - Callout cards below with translated label + plain explanation in the chosen language.
   - "Read it to me" uses the browser speech API with the language code; graceful message if no voice.
   - Phase A uses the sample letter (and shows the uploaded photo thumbnail with a note). Phase B reads the real photo.
3. **Four quick questions** (pre-filled with Maria's answers)
   - Q1 Age: Under 19 / 19 to 64 / 65 or older.
   - Q2 Reasons that may excuse you (multi-select; "None of these" is exclusive): pregnant or had a baby in the last 12 months; care for a child under 14 or a person with a disability; have Medicare; a health condition that makes it hard to work; in a treatment program for alcohol or drug use; veteran with a total disability rating from the VA.
   - Q3 Last month: paid work incl. gig (hours + earnings), volunteering (hours), job training (hours), in school at least half-time (toggle).
   - Q4 Contact details last updated with MassHealth: in the last year / more than a year ago / not sure.
4. **Your easiest path** — rules engine result (see §5): age / excused / income / school / hours / short. Meters for income vs $580 and hours vs 80. For income or hours paths: "Prove it with screenshots" card → upload earnings screenshots or "Use sample screenshots" → four weekly payouts that total **$612.00** (148.50 + 171.25 + 139.00 + 153.25). Always shows "This is a guide, not a decision. MassHealth makes the decision about your coverage."
5. **Proof packet**
   - Red due banner: "Due December 15, 2026 · N days left".
   - Items depend on the path: earnings proof; school letter; proof of exemption if asked; extra hours if short.
   - Partner sign-off: "Volunteer hours from Riverside Food Pantry (sample)" → Send sign-off link → Waiting → Confirmed (22 hours).
   - Contact warning if Q4 ≠ last year: link to MassHealth + "I updated it".
   - Toggle: text reminders 30, 14 and 3 days before the deadline.
   - Toggle: share with my health center (Riverside Community Health Center, sample). Off by default.
6. **Send it to MassHealth** — Online (link to mass.gov MassHealth), by mail or fax (address on your letter), by phone (number on your letter). Mass 211 help (show "2-1-1" as selectable text, no tel: link reliance). Closing note: "MassHealth makes the decision. Watch for a letter, text or email with the answer." Start over.

App chrome: back button, "Step N of 6 · name", progress bar, language picker, footer disclaimer. On desktop, show the flow rail like the reference; on phones the app is the page.

### Phase B — Real AI + coordination (target 4:00 PM)
- **Real Letter X-Ray:** Amazon Textract `DetectDocumentText` returns lines with bounding boxes → Claude on Amazon Bedrock classifies which lines are deadline / asking / send / how and writes the plain explanation in the chosen language (structured JSON) → client draws numbered highlight boxes over the user's own photo. `READER_MODE=mock` (default) keeps the sample path working with no keys.
- **Real earnings reader:** Claude vision reads gig-app or pay-stub screenshots → `[{period, amount}]` → total vs $580.
- **Partner sign-off page** `/partner/[token]`: coordinator sees member first name, organization, month; enters hours; confirms. Status flows back to the packet. Storage adapter: Upstash Redis if `UPSTASH_REDIS_REST_URL` is set, otherwise same-browser localStorage demo mode.
- **Navigator Board** `/navigator`: a seeded synthetic panel of ~40 patients (script `scripts/generate-panel.ts`, labeled synthetic). Columns: not started → notice received → proof gathered → submitted. Flags: **continuity** (a refill or appointment after the renewal deadline), **stale contact** (> 12 months), **act now** (≤ 14 days and packet incomplete), language. Maria's card shows her packet only when she has turned sharing on.

### Phase C — Stretch (only if A and B work on a phone)
- **Coverage Twin** `/twin`: county-level simulation of 2027 renewals using MassGIS environmental-justice block groups and CDC PLACES (see `docs/KIRO_PLAN.md` data notes). Slider for navigator reach / automatic verification. Labeled "illustrative model, not a forecast". A county bar chart is fine; a map only if time allows.
- "Call, don't click" voice line. Only if a teammate has built one before.

## 5. Rules engine (pure TypeScript, no AI)

Inputs: age band, exemptions[], activities {work hours, work income, volunteer hours, training hours, school half-time}. Output: `{ status, hours, income, school, reasons?, short?, sources[] }`.

Order of evaluation:
1. Age band ≠ 19–64 → `age` (rules likely don't apply).
2. Any exemption → `excused` with reasons.
3. Income ≥ 580 → `income`.
4. School half-time → `school`.
5. work + volunteer + training ≥ 80 → `hours`.
6. Otherwise → `short` with `short = 80 − hours`.

Maria's sample: 19–64, no exemptions, work 52 h / $612, volunteer 22 h → **income** (74 h is short of 80, but income passes).

Every result includes at least one source `{url, title, readOn}` from `docs/RULES_SOURCE.md`. Property-based tests are listed in `docs/RULES_SOURCE.md` §4.

## 6. Acceptance criteria for the demo

- Maria's story runs end to end on a real phone at the deployed URL in under 90 seconds.
- Switching language changes the home screen and every X-Ray explanation.
- Changing answers changes the result screen correctly for all six statuses.
- No user-facing string contains a banned promise phrase (checked by a test).
- Lighthouse accessibility ≥ 95 on the home and X-Ray screens; all controls keyboard reachable; tap targets ≥ 44 px.
- README explains setup, env vars, mock mode, and how to run tests.
- `.kiro/` is committed and not in `.gitignore`.

## 7. Demo video script (≤ 3:00)

| Time | Scene |
|---|---|
| 0:00 | "On January 1st, 360,000 people in Massachusetts face new Medicaid paperwork. In Arkansas, more than 95% of those targeted were working or should have been exempt." |
| 0:15 | Navigator Board flags Maria: renewal in 21 days, inhaler refill after the deadline, phone number two years old. |
| 0:35 | Maria photographs her letter. It lights up in Portuguese and reads aloud. |
| 0:55 | She screenshots DoorDash earnings: $612 in March. The pantry confirms her hours through a link. |
| 1:20 | She shares her packet, the navigator checks it, she submits through MassHealth. Her card turns green. |
| 1:40 | Coverage Twin (if built): "Now multiply Maria by 360,000." |
| 2:10 | How we built it with Kiro: specs, a bug property tests caught, hooks, steering, Crew. |
| 2:45 | "The state decides. We make sure eligible people get to the decision." |

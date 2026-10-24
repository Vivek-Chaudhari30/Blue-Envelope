# Member Flow — Requirements (EARS)

Source: `docs/PRD.md` §4 Phase A, `docs/SAMPLE_CONTENT.md`, and the prototype `docs/design-reference/blue-envelope-app.html` (behavioral source of truth). Six screens, one client-side state machine, works on a phone, deployable.

## Global

**G1 — Footer.** The app SHALL show "Independent tool · Not MassHealth · Sample data" on every screen.

**G2 — App chrome.** Each screen SHALL show a back button (disabled on step 1), "Step N of 6 · <name>", a 3 px progress bar, and a language picker.

**G3 — Six languages.** The language picker SHALL offer en, es, pt, ht, zh, vi. Changing it SHALL update the home headline/sub and every Letter X-Ray explanation, keeping scroll position.

**G4 — Never promise.** No user-facing string in any language SHALL contain a banned phrase (per `.kiro/steering/plain-language.md`). Results use "may meet" / "may be excused" and always show "MassHealth makes the decision".

**G5 — State machine.** One React context SHALL hold the flow state (mirrors the prototype `S`), initialized with Maria's sample answers. "Start over" resets it but keeps the chosen language.

**G6 — Layout.** On phones the app is the page (no horizontal scroll at 360 px, tap targets ≥ 44 px). On desktop a flow rail (6 numbered steps with description + the technology behind each) sits left of a phone frame, as in the prototype.

**G7 — Accessibility.** Semantic HTML, a label on every control, visible focus, `prefers-reduced-motion` respected, `lang` set on translated text.

## Step 1 — Home

**H1.** WHEN on Home, the app SHALL show the CSS envelope illustration, the translated headline and subtitle, a primary "Take a photo of your letter" control (`<input type="file" accept="image/*" capture="environment">`), a secondary "Try a sample letter", trust chips (Free · 6 languages · Read aloud · You choose who sees your papers), and a note linking to MassHealth's own screener.

**H2.** WHEN the member picks a photo, the app SHALL store it and advance to Letter X-Ray showing the photo thumbnail.

**H3.** WHEN the member taps "Try a sample letter", the app SHALL advance to Letter X-Ray.

## Step 2 — Letter X-Ray

**L1.** The app SHALL render the sample letter (monospace, "SAMPLE · NOT AN OFFICIAL NOTICE" watermark) with four numbered highlights: (1) deadline red, (2) asking, (3) send, (4) how.

**L2.** Below the letter the app SHALL show four callout cards with the translated label + plain explanation for the chosen language; card 1 SHALL show a live "N days left" pill from the deadline `2026-12-15T23:59:00-05:00`.

**L3.** WHEN the member taps "Read it to me", the app SHALL read the four explanations with the Web Speech API using the language's speech code, and SHALL show a graceful message when no voice is available.

**L4.** WHEN a photo was uploaded, the app SHALL show its thumbnail with a note that Phase A shows the X-Ray on the sample letter.

## Step 3 — Four quick questions

**Q1.** The app SHALL ask: age band (Under 19 / 19 to 64 / 65 or older).
**Q2.** The app SHALL ask exemptions as multi-select with "None of these" exclusive (the six plain-language options).
**Q3.** The app SHALL ask last-month activities: paid work (hours + earnings), volunteering (hours), job training (hours), in school half-time (toggle), each behind an on/off toggle.
**Q4.** The app SHALL ask when contact details were last updated (last year / more than a year ago / not sure).
**Q5.** Answers SHALL be pre-filled with Maria's defaults and changing any answer SHALL change the result screen.

## Step 4 — Your easiest path

**P1.** The app SHALL call the rules engine and render the matching status (age / excused / income / school / hours / short) with the prototype's copy.
**P2.** The app SHALL show meters: income vs $580 and hours vs 80 (hidden for `age`/`excused`).
**P3.** FOR `income` or `hours` (work on), the app SHALL show a "Prove it with screenshots" card; "Use sample screenshots" SHALL reveal four weekly payouts totaling **$612.00** (148.50 + 171.25 + 139.00 + 153.25).
**P4.** The app SHALL always show "This is a guide, not a decision. MassHealth makes the decision about your coverage."

## Step 5 — Proof packet

**K1.** The app SHALL show a red due banner "Due December 15, 2026 · N days left".
**K2.** Packet items SHALL depend on the path (earnings proof; school letter; proof of exemption; extra hours if short).
**K3.** The app SHALL show partner sign-off for Riverside Food Pantry (sample) with states none → sent → confirmed (22 hours).
**K4.** WHEN Q4 ≠ "last year", the app SHALL show a contact warning with an "I updated it" action.
**K5.** The app SHALL offer a text-reminders toggle (30/14/3 days) and a "share with my health center" toggle that is **off by default**.

## Step 6 — Send it to MassHealth

**S1.** The app SHALL offer Online (link to mass.gov MassHealth), by mail/fax (on your letter), by phone (on your letter), and Mass 211 shown as selectable text "2-1-1".
**S2.** The app SHALL close with "MassHealth makes the decision. Watch for a letter, text or email with the answer." and a "Start over" control.

## Acceptance

Maria's story runs end to end on an iPhone viewport at the deployed URL in under 90 seconds; switching language changes Home + every X-Ray explanation; changing answers changes the result for all six statuses; no banned phrase (test-checked); `test:e2e` green.

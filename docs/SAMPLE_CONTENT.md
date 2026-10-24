# Sample Content (all synthetic)

Use exactly this content so the app matches the prototype and the demo video. Translations for the home screen and Letter X-Ray live in the `T` object inside `docs/design-reference/blue-envelope-app.html`; port them to `locales/*.json`. They are drafts: flag them for native-speaker review in the README.

## Persona

**Maria Santos** (synthetic). 34. Lowell, MA. Portuguese. DoorDash driver. Volunteers at Riverside Food Pantry (sample). Monthly asthma inhaler refill. Phone on file is two years old.

Default answers: age 19–64 · exemptions: none · work 52 h, $612 · volunteer 22 h · training off (10 h if toggled) · school off · contact updated "more than a year ago".

## Sample letter (render as a paper letter, monospace, watermark "SAMPLE · NOT AN OFFICIAL NOTICE")

```
HEALTH COVERAGE RENEWAL                                  SAMPLE
November 2, 2026
Maria Santos · Member ID 000-SAMPLE-00

Dear Maria,

It is time to renew your MassHealth coverage. Starting January 1, 2027, some
members must show work, school, volunteering or a job program for at least
80 hours a month, or income of at least $580 a month. We could not confirm
this from the information we have.

[1] Please respond by December 15, 2026. If we do not hear from you, your
coverage may end.

[2] Tell us about your work, school, volunteering or job training for one
month since your last renewal, or tell us if a reason applies that excuses you.

[3] Send proof such as pay stubs, a letter from your employer or volunteer
organization, or proof of school enrollment.

[4] You can respond online, by mail, by fax, or by phone using the contact
information on this notice.
```

Highlights: [1] deadline (red), [2] asking, [3] send, [4] how (blue). Deadline constant: `2026-12-15T23:59:00-05:00`.

## Sample earnings screenshots (gig app payouts, March)

| Period | Amount |
|---|---|
| Mar 1–7 | $148.50 |
| Mar 8–14 | $171.25 |
| Mar 15–21 | $139.00 |
| Mar 22–31 | $153.25 |
| **Total** | **$612.00** |

Also create four simple PNG mock screenshots for the demo in `public/samples/earnings-week-{1..4}.png` (plain card: "Weekly payout", period, amount, "Gig app (sample)"). No real company logos.

## Organizations (samples, do not use real organization names)

- Community partner: **Riverside Food Pantry (sample)**. Confirms **22 volunteer hours** for March.
- Health center: **Riverside Community Health Center (sample)**. Navigator: **Ana R. (sample)**.

## Contact placeholders

- Reminder phone: `(•••) •••-0142`.
- Help: Mass 211, shown as the selectable text **2-1-1**.

## Navigator Board panel (Phase B)

Seeded generator `scripts/generate-panel.ts` (seed 2026) producing ~40 synthetic patients:
`{ id, firstName, lastInitial, language, renewalDue, status: not_started|notice_received|proof_gathered|submitted, nextRefill?, nextAppointment?, contactUpdatedOn, sharedPacket: boolean }`.
Languages weighted to MA: English, Spanish, Portuguese, Haitian Creole, Chinese, Vietnamese. Maria is always present with renewal in 21 days, inhaler refill 3 days after her deadline, contact updated 2 years ago.

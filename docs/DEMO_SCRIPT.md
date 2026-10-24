# Demo script — Blue Envelope (target 2:50)

A click path and narration for the recorded video. Live URL: https://blue-envelope-six.vercel.app. Record on a phone viewport. All data is synthetic.

| Time | Screen / click | Narration |
|---|---|---|
| 0:00–0:15 | **/navigator** (Navigator Board). Point at Maria's card: renews in ~21 days, continuity + stale-contact flags. | "On January 1st, about 360,000 people in Massachusetts face new Medicaid paperwork. In Arkansas's version, more than 95% of those who lost coverage were already working or should have been exempt. The failure was paperwork, not eligibility. Here, a navigator sees Maria is at risk." |
| 0:15–0:40 | **/** Home. Show the six-language picker; switch to **Português** so the headline changes. Tap **"Try a sample letter"** (mention: a real photo is read on the phone). | "Maria gets the blue envelope. She photographs it — and it's read right on her phone, nothing uploaded — then explained in her language." |
| 0:40–1:05 | **Letter X-Ray.** Show the four numbered highlights and the "N days left" deadline pill. Tap **"Read it to me"**. Open **"Ask about your letter"**, tap **"What counts as proof?"** — show the answer with its **"Based on:"** evidence chip highlighting line 3. | "The deadline, what they're asking, what to send — highlighted and read aloud. She can ask a question; every answer cites the letter or a source, and if the AI isn't sure it says so and points to a person." |
| 1:05–1:30 | **Four questions** (Maria pre-filled) → **See my easiest path** → **income, $612**. Tap **"Use sample screenshots"** → total **$612.00**. | "A plain rules engine — not AI — finds her easiest path: one month of earnings over $580. It never says she's approved. MassHealth decides." |
| 1:30–1:55 | **Build my proof packet.** Show the due banner, **"Add to my calendar"**, partner sign-off (Send link → confirm → 22 hours). Leave **Share with my health center** off, then turn it on. | "She builds a proof packet, adds calendar reminders, and the food pantry confirms her volunteer hours through a link. Sharing with her health center is off until she turns it on." |
| 1:55–2:20 | **How to send it** → **Ready-to-send packet** → **Build my packet (PDF)** (note it's made on the phone) → **Share** / Download. Show the official-send options. Tap **"I sent it"** → "Check your account in about 10 days." | "One tap builds a PDF on her phone — her name never leaves it — and she sends it the way her letter says. We tell her to check back; we never claim she's approved." |
| 2:20–2:40 | **/community** (public). Show the statewide bar + "First 1,000 neighbors" milestone, the town ranking (Lowell up), the "Demo data" label, and the share card's QR. | "When Maria helps a neighbor, the Community Board celebrates it — recognition only, aggregates only, with no town's small count ever exposed. Now multiply Maria by 360,000." |
| 2:40–2:50 | **Kiro evidence** screen: show `.kiro/specs/` (nine specs), `KIRO_WRITEUP.md`, and a property-test counterexample ($0.02 grounding fix). | "Built with Kiro: specs before code, steering that enforced privacy, hooks, and property tests that caught real bugs. The state decides. We make sure eligible people get to the decision." |

## Notes for the recording

- If the AI helper is configured, the chat answers come from Luna (grounded); if not, the pre-written answers and sample fallback still carry the demo.
- `/community` shows a seeded synthetic board labeled "Demo data" plus the device's own latest activity, so it is never empty.
- Keep the footer "Independent tool · Not MassHealth · Sample data" visible on every screen.
- Closing line, verbatim: **"The state decides. We make sure eligible people get to the decision."**

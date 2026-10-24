---
inclusion: fileMatch
fileMatchPattern: ["app/community/**", "app/r/**", "lib/community/**", "app/api/events/**", "app/api/community/**", "app/api/referral/**", "app/api/members/**"]
---

# Community and referrals — safety rules

These rules bind every file that touches the Community Board, referrals, or their APIs. They exist so a growth feature can never compromise the member or expose anyone.

## Core help is never gated

- The letter X-Ray, the rules engine, the proof packet, and the submit flow are ALWAYS available. They are never locked behind a referral, a badge, a count, or an account. A member who never shares anything gets the full tool.

## What may NEVER drive referrals, badges or rankings

- Never use a member's health, income, immigration status, eligibility result, or letter content for referrals, badges, or any ranking. Those signals must not reach `lib/community/**` at all.
- The only events counted are in-app actions: `started`, `xray_done`, `packet_ready`, `marked_sent` (self-reported), `contact_updated`, `referral_opened`. Nothing about *what* the letter said or *whether* the member may meet the rules.

## Referral integrity (enforced server-side)

- Referral codes are short, random, and carry no personal data.
- A referral is counted **once per invitee**, and only **after the invitee reaches `packet_ready`**.
- **No self-referral** (same device / same member id).
- **At most 20 counted referrals per helper per day.**
- All of the above is enforced on the server, never trusted from the client.
- An inviter sees only a **count** — never who the invitees are.

## Privacy of the board

- Helpers appear on the board **only if they opted in**, and then only as **first name + last initial + town**. Opt-in is OFF by default and reversible.
- Any town or county count from **1 to 9** is shown as **"fewer than 10"**. Suppression is applied on the server before any aggregate leaves it.
- No API response ever contains a member id, phone number, address, or answer.

## Recognition only

- Recognition only: badges and town progress. **No points, no cash, no gift cards, no prizes.** Nothing of monetary value.

## Honesty

- Seeded or simulated data is labeled **"Demo data"** wherever it appears.
- The board is labeled **"Actions in Blue Envelope. MassHealth records are not visible to us."** It never implies the state's records or decisions.

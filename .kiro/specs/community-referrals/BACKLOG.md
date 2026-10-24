# Backlog — "Pass the Envelope" referrals + Community Board

Queued milestone. Build ONLY after Phase B (readers/AI) is green and merged.
Docs-first: write `.kiro/specs/community-referrals` (EARS req/design/tasks) and update `.kiro/steering/consent-privacy.md` BEFORE coding.

## Principles
- Count only actions INSIDE Blue Envelope: `packet_ready`, `marked_sent` (self-reported), `contact_updated`, referral finishes. Board label: "Actions in Blue Envelope. MassHealth records are not visible to us."
- Aggregates only. Any town/county count 1–9 shows as "fewer than 10" (small-cell suppression). Never expose member IDs, phone numbers, or answers.
- Celebrate, don't shame: rank by "neighbors helped per 1,000 residents" and "most improved this week". No "worst towns" lists.
- Recognition only: "Neighbor Helper" badge + town progress. No cash, gift cards, or prizes.

## Data (Supabase, server-only; local demo store with same interface when env missing)
- `towns`: all 351 MA towns with county + 2020 population from the MassGIS towns layer. `scripts/load-towns.ts`; commit the generated JSON.
- `members`: id (random uuid, also in localStorage), town_id nullable, language, helper_code (short unique), referred_by_code nullable, display_name_optin nullable, created_at.
- `events`: member_id, type ∈ {started, xray_done, packet_ready, marked_sent, contact_updated, referral_opened}, town_id, created_at.
- `community_stats` SQL view: per town and county, counts with small-cell suppression applied IN the view.

## UX
- Questions screen: optional "Which town do you live in?" (searchable, skippable).
- Submit screen: "I sent it to MassHealth" button → logs `marked_sent`; then "Help a neighbor who got a blue envelope" card: personal link `/r/{helper_code}`, Copy link, Share on WhatsApp (prefilled message in the member's language), QR code, opt-in "Show my first name and town" toggle.
- `/r/[code]`: sets referred_by_code, logs `referral_opened`, shows "{FirstName} from {Town} shared this with you" only if opted in, then opens Home.
- Referral counts only when the referred member reaches `packet_ready`. No self-referral (same device/member). Max 20 counted referrals per helper per day.
- `/community` (public): statewide progress bar toward 360,000; town ranking by neighbors helped per 1,000 residents with county filter; most improved this week; opted-in helpers (first name, last initial, town); partner organizations helping most. Auto-refresh every 10s. Match the prototype design system.
- Seed ~40 towns with a labeled synthetic history (`scripts/seed-community.ts`) so the board looks alive; Maria's live actions bump Lowell.

## API
- `/api/events` (POST, rate-limited), `/api/community` (GET, aggregates only), `/api/referral/[code]` (GET, first name/town only if opted in).

## Tests (property)
- No API response contains a member id.
- Every displayed count between 1 and 9 is suppressed.
- Sum of town counts = county = state totals (before suppression).
- A referral counts at most once per referred member.
- Self-referral never counts.
- Counts never decrease.
- e2e: Maria marks sent → shares link → second context opens `/r/{MARIA code}` → finishes → `/community` shows Lowell's count increased.

Log in KIRO_USAGE.md; push to crew/build after each task; tell the user "merge the PR" when green.

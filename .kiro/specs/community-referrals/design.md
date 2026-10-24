# Community + Referrals — Design

## Files

- `lib/community/towns.json` — 351 MA municipalities `{ id, name, county, pop2020 }` (generated).
- `scripts/load-towns.ts` — builds towns.json from the MassGIS municipalities layer (or a committed fallback list if offline); idempotent.
- `lib/community/types.ts` — `Member`, `CommunityEvent`, `EventType`, `TownAgg`, `CountyAgg`, `CommunityStore`, `Badge`.
- `lib/community/store.ts` — `getCommunityStore()`: Supabase adapter when env present, else the in-memory/file demo `CommunityStore`. Server-only.
- `lib/community/aggregate.ts` — pure: fold events → per-town/county counts; `suppress(n)` ("fewer than 10" for 1–9); per-1000 ranking; badges from a helped-count. Property-tested.
- `lib/community/referral.ts` — pure counting rules: countable(invitee reached packet_ready, not self, not already counted, under daily cap).
- `lib/community/helper-code.ts` — short random unique code (base32, no personal data).
- `scripts/seed-community.ts` — ~40 towns of synthetic history (seeded), Lowell included; labeled demo.
- `app/api/members/route.ts`, `app/api/events/route.ts`, `app/api/community/route.ts`, `app/api/referral/[code]/route.ts` — zod-validated, rate-limited, server-only, aggregates/opt-in only.
- `app/community/page.tsx` + `components/community/*` — board (progress bar, ranking, county filter, helpers, accessible table, 10s refresh, Demo-data label).
- `components/flow/TownPicker.tsx` — searchable town select + "Prefer not to say" (Questions).
- `components/flow/HelpNeighbor.tsx` — the share card (link, copy, WhatsApp, opt-in toggle, My impact + badges) on Submit.
- `app/r/[code]/page.tsx` — referral landing.
- `lib/community/client.ts` — device-side member id (uuid in localStorage), helper_code cache, event posting, opt-in state.

## Identity (device-local, demo)

On first interaction the client ensures a member: reads `be:member:id` (uuid) from localStorage or `POST /api/members` to create one (with town + language + any `referred_by_code` from a visited `/r` link), caching the returned `helper_code`. No login. The uuid is the only identifier; it is never shown on the board.

## Counting flow

`referral_opened` is logged when `/r/[code]` is visited (sets the invitee's `referred_by_code`). The count is realized only when that invitee later emits `packet_ready`: `lib/community/referral.ts` resolves, for each helper, the set of DISTINCT invitees who (a) were referred by them, (b) are not the helper, (c) reached packet_ready, capped at 20/day. This is computed server-side in aggregation; the client is never trusted.

## Aggregation + suppression

`aggregate(events, towns)` → `{ state: {actions, helped}, towns: TownAgg[], counties: CountyAgg[] }`. `TownAgg = { townId, name, county, pop2020, helped, perThousand }`. `suppress(n)` returns `"fewer than 10"` for 1 ≤ n ≤ 9, else the number. Suppression is applied in the API layer's serializer, so raw counts never leave the server. The property test checks sums BEFORE suppression.

## Badges

`badgesFor(helped)`: Neighbor Helper (≥1), Community Builder (≥3), Envelope Ambassador (≥10). Pure.

## Safety (community-safety.md)

Only the six in-app event types feed this; no health/income/eligibility/letter content ever reaches `lib/community`. Helpers shown only if `display_name_optin`. Recognition only — badges + progress, nothing of value. "Demo data" label when seeded.

## Merge-safety

New files + additive hooks only: a `<TownPicker/>` in Questions, a `<HelpNeighbor/>` on Submit, a Community link in the flow rail / Home. No restructuring of existing components.

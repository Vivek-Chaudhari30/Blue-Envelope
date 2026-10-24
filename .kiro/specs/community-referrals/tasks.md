# Community + Referrals — Tasks

- [ ] 1. `lib/community/types.ts`; `lib/community/helper-code.ts`.
- [ ] 2. `scripts/load-towns.ts` → `lib/community/towns.json` (351 MA municipalities, county, 2020 pop). Commit the JSON.
- [ ] 3. `lib/community/aggregate.ts` (fold + suppress + per-1000 + badges) and `lib/community/referral.ts` (countable rules) — pure.
- [ ] 4. `tests/community.property.test.ts` — no member ids; 1–9 suppressed; sums = county/state pre-suppression; once per invitee; no self; daily cap; badge thresholds.
- [ ] 5. `lib/community/store.ts` (Supabase or demo) + `lib/community/client.ts` (device uuid, helper_code, event posting).
- [ ] 6. APIs: `POST /api/members`, `POST /api/events`, `GET /api/community`, `GET /api/referral/[code]` — zod, rate-limited, aggregates/opt-in only.
- [ ] 7. `scripts/seed-community.ts` (~40 towns synthetic, Lowell).
- [ ] 8. `components/flow/TownPicker.tsx` (Questions, searchable + "Prefer not to say"); `components/flow/HelpNeighbor.tsx` (Submit card: link/copy/WhatsApp/opt-in/My impact+badges); `app/r/[code]/page.tsx`.
- [ ] 9. `app/community/page.tsx` + `components/community/*` (progress bar, ranking, county filter, helpers, accessible table, 10s refresh, Demo-data label) + Home/flow-rail link.
- [ ] 10. Wire `marked_sent` on the Submit "I sent it" button; emit `started`/`xray_done`/`packet_ready`/`contact_updated` at the right steps.
- [ ] 11. e2e: Maria finishes → "I sent it" → open her `/r` link in a second context → invitee finishes → `/community` shows Lowell up + Maria's badge.
- [ ] 12. KIRO_USAGE.md; push after each task; open PR "Community + referrals".

# Ready-to-send packet — Tasks

- [ ] 1. `lib/packet/cover.ts` — pure cover lines + `pathSentence(status)` (no banned phrases, always the deadline).
- [ ] 2. `lib/packet/pdf.ts` — `buildPacketPdf` with pdf-lib (cover + earnings + partner pages; optional in-memory name/memberId).
- [ ] 3. `lib/guide/schema.ts` + `ground.ts` — add `cover_note` reason + grounding (no number/date absent from the member's words).
- [ ] 4. `components/flow/ReadyToSend.tsx` — identity fields (in-memory), cover-note (+ Luna rewrite + approve), Share/Download, recipients, official options, "I sent it" + reminder. Mount in `Submit.tsx`.
- [ ] 5. `tests/ready-to-send.property.test.ts` — name/memberId never in a network body or localStorage; cover page no banned phrase + always deadline; cover_note adds no new number/date.
- [ ] 6. e2e: Maria → Ready to send → PDF built → Share/Download fallback → I sent it → reminder.
- [ ] 7. KIRO_USAGE.md; PR.

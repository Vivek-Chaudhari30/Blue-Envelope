# Letter Chat — Tasks

- [ ] 1. Locales: pre-written chip questions + answers (4 chips), sheet label, voice notes, edit/provenance/delete strings — all six locales, key parity, no banned phrases.
- [ ] 2. `lib/chat/types.ts` + `lib/chat/store.ts` (device-only `be:letter:*`; `clearLetter`).
- [ ] 3. `lib/chat/ask.ts` — member_help payload assembly over `lib/guide/client.ts`; evidence mapping; not-sure on no evidence.
- [ ] 4. `components/chat/EvidenceChip.tsx`, `LetterChat.tsx` (chips, free text, cap 5, not-sure card, "Talk to a person").
- [ ] 5. `lib/speech/recognition.ts` + `components/chat/Mic.tsx` (feature-detected) + `components/chat/ReadAloud.tsx`.
- [ ] 6. `components/flow/ExtractedValue.tsx` (edit + provenance chips) + `components/flow/DeleteLetter.tsx`.
- [ ] 7. Minimal hooks in `LetterXRay.tsx` (mount chat, extracted values, delete, evidence→highlight) and packet deadline flow-through (F3).
- [ ] 8. Unit tests: pre-written answers (key parity + banned phrases, six locales).
- [ ] 9. Property tests: provenance "edited" iff edited; delete clears every key; no-evidence ⇒ not-sure; prompt-injection rejected (mock model echoes injected text → server rejects).
- [ ] 10. e2e (iPhone): sample letter → "What counts as proof?" → evidence highlights line 3 → edit deadline → packet banner shows edited date → Delete my letter → X-Ray empty.
- [ ] 11. KIRO_USAGE.md (built in Kiro IDE in parallel with Crew). Commit + push `kiro/letter-chat` after each task; open PR to `main`.

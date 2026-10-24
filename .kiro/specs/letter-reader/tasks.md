# Letter & Earnings Reader — Tasks

- [ ] 1. `lib/readers/types.ts` — OcrLine, LetterFields, EarningsRead.
- [ ] 2. `lib/readers/letter-rules.ts` + `earnings-rules.ts` — pure extraction (E1–E5). No invented deadline.
- [ ] 3. `tests/readers.test.ts` + `tests/readers.property.test.ts` — unit on the sample letter; properties: no-invented-deadline, total = sum of amounts.
- [ ] 4. `lib/readers/redact.ts` + `tests/redaction.property.test.ts` — redaction; property: output never contains member id / phone / name-after-Dear.
- [ ] 5. `workers/ocr.worker.ts` + `lib/readers/ocr-client.ts` — tesseract.js in a worker, resize 1600px, on-device, lazy. Wire into the Letter X-Ray when a real photo is added; show "Your letter stays on your phone".
- [ ] 6. `lib/guide/schema.ts` + `lib/guide/ground.ts` + `app/api/guide/route.ts` — zod → grounding → banned filter → 8s timeout → fallback; per-IP rate limit; log only reason/latency/tokens; `GUIDANCE_MODEL` default, `OPENAI_API_KEY` fallback; works with no key.
- [ ] 7. `tests/guide.property.test.ts` — grounding rejects ungrounded values; banned filter on Luna output.
- [ ] 8. `components/flow/HelpButton.tsx` — "I don't understand this, help me" on X-Ray + Path, calling `member_help` with redacted text + rules result + question.
- [ ] 9. e2e: one run using a printed photo of the sample letter with AI disabled (rules-only path).
- [ ] 10. `.env.example` (GUIDANCE_MODEL, OPENAI_API_KEY optional) + README; log decisions in KIRO_USAGE.md.

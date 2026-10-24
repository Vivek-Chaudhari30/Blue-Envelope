# Letter & Earnings Reader — Requirements (EARS)

Source: the readers/AI architecture in `.kiro/steering/tech.md` and `.kiro/steering/consent-privacy.md`, and `docs/ARCHITECTURE.md`. Two layers — on-device OCR, then plain-code extraction — with Luna as a guarded fallback only.

## On-device OCR

**O1 — On device only.** WHEN the member adds a photo, the system SHALL run OCR on the device (`tesseract.js` in a Web Worker), lazy-loaded only then. The photo SHALL NOT leave the device, be stored, or be logged.
**O2 — Resize.** The image SHALL be resized to max 1600px on its longest side before OCR.
**O3 — Output.** OCR SHALL return line-level text with bounding boxes and a confidence per line.
**O4 — Notice.** The X-Ray screen SHALL show "Your letter stays on your phone".

## Plain-code extraction (rules first)

**E1 — Letter rules.** `lib/readers/letter-rules.ts` SHALL extract, by regex/plain code: deadline ("respond by" + a date), asking ("Tell us about…"), send ("Send proof…"), how (online/mail/fax/phone).
**E2 — No invented deadline.** The letter reader SHALL NEVER return a deadline that is not present verbatim in the OCR text.
**E3 — Earnings rules.** `lib/readers/earnings-rules.ts` SHALL extract dollar amounts and date ranges by regex and return `{period, amount}[]` plus a total.
**E4 — Total = sum.** The earnings total SHALL equal the sum of the parsed amounts (to the cent).
**E5 — Confidence gate.** WHEN a required field is missing OR the OCR confidence for the relevant lines is below threshold OR the letter is not the standard renewal notice, the reader SHALL mark that field for the Luna fallback rather than guessing.

## Luna fallback (`/api/guide`)

**G1 — Reasons.** The route SHALL accept `reason ∈ {letter_repair, letter_unknown_type, earnings_normalize, member_help}` only.
**G2 — When.** Luna SHALL be called ONLY when rules miss a field, OCR confidence is below threshold, the letter is not the standard renewal notice, earnings are ambiguous, or the member taps "I don't understand this, help me".
**G3 — Never.** Luna SHALL NEVER decide eligibility (the rules engine does), never produce a deadline the rules already found, never generate fixed UI text.
**G4 — Redaction.** The client SHALL redact the name after "Dear", member IDs, addresses and phone numbers before sending, and SHALL send text only — never an image.
**G5 — Model.** The route SHALL use the Vercel AI SDK with structured output; model from `GUIDANCE_MODEL` (default `openai/gpt-6-luna`) via the Vercel AI Gateway, falling back to `OPENAI_API_KEY` if set. Server-only; no keys in client code, the repo, or `.kiro`.
**G6 — System prompt.** The system prompt SHALL enforce: never say eligible/approved/guaranteed/qualify; MassHealth decides; point to MassHealth, 211 or the health center; sixth-grade language; answer in the requested language.
**G7 — Validation.** The server SHALL validate output with zod, then a grounding check (every returned date, amount and line id must exist in the submitted text), then the banned-phrase filter on all returned text.
**G8 — Fallback.** On any validation/grounding/banned failure OR an 8-second timeout, the route SHALL return a fallback and the UI SHALL show the sample with a clear note.
**G9 — Rate limit & logging.** The route SHALL rate-limit per IP and log only `reason`, latency and token counts — never text.
**G10 — Device cache.** Responses SHALL be cached on the device keyed by a hash of the redacted text.
**G11 — Works without a key.** WHEN no AI key is configured, the app SHALL work fully: rules only plus the sample fallback.

## Help button

**H1.** The X-Ray and Path screens SHALL show an "I don't understand this, help me" button that calls `member_help` with the redacted letter text, the rules-engine result, and the member's question.

## Properties (fast-check)

- **Redaction:** the redacted output NEVER contains the input's member ID, phone number, or the name after "Dear".
- **Grounding:** the server rejects any returned value (date/amount/line id) not present in the submitted text.
- **Banned phrases:** Luna output never contains a banned phrase in any language.
- **No invented deadline (E2):** for text with no date, the letter reader returns no deadline.
- **Earnings total (E4):** total equals the sum of parsed amounts.

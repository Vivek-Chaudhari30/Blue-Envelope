# Letter & Earnings Reader — Design

## Files

- `workers/ocr.worker.ts` — the tesseract.js Web Worker (lazy-loaded). Receives a resized bitmap, posts back `{ lines: { text, bbox, confidence }[] }`.
- `lib/readers/ocr-client.ts` — client helper: resize to 1600px (canvas), spin up the worker on demand, return OCR lines. Never stores or logs the image.
- `lib/readers/types.ts` — `OcrLine`, `LetterFields`, `EarningsRead`.
- `lib/readers/letter-rules.ts` — pure extraction of deadline/asking/send/how from OCR lines. No invented values.
- `lib/readers/earnings-rules.ts` — pure extraction of `{period, amount}[]` + total.
- `lib/readers/redact.ts` — client-side redaction (name-after-Dear, member id, address, phone).
- `lib/guide/schema.ts` — zod schemas for each Luna `reason`'s structured output.
- `lib/guide/ground.ts` — grounding check (every date/amount/line id must appear in the submitted text) + banned-phrase filter reuse (`lib/i18n` BANNED).
- `app/api/guide/route.ts` — the server route: zod → ground → banned filter → 8s timeout → fallback; per-IP rate limit; logs only reason/latency/tokens.
- `components/flow/HelpButton.tsx` — "I don't understand this, help me" (X-Ray + Path).

## Flow

```
photo ─► resize 1600px ─► OCR worker (on device) ─► OcrLine[]
                                             │
                                             ▼
                              letter-rules / earnings-rules  (plain code first)
                                             │
                     fields complete & confident? ──yes──► render X-Ray / earnings
                                             │no
                                             ▼
                        redact(text) ─► /api/guide (reason)
                                             │
                        zod ─► grounding ─► banned filter ─► 8s timeout
                                             │fail/timeout
                                             ▼
                                   sample fallback + visible note
```

## Reader types

```ts
interface OcrLine { text: string; bbox: { x: number; y: number; w: number; h: number }; confidence: number; id: string; }
interface LetterFields {
  deadline?: { date: string; lineId: string };
  asking?: { lineId: string };
  send?: { lineId: string };
  how?: { lineId: string };
  isStandardRenewal: boolean;
  needsGuide: ("deadline" | "asking" | "send" | "how" | "type")[];
}
interface EarningsRead { weeks: { period: string; amount: number }[]; total: number; }
```

## Extraction rules (pure, testable)

- **deadline:** match `/respond by\s+(...date...)/i`; date patterns like `December 15, 2026` or `12/15/2026`. Return the matched date string verbatim + its line id. No match ⇒ no deadline (E2).
- **asking:** line containing `tell us about`.
- **send:** line containing `send proof`.
- **how:** line mentioning `online`, `mail`, `fax`, or `phone`.
- **earnings:** dollar amounts `/\$\s?(\d[\d,]*\.?\d{0,2})/g` and ranges `/\b(?:Jan|Feb|…)\s?\d+\s?[–-]\s?\d+/`; total = sum of amounts, rounded to cents (E4).

## Luna route

Vercel AI SDK `generateObject` (verify against the installed version) with the per-reason zod schema. Model resolution: `GUIDANCE_MODEL` (default `openai/gpt-6-luna`) over the AI Gateway; if only `OPENAI_API_KEY` is set, use that. If neither is configured, the route returns `{ grounded: false, fallback: true }` immediately (G11). `Promise.race` with an 8s timer (G8). Rate-limit: in-memory token bucket keyed by IP (demo-grade). Logging: `{ reason, ms, inTok, outTok }` only.

## Redaction (client)

`redact(text)` replaces: the token(s) after `Dear ` up to the comma/newline; `Member ID` values; US phone patterns; street-address-like lines. Returns redacted text + the removed spans are NOT returned anywhere. Property-tested: output never contains the removed member id / phone / name.

## No-key behavior

With no key: OCR + plain-code rules run fully on device; any `needsGuide` field shows the sample fallback with a note. The whole app works.

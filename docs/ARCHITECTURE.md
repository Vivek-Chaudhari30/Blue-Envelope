# Blue Envelope — Architecture

How a letter and earnings become a proof packet, and exactly when the AI guide (Luna) is — and is not — involved. The guiding rule: **the rules engine and plain-code extraction do the deciding; Luna only helps when they can't, and never touches eligibility.**

## Data flow

```
┌──────────────────────────────── the member's phone (nothing leaves unless noted) ───────────────────────────────┐
│                                                                                                                  │
│   photo ──► resize to 1600px ──► tesseract.js OCR (Web Worker, lazy)  ──►  OcrLine[] { text, bbox, confidence }   │
│     │                                                                            │                               │
│     └─ photo NEVER leaves the device, is never stored, never logged             ▼                                │
│                                                      lib/readers/letter-rules.ts + earnings-rules.ts  (PLAIN CODE)│
│                                                                                  │                               │
│                                                        fields complete & confident?                              │
│                                                            │yes                        │no / low-confidence      │
│                                                            ▼                            ▼                         │
│                                                  render X-Ray + earnings      redact(text)  (name/ID/addr/phone)  │
│  rules engine (lib/rules) ── decides eligibility, ALWAYS, never Luna                   │  text only, never image │
│                                                                                        ▼                         │
└────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────┘
                                                                               │  POST /api/guide { reason, redacted text }
                                                              ┌────────────────▼─────────────────┐  SERVER
                                                              │ Vercel AI SDK structured output   │
                                                              │ GUIDANCE_MODEL (openai/gpt-6-luna)│
                                                              │   via AI Gateway, or OPENAI_API_KEY│
                                                              │ zod ─► grounding ─► banned filter │
                                                              │ 8s timeout · rate-limit per IP    │
                                                              │ logs ONLY reason/latency/tokens   │
                                                              └────────────────┬─────────────────┘
                                                        grounded & clean? │yes        │no / timeout / no key
                                                                          ▼            ▼
                                                               structured guide    sample fallback + visible note
                                                           (cached on device by hash of redacted text)

Storage:  packet DRAFT ──► localStorage (never leaves unless shared)
          SHARED summary + partner sign-off ──► Supabase (no images, no OCR text) ──► readForViewer consent gate
```

## When Luna is called

| Reason | Trigger | What Luna may return | What Luna must NEVER do |
|---|---|---|---|
| `letter_repair` | Rules missed a field, or OCR confidence below threshold on the relevant lines | A repaired value for the missing field, grounded in the submitted text (a date/line id that exists in the text) | Invent a deadline not in the text; override a deadline the rules already found |
| `letter_unknown_type` | The letter is not the standard renewal notice | A plain-language summary of what the letter seems to ask, pointing to MassHealth / 211 / the health center | Decide eligibility; assert the member qualifies |
| `earnings_normalize` | Parsed earnings are ambiguous (odd periods/formats) | Normalized `{period, amount}` grounded in the text; total still = sum | Produce an amount not present in the text |
| `member_help` | The member taps "I don't understand this, help me" (X-Ray / Path) | A sixth-grade-level answer to the member's question, in their language, using the redacted text + the rules-engine result | Say eligible/approved/guaranteed/qualify; replace the rules engine's decision |

**Never calls Luna:** eligibility decisions (rules engine only), a deadline the rules already found, any fixed UI string (those come from `locales/*.json`).

## Guarantees

- **Privacy:** photos and OCR text never leave the device except redacted text to `/api/guide`. The server logs only `reason`, latency, token counts.
- **Grounding:** every date, amount and line id Luna returns must exist in the submitted text, or the response is rejected and the sample fallback shown.
- **No-key operation:** with no `GUIDANCE_MODEL`/`OPENAI_API_KEY`, OCR + plain-code rules run fully on device and any gap shows the sample fallback — the app works end to end.
- **Determinism where it matters:** the rules engine and extractors are pure and property-tested; Luna is bounded by zod + grounding + banned-phrase + timeout.

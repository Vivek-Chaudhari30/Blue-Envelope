---
inclusion: always
---

# Tech stack and constraints

- **Framework:** Next.js (App Router) with TypeScript in strict mode. Node 22 or newer. npm.
- **Styling:** Plain CSS with CSS custom properties ported from the prototype's `:root` tokens (light and dark). CSS Modules per component plus one `app/globals.css` for tokens. No Tailwind, no UI kit. Fonts via `next/font/google`: Bricolage Grotesque (display), Public Sans (body), IBM Plex Mono (labels and numbers).
- **State:** The member flow is one client-side state machine (like the prototype's `S` object) in a React context. No backend needed for Phase A.
- **Reading letters and earnings (Phase B).** Two layers, in this order:
  1. **On-device OCR.** `tesseract.js`, lazy-loaded in a **Web Worker** only when the user adds a photo. The image is resized to max 1600px first. OCR returns line-level text, bounding boxes and confidence. **Photos never leave the device, are never stored, never logged.** The X-Ray screen shows "Your letter stays on your phone".
  2. **Plain-code extraction first** (`lib/readers/letter-rules.ts`, `lib/readers/earnings-rules.ts`). Letter patterns: deadline ("respond by" + date), asking ("Tell us about"), send ("Send proof"), how (online/mail/fax/phone). Earnings: dollar-amount and date-range regex. Rules never invent a deadline not present in the text; the earnings total equals the sum of parsed amounts.
- **Luna — AI fallback/guide only.** One server route `app/api/guide/route.ts`, `reason ∈ {letter_repair, letter_unknown_type, earnings_normalize, member_help}`. Called ONLY when rules miss a field, OCR confidence is below threshold, the letter is not the standard renewal notice, earnings are ambiguous, or the member taps "I don't understand this, help me". **Never for eligibility** (the rules engine decides), never for a deadline the rules already found, never for fixed UI text.
  - **Vercel AI SDK** with structured output (verify the API against the installed package version). Model from env `GUIDANCE_MODEL` (default `openai/gpt-6-luna`) via the Vercel AI Gateway; fall back to `OPENAI_API_KEY` if set. **Server-only; no keys in client code, the repo, or `.kiro`.**
  - **Client redacts before sending:** the name after "Dear", member IDs, addresses, phone numbers. **Text only, never images.**
  - **System prompt enforces steering:** never say eligible/approved/guaranteed/qualify; MassHealth decides; point to MassHealth, 211 or the health center; sixth-grade language; answer in the requested language.
  - **Server validation:** zod, then a **grounding check** — every returned date, amount and line id must exist in the submitted text — then the banned-phrase filter on all returned text. On any failure or an **8-second timeout**, return a fallback and the UI shows the sample with a clear note.
  - **Rate limit per IP.** Log only `reason`, latency and token counts — never text. Responses are cached on the device keyed by a hash of the redacted text.
  - **With no AI key configured, the app works fully:** rules only plus the sample fallback.
- **Structured output:** every AI response is validated with zod and grounded before use. Invalid or ungrounded output falls back to the sample.
- **Storage (Phase B):** the packet **draft** lives in `localStorage`. **Supabase** holds only **shared packet summaries and partner sign-offs** — no images, no OCR text. Every navigator/partner read goes through `readForViewer`. (The `PacketStore` interface keeps a `LocalStore` demo adapter; the shared adapter is Supabase.)
- **Testing:** Vitest for unit tests, fast-check for property-based tests, Playwright for one mobile end-to-end run of Maria's story (iPhone viewport).
- **Deploy:** Vercel. Keep `main` deployable at all times.
- **Secrets:** Never commit keys. Use `.env.local`; keep `.env.example` current. Never put secrets in steering or specs.
- **Accessibility:** Semantic HTML, labels on every control, visible focus, tap targets at least 44 px, `prefers-reduced-motion` respected, `lang` attribute set on translated text.

## Scripts (keep these names; hooks call them)

- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`
- `npm run test` (all Vitest), `npm run test:rules` (rules engine + properties), `npm run test:content` (locale parity + banned phrases), `npm run test:e2e` (Playwright)

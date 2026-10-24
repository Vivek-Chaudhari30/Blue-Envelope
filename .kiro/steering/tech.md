---
inclusion: always
---

# Tech stack and constraints

- **Framework:** Next.js (App Router) with TypeScript in strict mode. Node 22 or newer. npm.
- **Styling:** Plain CSS with CSS custom properties ported from the prototype's `:root` tokens (light and dark). CSS Modules per component plus one `app/globals.css` for tokens. No Tailwind, no UI kit. Fonts via `next/font/google`: Bricolage Grotesque (display), Public Sans (body), IBM Plex Mono (labels and numbers).
- **State:** The member flow is one client-side state machine (like the prototype's `S` object) in a React context. No backend needed for Phase A.
- **AI (Phase B):** AWS SDK v3. Amazon Textract `DetectDocumentText` for text and bounding boxes; Amazon Bedrock Runtime (Converse API) with a Claude model for classification, plain-language explanations, translations, and reading earnings screenshots. Model id comes from `BEDROCK_MODEL_ID`. Region from `AWS_REGION`. Server-side only, in route handlers under `app/api/`.
- **Reader mode:** `READER_MODE=mock` (default) returns the sample letter and sample earnings so the demo works with no keys. `READER_MODE=bedrock` uses AWS. Every AI call has a timeout and falls back to mock with a visible "sample" note.
- **Structured output:** AI responses must be validated with zod before use. Invalid output falls back to mock.
- **Storage (Phase B):** a `PacketStore` interface with two adapters: `LocalStore` (same-browser localStorage, demo default) and `RedisStore` (Upstash Redis REST, used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set).
- **Testing:** Vitest for unit tests, fast-check for property-based tests, Playwright for one mobile end-to-end run of Maria's story (iPhone viewport).
- **Deploy:** Vercel. Keep `main` deployable at all times.
- **Secrets:** Never commit keys. Use `.env.local`; keep `.env.example` current. Never put secrets in steering or specs.
- **Accessibility:** Semantic HTML, labels on every control, visible focus, tap targets at least 44 px, `prefers-reduced-motion` respected, `lang` attribute set on translated text.

## Scripts (keep these names; hooks call them)

- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`
- `npm run test` (all Vitest), `npm run test:rules` (rules engine + properties), `npm run test:content` (locale parity + banned phrases), `npm run test:e2e` (Playwright)

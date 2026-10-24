# Member Flow — Design

## Architecture

- Next.js App Router, TypeScript strict. `app/page.tsx` is a client component: the flow shell.
- One `FlowProvider` React context in `components/flow/FlowContext.tsx` holds state `S` (mirrors the prototype's `S` object) + actions. No backend in Phase A.
- Plain CSS: `app/globals.css` holds the ported `:root` tokens (light + the two dark blocks) and the body crosshatch. Per-component CSS Modules for component styles.
- Fonts via `next/font/google`: Bricolage Grotesque (display), Public Sans (body), IBM Plex Mono (mono). The letter uses a CSS `--font-letter` Courier stack (not a Google font).
- Copy lives in `locales/*.json` + `content/`; components import strings, never hard-code them (except the few structural English labels the prototype itself hard-codes, which we move to `en.json`).

## State shape (`S`)

```ts
{
  step: "home"|"letter"|"questions"|"path"|"packet"|"submit",
  lang: "en"|"es"|"pt"|"ht"|"zh"|"vi",
  letterPhoto: string|null,
  age: AgeBand,
  exemptions: ExemptionId[],
  act: Activities,              // from lib/rules/types
  contact: "recent"|"old"|"unsure",
  earnings: boolean, earningsPhotos: number,
  partner: "none"|"sent"|"confirmed",
  reminders: boolean, share: boolean, contactUpdated: boolean
}
```
Defaults = Maria (work on 52h/$612, volunteer on 22h, training off 10h, school off, contact "old", share false).

## Components

- `components/flow/` : `AppBar`, `FlowRail`, `Home`, `LetterXRay`, `Questions`, `Path`, `Packet`, `Submit`.
- `components/ui/` : `Button`, `Toggle`, `Option`, `Meter`, `Pill`, `Callout`.
- `app/layout.tsx` : fonts, `<html lang>`, globals import, the stage/device/footer chrome shell from the prototype (rail + phone frame on desktop; app-is-page on phone).

## Rules & i18n boundaries

- UI imports `evaluate`, `INCOME_RULE`, `HOURS_RULE` from `lib/rules` — never re-derives thresholds (R12).
- `lib/i18n/index.ts` exports `t(key, lang)`, the `LANGS` list with speech codes, and the language-equivalent banned-phrase list for the content test.
- Deadline constant and `daysLeft()` live in `lib/` (UI layer), not the rules engine.

## Content split

- `locales/en.json` is the key master. es/pt/ht/zh/vi have identical keys (content test enforces parity). Home + X-Ray strings port verbatim from the prototype `T` object; all other UI strings are added in en and translated.
- `content/sample-letter.ts`, `content/sample-earnings.ts` hold the sample letter body and the four weekly payouts (148.50/171.25/139.00/153.25, total 612.00).

## Read-aloud

Web Speech API `SpeechSynthesisUtterance`, `u.lang = speechCode`, wrapped in try/catch with a visible fallback note (L3). Guarded for SSR (only in event handler, client component).

## Accessibility & responsive

Match the prototype media queries: desktop two-column stage, `<=900px` single column with device first, `<=520px` device becomes the page. `prefers-reduced-motion` kills transitions. All option buttons use `aria-pressed`; toggles are real checkboxes visually styled.

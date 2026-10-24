---
inclusion: always
---

# Project structure

```
app/
  layout.tsx              fonts, tokens, footer disclaimer
  globals.css             design tokens (light + dark) from the prototype
  page.tsx                member flow shell (6 steps, client component)
  partner/[token]/page.tsx   community partner sign-off (Phase B)
  navigator/page.tsx      Navigator Board (Phase B)
  twin/page.tsx           Coverage Twin (Phase C)
  api/read-letter/route.ts      Textract + Bedrock, or mock
  api/read-earnings/route.ts    Bedrock vision, or mock
components/
  flow/                   Home, LetterXRay, Questions, Path, Packet, Submit, AppBar, FlowRail
  ui/                     Button, Toggle, Option, Meter, Pill, Callout
lib/
  rules/engine.ts         pure rules engine (no I/O, no AI)
  rules/sources.ts        source table mirrored from docs/RULES_SOURCE.md
  rules/types.ts
  readers/letter.ts       reader interface + mock + bedrock implementations
  readers/earnings.ts
  store/packet-store.ts   PacketStore interface, LocalStore, RedisStore
  i18n/index.ts           t(key, lang), language list with speech codes
locales/                  en.json es.json pt.json ht.json zh.json vi.json
content/                  sample-letter.ts, sample-earnings.ts
scripts/generate-panel.ts seeded synthetic navigator panel
tests/                    *.test.ts, *.property.test.ts, e2e/maria.spec.ts
public/samples/           sample letter image and earnings screenshots
docs/                     PRD, rules source, sample content, design reference, Kiro plan
.kiro/                    steering, specs, hooks, settings (never gitignored)
```

## Conventions

- Rules logic lives only in `lib/rules/`. UI never re-implements a threshold.
- User-facing copy lives only in `locales/*.json` or `content/`. No hard-coded strings in components except in tests.
- Components are small and named for what the user sees (`LetterXRay`, not `OcrOverlay`).
- Every new user-facing key is added to all six locale files in the same change.
- Commit messages: imperative, scoped, e.g. `rules: add caregiver exemption`.

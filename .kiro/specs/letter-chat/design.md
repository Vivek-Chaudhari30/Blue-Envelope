# Letter Chat — Design

## Merge-safety principle

To merge cleanly with Crew's community work, this feature adds **new files** and makes only **minimal, additive hooks** into `components/flow/LetterXRay.tsx` and `Path.tsx` (a single `<LetterChat/>` mount and a `<DeleteLetter/>` button; an `onEdit`/provenance wrapper around the existing extracted-value render). No shared file is restructured.

## New files

- `components/chat/LetterChat.tsx` — the bottom-sheet chat (chips, free text, answers, evidence, cap, "not sure" card).
- `components/chat/Mic.tsx` — speech-to-text button (feature-detected).
- `components/chat/ReadAloud.tsx` — "Read answer aloud" (wraps the existing speech helper).
- `components/chat/EvidenceChip.tsx` — "Based on:" chip; clicking emits a highlight event.
- `components/flow/ExtractedValue.tsx` — a value + Edit control + provenance chip (F1–F2).
- `components/flow/DeleteLetter.tsx` — the delete button + confirm (D1–D2).
- `lib/chat/types.ts` — `ChatTurn`, `Evidence`, `Provenance`, `LetterState`.
- `lib/chat/store.ts` — device-only persistence of letter state (photo ref, OCR lines, chat turns, extracted/edited values) under `be:letter:*` keys; `clearLetter()` wipes them all (D2).
- `lib/chat/ask.ts` — thin wrapper over `lib/guide/client.ts` `askGuide` that assembles the member_help payload (redacted lines + rules summary + ≤4 prior turns) and maps the response to an answer + evidence.
- `lib/speech/recognition.ts` — SpeechRecognition wrapper (feature detection, start/stop, language code).
- `app/chat.module.css` (or co-located module) — sheet + chip styles using the design tokens.

## Hooks into existing files (minimal)

- `LetterXRay.tsx`: mount `<LetterChat lang text lines rulesSummary/>` below the callouts; render extracted values through `<ExtractedValue/>`; add `<DeleteLetter/>`. A highlight event from an evidence chip scrolls to + flashes the matching `.hl`/callout.
- `Path.tsx`: no new chat (the existing HelpButton stays); only import nothing new unless needed.
- `Packet.tsx` (if required for F3): read the edited deadline from `lib/chat/store` if present, else the sample deadline. Kept additive.

## Evidence model

```ts
type Evidence =
  | { kind: "line"; lineId: string }      // scrolls to a letter line / callout
  | { kind: "source"; sourceId: string }; // a RULES_SOURCE.md id, links out
type Provenance = "letter" | "edited" | "suggested";
interface ChatTurn { role: "user" | "assistant"; text: string; evidence?: Evidence; notSure?: boolean; }
```

Pre-written chip answers carry a fixed `Evidence` (e.g. the deadline chip → `{kind:"line", lineId:"1"}`, the "what counts as proof" chip → `{kind:"line", lineId:"3"}`, "what does MassHealth decide" → `{kind:"source", sourceId:"mh-work-req"}`). The free-text answer's evidence comes from the guide response; if none, `notSure=true` (A5/G3).

## member_help payload

`lib/chat/ask.ts` builds `{ reason:"member_help", text: redactedLetterLines, lang, question, rulesSummary, lineIds }` and calls the existing `askGuide` (which redacts again defensively and caches on device). Prior turns (≤4) are appended to `question` as short context, device-only.

## Delete

`clearLetter()` removes every `be:letter:*` and `be:guide:*` key from localStorage and resets in-memory state via a context setter; the photo data URL is dropped. Confirmation text D2.

## Provenance + edits (F)

`ExtractedValue` holds `{ value, provenance }`. Initial = "letter" (from OCR/rules) or "suggested" (from a guide repair). On user edit → "edited" ("You changed this"). An edited deadline is written to `lib/chat/store` and read by the packet banner + `.ics` builder.

## Accessibility

Sheet is a labelled dialog; focus moves in on open, Escape closes. Mic has an explicit Listening/stop state. All controls ≥44px, reduced-motion respected.

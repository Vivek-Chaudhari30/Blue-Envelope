# Ready-to-send packet — Design

## Files (new) + minimal hook

- `lib/packet/pdf.ts` — pure-ish builder `buildPacketPdf(input): Promise<Uint8Array>` using `pdf-lib`. Takes the cover fields, earnings, partner hours, deadline, optional name/memberId, optional approved cover note. No I/O, no network.
- `lib/packet/cover.ts` — the fixed English cover template as pure functions (`coverLines(input): string[]`), so the content is property-testable without a PDF renderer.
- `components/flow/ReadyToSend.tsx` — the Submit-screen UI: build PDF, optional identity fields (in-memory), cover-note box (+ Luna rewrite + approve), Share/Download, suggested recipients, official options, "I sent it".
- `lib/guide/schema.ts` — add a `cover_note` reason + `CoverNoteOut { sentence }`.
- `lib/guide/ground.ts` — extend grounding so `cover_note` output contains no number/date absent from the submitted words.
- Hook: mount `<ReadyToSend/>` in `components/flow/Submit.tsx` (additive).

## Privacy architecture (the core requirement)

- Name + Member ID live ONLY in React state inside `ReadyToSend` and are passed directly to `buildPacketPdf`. They are **never** put in a fetch body and **never** written to localStorage. The `logEvent`/community client is never given them. The cover-note Luna call sends only the note words (redacted by the existing client), never the identity fields.
- The PDF bytes stay in memory; Share hands the `File` to the OS share sheet; Download writes a blob URL. Neither uploads to our server.

## PDF layout (pdf-lib)

- Page 1 (cover): title "Response to renewal notice dated {date}"; "Name: {name or ____}"; "Member ID: {memberId or ____}"; one-sentence path (from the rules result); "Enclosures:" bullet list; "Respond by {deadline}"; optional approved cover note; signature line "Signature: ____  Date: ____"; footer "Prepared with Blue Envelope (independent tool, not MassHealth)".
- Page 2: "March earnings" table (weeks + total) when the path is income/hours.
- Page 3: "Volunteer hours: 22 confirmed by Riverside Food Pantry (sample)" when partner-confirmed.
- Standard fonts (Helvetica) embedded by pdf-lib; no external assets.

## Cover sentence (grounded, no banned phrases)

`pathSentence(status)` returns a fixed plain-English line per status, e.g. income → "My earnings for one month were $612, which may meet the monthly income rule. MassHealth makes the decision." Never "eligible/approved/qualify". Property-tested against the banned list.

## cover_note grounding

`groundsCoverNote(sentence, memberWords)`: every number and date token in `sentence` must also appear in `memberWords`; otherwise reject and fall back to the member's own words. Reuses the banned filter.

## I sent it

Records `{ date, method }` in component state (optionally a non-identifying `be:packet:sent` flag — date + method only, never name/id), appends a VALARM-free note to the `.ics` via a second event "Check your account in about 10 days" at deadline+10d. Shows the fixed message; never claims the account is updated.

# Ready-to-send packet — Requirements (EARS)

A one-tap, on-device PDF of the member's proof packet on the Submit screen, plus share/official-send options and an optional Luna-rewritten cover note. Privacy first: the member's name and Member ID never leave the device and are never persisted.

Sources: `docs/ARCHITECTURE.md`, `.kiro/steering/consent-privacy.md`, `.kiro/steering/plain-language.md`, `docs/RULES_SOURCE.md`.

## PDF (on device)

**P1.** The PDF SHALL be built ON THE DEVICE (pdf-lib or jsPDF). Nothing about it is uploaded or stored server-side.
**P2 — Cover page.** The cover page body is a fixed ENGLISH template (with a side-by-side translation shown on screen, not in the PDF). It contains: "Name: ____" and "Member ID: ____" **blank by default**; "Response to renewal notice dated {date}"; the rules-engine path in one plain sentence; a list of enclosures; the deadline; a signature line; and the footer "Prepared with Blue Envelope (independent tool, not MassHealth)".
**P3 — Optional identity fields.** An optional "Fill these in on my phone" control lets the member type Name and Member ID; these are written INTO the PDF only, kept in memory, **never sent to any API and never saved to localStorage**.
**P4 — Pages 2–3.** Earnings summary (the parsed weeks + total); partner-confirmed hours if present.
**P5 — Deadline always.** The cover page SHALL always show the deadline (the edited one if the member changed it).
**P6 — No banned phrases.** No text the PDF generator emits SHALL contain a banned phrase in any language.

## Share

**S1.** "Share my packet" SHALL use the Web Share API with the PDF file (`navigator.share({ files })`) so the member can attach it in Gmail, WhatsApp, or a fax app.
**S2.** WHEN file sharing is unsupported, it SHALL fall back to a Download.
**S3.** Suggested recipients SHALL be shown as text only: myself (to print), my health center navigator, a family member.

## Official options

**O1.** The screen SHALL list: Upload in your MassHealth online account (steps), Mail to the address on your letter, Fax to the number on your letter, Take it to your health center.
**O2.** It SHALL say: "Send it the way your letter says. If your letter lists an email address, you can use that."
**O3.** It SHALL NEVER hard-code or invent a MassHealth email address.

## Cover note (optional, Luna)

**N1.** An optional cover note lets the member write their own words.
**N2.** WHEN a guide model is configured, Luna (`/api/guide` reason `cover_note`) rewrites them into one plain English sentence, GROUNDED — adding no new facts (no number or date not in the member's words).
**N3.** The member SHALL approve the rewrite before it is used; with no model, the member's own words are used as-is.

## I sent it

**I1.** "I sent it" SHALL record the date + method ON THE DEVICE, then show "MassHealth will review it. Check your account in about 10 days," and add that to the `.ics`.
**I2.** It SHALL NEVER say the account is updated or that the member qualifies.

## Properties (fast-check)

- The member's Name and Member ID never appear in any network request body or in any localStorage key/value.
- The cover page text never contains a banned phrase and always includes the deadline.
- `cover_note` output adds no number or date that is absent from the member's own words.

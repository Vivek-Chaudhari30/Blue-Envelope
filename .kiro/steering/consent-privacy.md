---
inclusion: fileMatch
fileMatchPattern: ["lib/store/**", "lib/readers/**", "app/navigator/**", "app/partner/**", "app/api/**", "components/flow/Packet*", "components/flow/LetterXRay*", "workers/**"]
---

# Consent and privacy

- A member's packet is private by default. `sharedWith` is empty until the member turns on "Share with my health center".
- Every read of a packet from the navigator or partner side must go through `PacketStore.readForViewer(packetId, viewer)`, which checks consent and returns nothing when consent is missing or revoked. Never read the raw store from a page.
- Partners only see the member's first name, the organization, the month and the hours field. They never see the letter, earnings or answers.

## Photos and on-device OCR

- Uploaded photos are read **on the device** (tesseract.js in a Web Worker). **Photos never leave the device, are never stored, and are never logged** — not the bytes, not a data URL, nowhere. The X-Ray screen says "Your letter stays on your phone".
- Extracted OCR text stays on the device too. It is never sent anywhere except, after redaction, to the Luna guide route — and only the text, never the image.

## Luna (AI guide) privacy

- **Client redacts before any request to `/api/guide`:** the name after "Dear", member IDs, addresses, phone numbers. Text only — never an image.
- The server **logs only** `reason`, latency and token counts. It never logs the submitted text, the returned text, or any personal field.
- The server validates Luna output with zod, then a **grounding check** (every returned date, amount and line id must exist in the submitted text), then the **banned-phrase filter**. On any failure or an 8-second timeout it returns the sample fallback with a visible note. Luna is **never** used for eligibility — the rules engine decides.
- Luna responses are cached on the device, keyed by a hash of the redacted text. The cache never leaves the device.

## General

- All data in this project is synthetic. Never add real names, member IDs, addresses or phone numbers.
- Show "Independent tool · Not MassHealth · Sample data" on every page.

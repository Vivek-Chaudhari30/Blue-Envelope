# Coordination — Requirements (EARS)

Sources: `docs/PRD.md` §4 Phase B, `docs/SAMPLE_CONTENT.md`, `.kiro/steering/consent-privacy.md`, and properties 11–13 in `docs/RULES_SOURCE.md` §4. Covers the packet store with consent, the community-partner sign-off page, and the Navigator Board. All data synthetic.

## PacketStore + consent

**C1 — Interface.** The system SHALL expose a `PacketStore` with two adapters: `LocalStore` (same-browser localStorage, demo default) and `RedisStore` (Upstash Redis REST), selected at runtime — RedisStore WHEN both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, otherwise LocalStore.

**C2 — Private by default.** A packet's `sharedWith` SHALL be empty until the member turns on sharing; sharing can be revoked at any time, emptying `sharedWith`.

**C3 — Consent-gated reads.** Every navigator- or partner-side read SHALL go through `PacketStore.readForViewer(packetId, viewer)`, which returns the packet only when the viewer's consent is recorded and not revoked, and returns nothing otherwise. Pages SHALL NEVER read the raw store.

**C4 — Partner minimal view.** A partner viewer SHALL see only the member's first name, the organization, the month, and the hours field — never the letter, earnings or answers.

**C5 — No image persistence.** Uploaded photos SHALL be processed in memory and never stored server-side; image bytes and extracted personal text SHALL NOT be logged.

## Partner sign-off (`/partner/[token]`)

**P1 — Token link.** A sign-off link SHALL carry an opaque token identifying one partner request (member first name, organization, month, hours field).

**P2 — Coordinator action.** The coordinator SHALL see the minimal view (C4), enter confirmed hours, and confirm; the status SHALL flow back to the member's packet (`none → sent → confirmed`).

**P3 — Demo fallback.** WHEN no token round-trip is available (pure localStorage demo), the packet SHALL still offer a demo path to reach the confirmed state so the flow is always demonstrable.

## Navigator Board (`/navigator`)

**N1 — Synthetic panel.** The board SHALL render ~40 synthetic patients from `scripts/generate-panel.ts` (seed 2026), labeled synthetic. Maria is always present: renewal in 21 days, inhaler refill 3 days after her deadline, contact updated 2 years ago.

**N2 — Pipeline columns.** The board SHALL group patients by status: `not_started → notice_received → proof_gathered → submitted`.

**N3 — Continuity flag.** WHEN a patient has a refill or appointment AFTER the renewal deadline AND status ≠ submitted, the board SHALL set the continuity flag (property 13).

**N4 — Stale-contact flag.** WHEN a patient's contact was updated more than 12 months ago, the board SHALL set the stale-contact flag.

**N5 — Act-now flag.** WHEN the deadline is ≤ 14 days away AND the packet is incomplete (status ≠ submitted/proof_gathered), the board SHALL place the patient in the act-now queue (property 12).

**N6 — Language.** Each card SHALL show the patient's language.

**N7 — Consent on Maria.** Maria's packet contents SHALL be visible to the navigator only when she has turned sharing on (via `readForViewer`); otherwise the card shows status only, no packet.

**N8 — Footer.** The board SHALL show "Independent tool · Not MassHealth · Sample data".

## Properties (fast-check) — `docs/RULES_SOURCE.md` §4

11. A navigator can read a packet ⇒ the member's consent is recorded and not revoked.
12. Deadline ≤ 14 days and packet incomplete ⇒ case is in the "act now" queue.
13. A refill or appointment after the deadline and status ≠ submitted ⇒ continuity flag set.

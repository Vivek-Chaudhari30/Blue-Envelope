# Coordination — Design

## Files

- `lib/store/types.ts` — `Packet`, `Viewer`, `PartnerView`, `PacketStore` interface.
- `lib/store/local-store.ts` — `LocalStore` (localStorage; falls back to in-memory on the server).
- `lib/store/redis-store.ts` — `RedisStore` (Upstash REST via fetch).
- `lib/store/index.ts` — `getStore()` picks Redis when both Upstash env vars exist, else Local.
- `lib/panel/types.ts` + `scripts/generate-panel.ts` — seeded synthetic panel; also a `generatePanel(seed)` pure export the board and tests import.
- `lib/panel/flags.ts` — pure flag logic: `continuityFlag`, `staleContact`, `actNow` (property-tested).
- `app/navigator/page.tsx` — the board (server component reads the generated panel; Maria's packet via `readForViewer`).
- `app/partner/[token]/page.tsx` — sign-off page.
- `components/navigator/*`, `components/partner/*` — presentational.

## Types

```ts
interface Packet {
  id: string;
  firstName: string;
  status: "not_started" | "notice_received" | "proof_gathered" | "submitted";
  hours?: number;            // partner-confirmable field
  organization?: string;
  month?: string;
  sharedWith: string[];      // viewer ids with consent; empty = private
  // full contents (navigator-only, behind consent)
  earningsTotal?: number;
  path?: string;
}

type Viewer = { kind: "navigator" | "partner"; id: string };

interface PartnerView {         // the ONLY shape a partner ever sees (C4)
  firstName: string; organization: string; month: string; hours?: number;
}

interface PacketStore {
  get(id: string): Promise<Packet | null>;            // internal/owner use
  put(p: Packet): Promise<void>;
  readForViewer(id: string, viewer: Viewer): Promise<Packet | PartnerView | null>;
  share(id: string, viewerId: string): Promise<void>;
  revoke(id: string, viewerId: string): Promise<void>;
}
```

`readForViewer` returns `null` when `!sharedWith.includes(viewer.id)`. A partner viewer gets the `PartnerView` projection; a navigator gets the full `Packet`. This is the single consent gate (C3).

## Panel generation

Deterministic PRNG seeded with 2026 (mulberry32). ~40 patients `{ id, firstName, lastInitial, language, renewalDue, status, nextRefill?, nextAppointment?, contactUpdatedOn, sharedPacket }`. Languages weighted to MA (en, es, pt, ht, zh, vi). Maria hard-coded first: renewalDue = today+21d, nextRefill = deadline+3d, contactUpdatedOn = today−2y, sharedPacket toggled by the member flow (board reads it via the store; default false). Same seed ⇒ same panel (property 16 later reuses this).

## Flags (pure, `lib/panel/flags.ts`)

```
staleContact(contactUpdatedOn, now)  = monthsBetween > 12
continuityFlag(patient, now)         = (refill||appt after renewalDue) && status != submitted
actNow(patient, now)                 = daysUntil(renewalDue) <= 14 && status not in {submitted, proof_gathered}
```
All take `now` as a parameter (no ambient clock), so property tests 12–13 are deterministic.

## Partner page

`/partner/[token]`: the token encodes a packet id + the partner viewer id (base64url of `id:viewerId`, synthetic — not a security boundary, labeled demo). Server loads via `readForViewer` as a partner ⇒ `PartnerView`. A client form posts confirmed hours to a route handler that updates the packet status to `confirmed`. Demo fallback (P3): the member packet keeps a "confirm (demo)" action that sets confirmed locally when no round-trip occurred.

## Consent boundary in the member flow

The Packet screen's "Share with my health center" toggle calls `store.share`/`store.revoke` for the navigator viewer id. The Navigator Board's Maria card calls `readForViewer`; null ⇒ render status only (N7).

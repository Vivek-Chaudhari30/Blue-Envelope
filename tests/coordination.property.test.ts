import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { continuityFlag, actNow } from "@/lib/panel/flags";
import type { Patient, PanelStatus } from "@/lib/panel/types";
import { LocalStore } from "@/lib/store/local-store";
import type { Packet } from "@/lib/store/types";

const NOW = new Date("2026-10-24T00:00:00Z").getTime();
const DAY = 86_400_000;
const STATUSES: PanelStatus[] = [
  "not_started",
  "notice_received",
  "proof_gathered",
  "submitted",
];

function isoFromNow(days: number): string {
  return new Date(NOW + days * DAY).toISOString().slice(0, 10);
}

const arbPatient: fc.Arbitrary<Patient> = fc.record({
  id: fc.string({ minLength: 1 }),
  firstName: fc.constant("X"),
  lastInitial: fc.constant("Y"),
  language: fc.constant("en" as const),
  renewalDue: fc.integer({ min: -30, max: 90 }).map(isoFromNow),
  status: fc.constantFrom(...STATUSES),
  nextRefill: fc.option(fc.integer({ min: -60, max: 120 }).map(isoFromNow), {
    nil: undefined,
  }),
  nextAppointment: fc.option(
    fc.integer({ min: -60, max: 120 }).map(isoFromNow),
    { nil: undefined },
  ),
  contactUpdatedOn: fc.integer({ min: -900, max: 0 }).map(isoFromNow),
  sharedPacket: fc.boolean(),
});

describe("coordination — properties (RULES_SOURCE.md §4)", () => {
  // Property 11: a navigator can read a packet => consent recorded & not revoked.
  it("P11: readForViewer returns a packet only when consent is present", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        fc.boolean(),
        async (shareFirst, revokeAfter) => {
          const store = new LocalStore();
          const packet: Packet = {
            id: "pkt",
            firstName: "Maria",
            status: "notice_received",
            sharedWith: [],
            earningsTotal: 612,
          };
          await store.put(packet);
          const viewer = { kind: "navigator" as const, id: "nav-1" };
          if (shareFirst) await store.share("pkt", "nav-1");
          if (shareFirst && revokeAfter) await store.revoke("pkt", "nav-1");

          const result = await store.readForViewer("pkt", viewer);
          const hasConsent = shareFirst && !revokeAfter;
          if (hasConsent) {
            expect(result).not.toBeNull();
          } else {
            expect(result).toBeNull();
          }
        },
      ),
    );
  });

  // Property 12: deadline <= 14 days and packet incomplete => act-now.
  it("P12: actNow iff deadline <= 14 days and status not submitted/proof_gathered", () => {
    fc.assert(
      fc.property(arbPatient, (p) => {
        const d = Math.ceil(
          (new Date(p.renewalDue).getTime() - NOW) / DAY,
        );
        const incomplete =
          p.status !== "submitted" && p.status !== "proof_gathered";
        const expected = incomplete && d <= 14;
        expect(actNow(p, NOW)).toBe(expected);
      }),
    );
  });

  // Property 13: refill/appointment after deadline and status != submitted => continuity.
  it("P13: continuity flag iff a refill/appt is after the deadline and not submitted", () => {
    fc.assert(
      fc.property(arbPatient, (p) => {
        const due = new Date(p.renewalDue).getTime();
        const refillAfter =
          p.nextRefill !== undefined &&
          new Date(p.nextRefill).getTime() > due;
        const apptAfter =
          p.nextAppointment !== undefined &&
          new Date(p.nextAppointment).getTime() > due;
        const expected =
          p.status !== "submitted" && (refillAfter || apptAfter);
        expect(continuityFlag(p, NOW)).toBe(expected);
      }),
    );
  });
});

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { buildIcs, reminderDates, REMINDER_DAYS, icsDate } from "@/lib/calendar/ics";

describe("ics calendar", () => {
  it("reminder dates are exactly 30/14/3 days before the deadline", () => {
    fc.assert(
      fc.property(fc.date({ min: new Date("2026-01-01"), max: new Date("2027-12-31") }), (d) => {
        const iso = d.toISOString();
        const reminders = reminderDates(iso);
        reminders.forEach((r, i) => {
          const days = Math.round((new Date(iso).getTime() - r.getTime()) / 86_400_000);
          expect(days).toBe(REMINDER_DAYS[i]);
        });
      }),
    );
  });

  it("the .ics has three VALARMs with -P30D / -P14D / -P3D triggers", () => {
    const ics = buildIcs("2026-12-15T23:59:00-05:00", "Blue Envelope deadline");
    expect((ics.match(/BEGIN:VALARM/g) ?? []).length).toBe(3);
    expect(ics).toContain("TRIGGER:-P30D");
    expect(ics).toContain("TRIGGER:-P14D");
    expect(ics).toContain("TRIGGER:-P3D");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("uses the edited deadline date", () => {
    const ics = buildIcs("2026-12-20T00:00:00Z", "x");
    expect(ics).toContain(`DTSTART;VALUE=DATE:${icsDate(new Date("2026-12-20T00:00:00Z"))}`);
  });
});

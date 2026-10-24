// On-device .ics generator for the proof-packet deadline, with reminders at
// 30, 14 and 3 days before. Pure + property-tested (the alarm offsets).

export const REMINDER_DAYS = [30, 14, 3];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a Date as an all-day iCalendar date value (YYYYMMDD). */
export function icsDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

/**
 * Build an .ics for a deadline (an all-day event) with VALARMs at
 * 30/14/3 days before. `deadline` is an ISO date or a parseable date string.
 */
export function buildIcs(deadlineISO: string, summary: string): string {
  const d = new Date(deadlineISO);
  const day = icsDate(d);
  const next = icsDate(new Date(d.getTime() + 86_400_000));
  const uid = `blue-envelope-${day}@blueenvelope.local`;
  const alarms = REMINDER_DAYS.map(
    (n) =>
      [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${summary} — ${n} days left`,
        `TRIGGER:-P${n}D`,
        "END:VALARM",
      ].join("\r\n"),
  ).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blue Envelope//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${day}T000000Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${summary}`,
    alarms,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** The three reminder dates (UTC) for a deadline — used by the property test. */
export function reminderDates(deadlineISO: string): Date[] {
  const d = new Date(deadlineISO).getTime();
  return REMINDER_DAYS.map((n) => new Date(d - n * 86_400_000));
}

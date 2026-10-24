// Deterministic synthetic panel generator. Same seed => same panel.
// No real PHI. Used by the Navigator Board and by property tests.

import type { Lang } from "@/lib/i18n";
import type { Patient, PanelStatus } from "./types";

/** mulberry32 — tiny deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "James", "Sofia", "João", "Jean", "Wei", "Minh", "Aisha", "Carlos",
  "Marie", "Pedro", "Li", "Thanh", "David", "Lucia", "Ana", "Pierre",
  "Chen", "Hoa", "Sarah", "Diego", "Rosa", "Guy", "Fang", "Bao",
  "Michael", "Elena", "Paulo", "Nadege", "Jing", "Tuan", "Grace", "Mateo",
];
const LAST_INITIALS = "ABCDEFGHJKLMNPRSTVW".split("");
const LANGS_WEIGHTED: Lang[] = [
  "en", "en", "en", "en", "en",
  "es", "es", "es",
  "pt", "pt",
  "ht", "ht",
  "zh",
  "vi",
];
const STATUSES: PanelStatus[] = [
  "not_started",
  "notice_received",
  "proof_gathered",
  "submitted",
];

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(base: number, days: number): string {
  return iso(new Date(base + days * 86_400_000));
}

/**
 * Generate a deterministic synthetic panel. `now` is parameterised so dates and
 * the derived flags are stable in tests.
 */
export function generatePanel(seed = 2026, now = Date.now()): Patient[] {
  const rand = mulberry32(seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;

  // Maria is always present (docs/SAMPLE_CONTENT.md): renewal in 21 days,
  // inhaler refill 3 days after her deadline, contact updated 2 years ago.
  const mariaDue = addDays(now, 21);
  const maria: Patient = {
    id: "maria",
    firstName: "Maria",
    lastInitial: "S",
    language: "pt",
    renewalDue: mariaDue,
    status: "notice_received",
    nextRefill: addDays(new Date(mariaDue).getTime(), 3),
    contactUpdatedOn: addDays(now, -730),
    sharedPacket: false,
  };

  const others: Patient[] = [];
  const count = 39; // + Maria = 40
  for (let i = 0; i < count; i++) {
    const dueOffset = Math.floor(rand() * 70) - 5; // -5..64 days
    const renewalDue = addDays(now, dueOffset);
    const status = pick(STATUSES);
    const hasRefill = rand() < 0.4;
    const hasAppt = rand() < 0.35;
    const contactMonthsAgo = Math.floor(rand() * 30); // 0..29 months
    others.push({
      id: `p-${i + 1}`,
      firstName: pick(FIRST_NAMES),
      lastInitial: pick(LAST_INITIALS),
      language: pick(LANGS_WEIGHTED),
      renewalDue,
      status,
      nextRefill: hasRefill
        ? addDays(new Date(renewalDue).getTime(), Math.floor(rand() * 40) - 10)
        : undefined,
      nextAppointment: hasAppt
        ? addDays(new Date(renewalDue).getTime(), Math.floor(rand() * 40) - 10)
        : undefined,
      contactUpdatedOn: addDays(now, -contactMonthsAgo * 30),
      sharedPacket: rand() < 0.5,
    });
  }

  return [maria, ...others];
}

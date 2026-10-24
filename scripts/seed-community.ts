// Seed ~40 towns with labeled SYNTHETIC history so the Community Board looks
// alive in the demo. Deterministic (seed 2026). Lowell is included and gets a
// helper ("Maria") with opt-in so her card shows. Writes lib/community/seed-data.json
// which the demo CommunityStore loads. Run: npm run seed:community

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { CommunityEvent, Member } from "@/lib/community/types";
import type { Lang } from "@/lib/i18n";
import towns from "@/lib/community/towns.json";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(2026);
const LANGS: Lang[] = ["en", "es", "pt", "ht", "zh", "vi"];
const NAMES = ["Alex", "Sam", "Jordan", "Taylor", "Chris", "Pat", "Robin", "Casey", "Jamie", "Morgan"];

const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)]!;
const t0 = new Date("2026-10-18T12:00:00Z").getTime();
const iso = (offsetHrs: number) => new Date(t0 + offsetHrs * 3_600_000).toISOString();

const members: Member[] = [];
const events: CommunityEvent[] = [];
let n = 0;

function addHelperWithInvitees(townId: string, invitees: number, optinName?: string) {
  const helperId = `seed-h-${n++}`;
  const code = `SEED${n}`;
  members.push({
    id: helperId,
    town_id: townId,
    language: pick(LANGS),
    helper_code: code,
    referred_by_code: null,
    display_name_optin: optinName ? { firstName: optinName } : null,
    created_at: iso(0),
  });
  events.push({ member_id: helperId, type: "packet_ready", town_id: townId, created_at: iso(1) });
  for (let i = 0; i < invitees; i++) {
    const inviteeId = `seed-i-${n}-${i}`;
    members.push({
      id: inviteeId,
      town_id: pick(towns).id,
      language: pick(LANGS),
      helper_code: `${code}I${i}`,
      referred_by_code: code,
      display_name_optin: null,
      created_at: iso(2),
    });
    // Most invitees reach packet_ready (so the helper's count is real).
    if (rand() < 0.8) {
      events.push({ member_id: inviteeId, type: "referral_opened", town_id: null, created_at: iso(3 + i) });
      events.push({ member_id: inviteeId, type: "packet_ready", town_id: null, created_at: iso(4 + i) });
    }
  }
}

// ~40 towns with synthetic helpers. Lowell first, with Maria opted in.
addHelperWithInvitees("lowell", 4, "Maria");
const sample = [...towns].sort(() => rand() - 0.5).slice(0, 39);
for (const town of sample) {
  addHelperWithInvitees(town.id, 1 + Math.floor(rand() * 6));
}

const out = join(process.cwd(), "lib/community/seed-data.json");
writeFileSync(out, JSON.stringify({ members, events, demo: true }, null, 2) + "\n");
process.stderr.write(
  `Seeded ${members.length} synthetic members / ${events.length} events (demo) to ${out}\n`,
);

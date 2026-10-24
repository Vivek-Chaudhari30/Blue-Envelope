// Pure referral counting. Server-authoritative; the client is never trusted.
// A referral counts only when the invitee reaches packet_ready, once per
// invitee, never for self, at most 20 per helper per day (community-safety.md).

import type { CommunityEvent, Member } from "./types";

export const DAILY_CAP = 20;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Count, per helper member id, the number of DISTINCT invitees who were
 * referred by that helper and have reached packet_ready — excluding
 * self-referral, deduped per invitee, capped at DAILY_CAP per helper per day.
 */
export function countReferrals(
  members: Member[],
  events: CommunityEvent[],
): Map<string, number> {
  const byId = new Map(members.map((m) => [m.id, m]));
  const codeToHelper = new Map(members.map((m) => [m.helper_code, m.id]));

  // Invitees who reached packet_ready, with the earliest such timestamp.
  const readyAt = new Map<string, string>();
  for (const e of events) {
    if (e.type !== "packet_ready") continue;
    const prev = readyAt.get(e.member_id);
    if (!prev || e.created_at < prev) readyAt.set(e.member_id, e.created_at);
  }

  // helper id -> set of counted invitee ids, and per-day tallies.
  const counted = new Map<string, Set<string>>();
  const perDay = new Map<string, number>(); // `${helperId}:${day}` -> count

  for (const invitee of members) {
    const code = invitee.referred_by_code;
    if (!code) continue;
    const helperId = codeToHelper.get(code);
    if (!helperId) continue; // unknown / invalid code
    if (helperId === invitee.id) continue; // no self-referral (C2)
    if (!byId.has(invitee.id)) continue;
    const ready = readyAt.get(invitee.id);
    if (!ready) continue; // only after packet_ready (C1)

    const set = counted.get(helperId) ?? new Set<string>();
    if (set.has(invitee.id)) continue; // once per invitee (C3)

    const dk = `${helperId}:${dayKey(ready)}`;
    const dayCount = perDay.get(dk) ?? 0;
    if (dayCount >= DAILY_CAP) continue; // daily cap (C4)

    set.add(invitee.id);
    counted.set(helperId, set);
    perDay.set(dk, dayCount + 1);
  }

  const result = new Map<string, number>();
  for (const [helperId, set] of counted) result.set(helperId, set.size);
  return result;
}

export function helpedCount(
  helperId: string,
  members: Member[],
  events: CommunityEvent[],
): number {
  return countReferrals(members, events).get(helperId) ?? 0;
}

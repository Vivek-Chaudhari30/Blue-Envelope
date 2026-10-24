// Pure aggregation. Suppression ("fewer than 10" for 1-9) is applied by the
// API serializer before anything leaves the server; raw counts are used here
// for the per-1000 ranking and are what the property tests sum.

import type {
  Badge,
  CommunityAggregate,
  CommunityEvent,
  CountyAgg,
  Member,
  Town,
  TownAgg,
} from "./types";
import { countReferrals } from "./referral";

export const STATE_GOAL = 360_000;
export const SUPPRESS_MAX = 9;

/** Small-cell suppression: 1..9 -> "fewer than 10", else the number. */
export function suppress(n: number): string {
  return n >= 1 && n <= SUPPRESS_MAX ? "fewer than 10" : String(n);
}

export function badgesFor(helped: number): Badge[] {
  const b: Badge[] = [];
  if (helped >= 1) b.push("neighbor_helper");
  if (helped >= 3) b.push("community_builder");
  if (helped >= 10) b.push("envelope_ambassador");
  return b;
}

/**
 * Compute safe PUBLISHED totals that resist a differencing attack.
 * - Each county total counts ONLY its ranked towns (helped >= 10).
 * - The statewide published total is the true total UNLESS the suppressed
 *   residual (true total minus ranked towns) could isolate a single small town
 *   or a sub-10 group: if fewer than 3 suppressed towns remain OR their combined
 *   helpers are under 10, round the statewide total DOWN to the nearest 10.
 * Returns published numbers plus the safe county list.
 */
export function publishedTotals(agg: CommunityAggregate): {
  statewideHelped: number;
  counties: { county: string; helped: number }[];
} {
  const RANK_MIN = SUPPRESS_MAX + 1; // 10
  const ranked = agg.towns.filter((t) => t.helped >= RANK_MIN);
  const suppressed = agg.towns.filter((t) => t.helped >= 1 && t.helped < RANK_MIN);

  const rankedHelped = ranked.reduce((s, t) => s + t.helped, 0);
  const suppressedHelped = agg.state.helped - rankedHelped;
  const fewTowns = suppressed.length < 3;
  const smallGroup = suppressedHelped < 10;

  const statewideHelped =
    fewTowns || smallGroup
      ? Math.floor(agg.state.helped / 10) * 10
      : agg.state.helped;

  // County totals from ranked towns only.
  const byCounty = new Map<string, number>();
  for (const t of ranked) byCounty.set(t.county, (byCounty.get(t.county) ?? 0) + t.helped);
  const counties = Array.from(byCounty.entries())
    .map(([county, helped]) => ({ county, helped }))
    .filter((c) => c.helped >= RANK_MIN)
    .sort((a, b) => b.helped - a.helped);

  return { statewideHelped, counties };
}

/**
 * Demo overlay: fold THIS device's own recent actions into a board view so the
 * live demo never looks empty without Supabase. `actions` bumps the state
 * action count; a `marked_sent` in `myTypes` from `myTownId` bumps that town's
 * helped display by one. Returns a new view + whether anything was added.
 * This is a display-only courtesy; the authoritative counts come from the server.
 */
export function overlayMyActions(
  board: { state: { actions: number; helped: number; goal: number }; towns: { name: string; county: string; pop2020: number; helped: number }[] },
  myTypes: string[],
  myTownName: string | null,
): { applied: boolean } {
  let applied = false;
  if (myTypes.length > 0) {
    board.state.actions += myTypes.length;
    applied = true;
  }
  if (myTownName && myTypes.includes("marked_sent")) {
    const town = board.towns.find((t) => t.name === myTownName);
    if (town) {
      town.helped += 1;
      applied = true;
    }
  }
  return { applied };
}

/** Fold events + members into per-town / per-county / state aggregates. */
export function aggregate(
  members: Member[],
  events: CommunityEvent[],
  towns: Town[],
): CommunityAggregate {
  const townById = new Map(towns.map((t) => [t.id, t]));
  const memberById = new Map(members.map((m) => [m.id, m]));
  const referrals = countReferrals(members, events);

  // "helped" accrues to the HELPER's town.
  const helpedByTown = new Map<string, number>();
  for (const [helperId, n] of referrals) {
    const town = memberById.get(helperId)?.town_id;
    if (!town) continue;
    helpedByTown.set(town, (helpedByTown.get(town) ?? 0) + n);
  }

  const totalHelped = Array.from(referrals.values()).reduce((s, n) => s + n, 0);
  const totalActions = events.length;

  const townAggs: TownAgg[] = towns
    .map((t) => {
      const helped = helpedByTown.get(t.id) ?? 0;
      return {
        townId: t.id,
        name: t.name,
        county: t.county,
        pop2020: t.pop2020,
        helped,
        perThousand: t.pop2020 > 0 ? (helped / t.pop2020) * 1000 : 0,
      };
    })
    .filter((t) => t.helped > 0)
    .sort((a, b) => b.perThousand - a.perThousand);

  const byCounty = new Map<string, CountyAgg>();
  for (const t of towns) {
    const c = byCounty.get(t.county) ?? { county: t.county, helped: 0, pop2020: 0 };
    c.helped += helpedByTown.get(t.id) ?? 0;
    c.pop2020 += t.pop2020;
    byCounty.set(t.county, c);
  }

  const helpers = members
    .filter((m) => m.display_name_optin && (referrals.get(m.id) ?? 0) > 0)
    .map((m) => ({
      firstName: m.display_name_optin!.firstName,
      lastInitial: "",
      town: townById.get(m.town_id ?? "")?.name ?? "",
      helped: referrals.get(m.id) ?? 0,
    }))
    .sort((a, b) => b.helped - a.helped);

  return {
    state: { actions: totalActions, helped: totalHelped, goal: STATE_GOAL },
    towns: townAggs,
    counties: Array.from(byCounty.values())
      .filter((c) => c.helped > 0)
      .sort((a, b) => b.helped - a.helped),
    helpers,
  };
}

import { NextResponse } from "next/server";
import { getCommunityStore } from "@/lib/community/store";
import { aggregate, suppress, SUPPRESS_MAX } from "@/lib/community/aggregate";
import { rateLimited, clientIp } from "@/lib/community/ratelimit";
import towns from "@/lib/community/towns.json";
import type { Town } from "@/lib/community/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (rateLimited(clientIp(req), 60)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const store = getCommunityStore();
  const [members, events] = await Promise.all([store.allMembers(), store.allEvents()]);
  const agg = aggregate(members, events, towns as Town[]);

  // Privacy: a town with a suppressed count (1-9) must expose NO numeric field
  // from which the count can be recovered — NOT perThousand, NOT pop2020, NOT
  // the count. Only towns with count >= 10 are ranked with numbers; the rest
  // are listed alphabetically under "Getting started" with no numbers at all.
  const ranked = agg.towns
    .filter((t) => t.helped > SUPPRESS_MAX)
    .map((t) => ({
      name: t.name,
      county: t.county,
      helped: t.helped,
      perThousand: Math.round(t.perThousand * 1000) / 1000,
    }));

  const gettingStarted = agg.towns
    .filter((t) => t.helped >= 1 && t.helped <= SUPPRESS_MAX)
    .map((t) => ({ name: t.name, county: t.county })) // NO numeric fields
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    state: { actions: agg.state.actions, helped: agg.state.helped, goal: agg.state.goal },
    ranked,
    gettingStarted,
    counties: agg.counties.map((c) =>
      c.helped > SUPPRESS_MAX
        ? { county: c.county, helped: c.helped }
        : { county: c.county, helpedDisplay: suppress(c.helped) },
    ),
    helpers: agg.helpers.map((h) => ({
      firstName: h.firstName,
      lastInitial: h.lastInitial,
      town: h.town,
      helpedDisplay: suppress(h.helped),
    })),
    demo: true,
  });
}

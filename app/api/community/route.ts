import { NextResponse } from "next/server";
import { getCommunityStore } from "@/lib/community/store";
import { aggregate, suppress } from "@/lib/community/aggregate";
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

  // Serialize with small-cell suppression applied BEFORE anything leaves the
  // server. Raw counts (helped) are replaced by suppressed display strings.
  // No member id, phone, address or answer is included.
  return NextResponse.json({
    state: { actions: agg.state.actions, helped: agg.state.helped, goal: agg.state.goal },
    towns: agg.towns.map((t) => ({
      name: t.name,
      county: t.county,
      pop2020: t.pop2020,
      helpedDisplay: suppress(t.helped),
      perThousand: Math.round(t.perThousand * 1000) / 1000,
    })),
    counties: agg.counties.map((c) => ({
      county: c.county,
      helpedDisplay: suppress(c.helped),
    })),
    helpers: agg.helpers.map((h) => ({
      firstName: h.firstName,
      lastInitial: h.lastInitial,
      town: h.town,
      helpedDisplay: suppress(h.helped),
    })),
    demo: true,
  });
}

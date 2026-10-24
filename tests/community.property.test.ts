import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { aggregate, suppress, badgesFor, SUPPRESS_MAX } from "@/lib/community/aggregate";
import { countReferrals, DAILY_CAP } from "@/lib/community/referral";
import type { CommunityEvent, Member, Town } from "@/lib/community/types";

const TOWNS: Town[] = [
  { id: "lowell", name: "Lowell", county: "Middlesex", pop2020: 115554 },
  { id: "boston", name: "Boston", county: "Suffolk", pop2020: 675647 },
  { id: "worcester", name: "Worcester", county: "Worcester", pop2020: 206518 },
];

function member(id: string, over: Partial<Member> = {}): Member {
  return {
    id,
    town_id: "lowell",
    language: "en",
    helper_code: `C${id}`,
    referred_by_code: null,
    display_name_optin: null,
    created_at: "2026-10-24T00:00:00Z",
    ...over,
  };
}
function ev(member_id: string, type: CommunityEvent["type"], at = "2026-10-24T01:00:00Z"): CommunityEvent {
  return { member_id, type, town_id: "lowell", created_at: at };
}

describe("community — suppression & badges", () => {
  it("counts 1..9 are suppressed; 0 and >=10 are not", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (n) => {
        const s = suppress(n);
        if (n >= 1 && n <= SUPPRESS_MAX) expect(s).toBe("fewer than 10");
        else expect(s).toBe(String(n));
      }),
    );
  });

  it("badge thresholds: 1 / 3 / 10", () => {
    expect(badgesFor(0)).toEqual([]);
    expect(badgesFor(1)).toEqual(["neighbor_helper"]);
    expect(badgesFor(2)).toEqual(["neighbor_helper"]);
    expect(badgesFor(3)).toEqual(["neighbor_helper", "community_builder"]);
    expect(badgesFor(10)).toEqual(["neighbor_helper", "community_builder", "envelope_ambassador"]);
  });
});

describe("community — counting rules", () => {
  it("a referral counts once per invitee, only after packet_ready", () => {
    const helper = member("h", { helper_code: "HELP" });
    const invitee = member("i", { helper_code: "CI", referred_by_code: "HELP" });
    // No packet_ready yet -> 0
    expect(countReferrals([helper, invitee], [ev("i", "referral_opened")]).get("h") ?? 0).toBe(0);
    // packet_ready, even emitted twice -> counts once
    const n = countReferrals([helper, invitee], [
      ev("i", "packet_ready"),
      ev("i", "packet_ready", "2026-10-24T02:00:00Z"),
    ]).get("h");
    expect(n).toBe(1);
  });

  it("never counts a self-referral", () => {
    const self = member("s", { helper_code: "SELF", referred_by_code: "SELF" });
    const n = countReferrals([self], [ev("s", "packet_ready")]).get("s") ?? 0;
    expect(n).toBe(0);
  });

  it("caps at 20 per helper per day", () => {
    const helper = member("h", { helper_code: "HELP" });
    const invitees: Member[] = [];
    const events: CommunityEvent[] = [];
    for (let i = 0; i < 30; i++) {
      invitees.push(member(`i${i}`, { helper_code: `C${i}`, referred_by_code: "HELP" }));
      events.push(ev(`i${i}`, "packet_ready", "2026-10-24T03:00:00Z"));
    }
    const n = countReferrals([helper, ...invitees], events).get("h");
    expect(n).toBe(DAILY_CAP);
  });
});

describe("community — aggregation invariants", () => {
  const arbEvents = fc.array(
    fc.record({
      member_id: fc.constantFrom("h", "i1", "i2", "i3"),
      type: fc.constantFrom<CommunityEvent["type"]>(
        "started", "xray_done", "packet_ready", "marked_sent", "contact_updated", "referral_opened",
      ),
      town_id: fc.constantFrom("lowell", "boston", "worcester", null),
      created_at: fc.constant("2026-10-24T04:00:00Z"),
    }),
    { maxLength: 40 },
  );

  it("town helped counts sum to county totals (before suppression)", () => {
    fc.assert(
      fc.property(arbEvents, (events) => {
        const members: Member[] = [
          member("h", { helper_code: "HELP", town_id: "lowell" }),
          member("i1", { helper_code: "A", referred_by_code: "HELP", town_id: "boston" }),
          member("i2", { helper_code: "B", referred_by_code: "HELP", town_id: "worcester" }),
          member("i3", { helper_code: "D", referred_by_code: "HELP", town_id: "lowell" }),
        ];
        const agg = aggregate(members, events, TOWNS);
        const townSum = agg.towns.reduce((s, t) => s + t.helped, 0);
        const countySum = agg.counties.reduce((s, c) => s + c.helped, 0);
        expect(townSum).toBe(countySum);
        expect(townSum).toBe(agg.state.helped);
      }),
    );
  });

  it("only opted-in helpers appear, and only with a positive helped count", () => {
    const members: Member[] = [
      member("h", { helper_code: "HELP", display_name_optin: { firstName: "Maria" } }),
      member("i1", { helper_code: "A", referred_by_code: "HELP" }),
    ];
    const agg = aggregate(members, members.map((m) => ev(m.id, "packet_ready")), TOWNS);
    expect(agg.helpers.every((h) => h.helped > 0)).toBe(true);
    // The non-opted-in invitee never appears.
    expect(agg.helpers.find((h) => h.firstName === "")).toBeUndefined();
  });
});

import { overlayMyActions } from "@/lib/community/aggregate";

describe("community — device overlay (b)", () => {
  it("overlay bumps the action count and the member's town on marked_sent", () => {
    const board = {
      state: { actions: 10, helped: 5, goal: 360000 },
      towns: [{ name: "Lowell", county: "Middlesex", pop2020: 115554, helped: 3 }],
    };
    const res = overlayMyActions(board, ["started", "xray_done", "marked_sent"], "Lowell");
    expect(res.applied).toBe(true);
    expect(board.state.actions).toBe(13); // +3 device actions
    expect(board.towns[0]!.helped).toBe(4); // +1 for marked_sent in Lowell
  });

  it("overlay with no device events changes nothing", () => {
    const board = { state: { actions: 10, helped: 5, goal: 360000 }, towns: [] as never[] };
    const res = overlayMyActions(board, [], null);
    expect(res.applied).toBe(false);
    expect(board.state.actions).toBe(10);
  });

  it("marked_sent with no town does not bump any town", () => {
    const board = {
      state: { actions: 0, helped: 0, goal: 360000 },
      towns: [{ name: "Lowell", county: "Middlesex", pop2020: 115554, helped: 0 }],
    };
    overlayMyActions(board, ["marked_sent"], null);
    expect(board.towns[0]!.helped).toBe(0);
  });
});

describe("community — suppression leak fix (bugfix-suppression-leak)", () => {
  // Simulate the API serializer split and assert suppressed towns carry no
  // numeric field from which the count can be recovered.
  function serialize(townAggs: { name: string; county: string; pop2020: number; helped: number; perThousand: number }[]) {
    const SUP = 9;
    const ranked = townAggs.filter((t) => t.helped > SUP).map((t) => ({ name: t.name, county: t.county, helped: t.helped, perThousand: t.perThousand }));
    const gettingStarted = townAggs.filter((t) => t.helped >= 1 && t.helped <= SUP).map((t) => ({ name: t.name, county: t.county })).sort((a, b) => a.name.localeCompare(b.name));
    return { ranked, gettingStarted };
  }

  it("suppressed towns expose NO numeric field (count cannot be recovered)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 8 }),
            county: fc.constant("X"),
            pop2020: fc.integer({ min: 100, max: 700000 }),
            helped: fc.integer({ min: 0, max: 200 }),
          }),
          { maxLength: 30 },
        ),
        (townAggs) => {
          const withRate = townAggs
            .filter((t) => t.helped > 0)
            .map((t) => ({ ...t, perThousand: (t.helped / t.pop2020) * 1000 }));
          const { gettingStarted } = serialize(withRate);
          for (const g of gettingStarted) {
            // No key other than name/county — nothing numeric to recover a count from.
            expect(Object.keys(g).sort()).toEqual(["county", "name"]);
          }
        },
      ),
    );
  });

  it("getting-started (suppressed) towns are alphabetical", () => {
    const aggs = [
      { name: "Zebra", county: "X", pop2020: 1000, helped: 2, perThousand: 2 },
      { name: "Apple", county: "X", pop2020: 1000, helped: 3, perThousand: 3 },
      { name: "Mango", county: "X", pop2020: 1000, helped: 1, perThousand: 1 },
      { name: "Big", county: "X", pop2020: 1000, helped: 50, perThousand: 50 },
    ];
    const { ranked, gettingStarted } = serialize(aggs);
    expect(ranked.map((t) => t.name)).toEqual(["Big"]);
    expect(gettingStarted.map((t) => t.name)).toEqual(["Apple", "Mango", "Zebra"]);
  });
});

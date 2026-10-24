// CommunityStore: Supabase when env is present, else a process-local demo
// store seeded from scripts/seed-community.ts output. Server-only.

import type { CommunityEvent, CommunityStore, Member } from "./types";
import type { Lang } from "@/lib/i18n";
import { makeHelperCode } from "./helper-code";

function uuid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "m-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- Demo adapter (process-local). Seed data is loaded lazily if present. ----
class DemoStore implements CommunityStore {
  private members: Member[] = [];
  private events: CommunityEvent[] = [];
  private seeded = false;

  private ensureSeed() {
    if (this.seeded) return;
    this.seeded = true;
    try {
      // Optional seed produced by scripts/seed-community.ts.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const seed = require("./seed-data.json") as {
        members: Member[];
        events: CommunityEvent[];
      };
      this.members = [...seed.members];
      this.events = [...seed.events];
    } catch {
      /* no seed file — start empty */
    }
  }

  async createMember(input: {
    town_id: string | null;
    language: Lang;
    referred_by_code: string | null;
  }): Promise<Member> {
    this.ensureSeed();
    const m: Member = {
      id: uuid(),
      town_id: input.town_id,
      language: input.language,
      helper_code: this.uniqueCode(),
      referred_by_code: input.referred_by_code,
      display_name_optin: null,
      created_at: new Date().toISOString(),
    };
    this.members.push(m);
    return m;
  }
  private uniqueCode(): string {
    let c = makeHelperCode();
    while (this.members.some((m) => m.helper_code === c)) c = makeHelperCode();
    return c;
  }
  async getMemberByCode(code: string) {
    this.ensureSeed();
    return this.members.find((m) => m.helper_code === code) ?? null;
  }
  async getMember(id: string) {
    this.ensureSeed();
    return this.members.find((m) => m.id === id) ?? null;
  }
  async setOptin(id: string, optin: { firstName: string } | null) {
    const m = await this.getMember(id);
    if (m) m.display_name_optin = optin;
  }
  async setTown(id: string, townId: string | null) {
    const m = await this.getMember(id);
    if (m) m.town_id = townId;
  }
  async addEvent(e: CommunityEvent) {
    this.ensureSeed();
    this.events.push(e);
  }
  async allEvents() {
    this.ensureSeed();
    return this.events;
  }
  async allMembers() {
    this.ensureSeed();
    return this.members;
  }
}

let demo: DemoStore | null = null;

export function usingSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getCommunityStore(): CommunityStore {
  if (usingSupabase()) {
    // Supabase adapter is created lazily to avoid importing the client when
    // unused. The demo adapter is the committed default for the hackathon.
    return getSupabaseStore();
  }
  if (!demo) demo = new DemoStore();
  return demo;
}

// --- Supabase adapter (REST, server-only). Tables: members, events. ---
function getSupabaseStore(): CommunityStore {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const rest = (path: string) => `${url}/rest/v1/${path}`;

  return {
    async createMember(input) {
      const m: Member = {
        id: uuid(),
        town_id: input.town_id,
        language: input.language,
        helper_code: makeHelperCode(),
        referred_by_code: input.referred_by_code,
        display_name_optin: null,
        created_at: new Date().toISOString(),
      };
      await fetch(rest("members"), { method: "POST", headers, body: JSON.stringify(m) });
      return m;
    },
    async getMemberByCode(code) {
      const r = await fetch(rest(`members?helper_code=eq.${encodeURIComponent(code)}&limit=1`), { headers });
      const rows = (await r.json()) as Member[];
      return rows[0] ?? null;
    },
    async getMember(id) {
      const r = await fetch(rest(`members?id=eq.${encodeURIComponent(id)}&limit=1`), { headers });
      const rows = (await r.json()) as Member[];
      return rows[0] ?? null;
    },
    async setOptin(id, optin) {
      await fetch(rest(`members?id=eq.${encodeURIComponent(id)}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ display_name_optin: optin }),
      });
    },
    async setTown(id, townId) {
      await fetch(rest(`members?id=eq.${encodeURIComponent(id)}`), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ town_id: townId }),
      });
    },
    async addEvent(e) {
      await fetch(rest("events"), { method: "POST", headers, body: JSON.stringify(e) });
    },
    async allEvents() {
      const r = await fetch(rest("events?select=*"), { headers });
      return (await r.json()) as CommunityEvent[];
    },
    async allMembers() {
      const r = await fetch(rest("members?select=*"), { headers });
      return (await r.json()) as Member[];
    },
  };
}

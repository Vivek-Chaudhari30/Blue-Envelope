// RedisStore — Upstash Redis REST adapter. Used when both
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
// Server-side only (route handlers / server components).

import {
  projectForViewer,
  type Packet,
  type PacketStore,
  type PartnerView,
  type Viewer,
} from "./types";

const PREFIX = "be:packet:";

export class RedisStore implements PacketStore {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async cmd(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash error ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return json.result;
  }

  async get(id: string): Promise<Packet | null> {
    const raw = (await this.cmd(["GET", PREFIX + id])) as string | null;
    return raw ? (JSON.parse(raw) as Packet) : null;
  }

  async put(p: Packet): Promise<void> {
    await this.cmd(["SET", PREFIX + p.id, JSON.stringify(p)]);
  }

  async readForViewer(
    id: string,
    viewer: Viewer,
  ): Promise<Packet | PartnerView | null> {
    const p = await this.get(id);
    if (!p) return null;
    return projectForViewer(p, viewer);
  }

  async share(id: string, viewerId: string): Promise<void> {
    const p = await this.get(id);
    if (!p) return;
    if (!p.sharedWith.includes(viewerId)) p.sharedWith.push(viewerId);
    await this.put(p);
  }

  async revoke(id: string, viewerId: string): Promise<void> {
    const p = await this.get(id);
    if (!p) return;
    p.sharedWith = p.sharedWith.filter((v) => v !== viewerId);
    await this.put(p);
  }

  async confirmPartner(id: string, hours: number): Promise<void> {
    const p = await this.get(id);
    if (!p) return;
    p.partner = "confirmed";
    p.hours = hours;
    await this.put(p);
  }
}

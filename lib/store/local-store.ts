// LocalStore — same-browser localStorage adapter (demo default).
// Falls back to an in-memory map when localStorage is unavailable (SSR / tests).

import {
  projectForViewer,
  type Packet,
  type PacketStore,
  type PartnerView,
  type Viewer,
} from "./types";

const PREFIX = "be:packet:";

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export class LocalStore implements PacketStore {
  private mem = new Map<string, Packet>();

  private read(id: string): Packet | null {
    if (hasLocalStorage()) {
      const raw = window.localStorage.getItem(PREFIX + id);
      return raw ? (JSON.parse(raw) as Packet) : null;
    }
    return this.mem.get(id) ?? null;
  }

  private write(p: Packet): void {
    if (hasLocalStorage()) {
      window.localStorage.setItem(PREFIX + p.id, JSON.stringify(p));
    } else {
      this.mem.set(p.id, p);
    }
  }

  async get(id: string): Promise<Packet | null> {
    return this.read(id);
  }

  async put(p: Packet): Promise<void> {
    this.write(p);
  }

  async readForViewer(
    id: string,
    viewer: Viewer,
  ): Promise<Packet | PartnerView | null> {
    const p = this.read(id);
    if (!p) return null;
    return projectForViewer(p, viewer);
  }

  async share(id: string, viewerId: string): Promise<void> {
    const p = this.read(id);
    if (!p) return;
    if (!p.sharedWith.includes(viewerId)) p.sharedWith.push(viewerId);
    this.write(p);
  }

  async revoke(id: string, viewerId: string): Promise<void> {
    const p = this.read(id);
    if (!p) return;
    p.sharedWith = p.sharedWith.filter((v) => v !== viewerId);
    this.write(p);
  }

  async confirmPartner(id: string, hours: number): Promise<void> {
    const p = this.read(id);
    if (!p) return;
    p.partner = "confirmed";
    p.hours = hours;
    this.write(p);
  }
}

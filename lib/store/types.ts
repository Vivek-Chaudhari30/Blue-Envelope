// PacketStore types. The member owns the packet; every navigator/partner read
// goes through readForViewer, which enforces consent. See
// .kiro/steering/consent-privacy.md and .kiro/specs/coordination.

export type PacketStatus =
  | "not_started"
  | "notice_received"
  | "proof_gathered"
  | "submitted";

export interface Packet {
  id: string;
  firstName: string;
  status: PacketStatus;
  /** Viewer ids with recorded, un-revoked consent. Empty = private. */
  sharedWith: string[];
  // Partner-relevant fields.
  organization?: string;
  month?: string;
  hours?: number;
  /** Partner sign-off state. */
  partner?: "none" | "sent" | "confirmed";
  // Navigator-only (full) contents, shown only behind consent.
  earningsTotal?: number;
  path?: string;
}

export type Viewer = { kind: "navigator" | "partner"; id: string };

/** The ONLY shape a partner viewer ever sees (consent-privacy C4). */
export interface PartnerView {
  firstName: string;
  organization: string;
  month: string;
  hours?: number;
}

export interface PacketStore {
  /** Owner/internal read — not consent-gated. Never called from a viewer page. */
  get(id: string): Promise<Packet | null>;
  put(p: Packet): Promise<void>;
  /** Consent gate: null unless the viewer has consent; partners get PartnerView. */
  readForViewer(
    id: string,
    viewer: Viewer,
  ): Promise<Packet | PartnerView | null>;
  share(id: string, viewerId: string): Promise<void>;
  revoke(id: string, viewerId: string): Promise<void>;
  /** Partner confirms hours; sets partner='confirmed' and records the hours. */
  confirmPartner(id: string, hours: number): Promise<void>;
}

/** Shared consent gate used by every adapter's readForViewer. */
export function projectForViewer(
  packet: Packet,
  viewer: Viewer,
): Packet | PartnerView | null {
  if (!packet.sharedWith.includes(viewer.id)) return null;
  if (viewer.kind === "partner") {
    return {
      firstName: packet.firstName,
      organization: packet.organization ?? "",
      month: packet.month ?? "",
      hours: packet.hours,
    };
  }
  return packet;
}

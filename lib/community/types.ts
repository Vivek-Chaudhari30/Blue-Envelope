// Community + referrals types. All data synthetic / demo-labeled.

import type { Lang } from "@/lib/i18n";

export type EventType =
  | "started"
  | "xray_done"
  | "packet_ready"
  | "marked_sent"
  | "contact_updated"
  | "referral_opened";

export interface Town {
  id: string; // e.g. "lowell"
  name: string;
  county: string;
  pop2020: number;
}

export interface Member {
  id: string; // random uuid
  town_id: string | null;
  language: Lang;
  helper_code: string; // short random unique
  referred_by_code: string | null;
  display_name_optin: { firstName: string } | null;
  created_at: string;
}

export interface CommunityEvent {
  member_id: string;
  type: EventType;
  town_id: string | null;
  created_at: string;
}

export type Badge = "neighbor_helper" | "community_builder" | "envelope_ambassador";

export interface TownAgg {
  townId: string;
  name: string;
  county: string;
  pop2020: number;
  helped: number;
  perThousand: number;
}

export interface CountyAgg {
  county: string;
  helped: number;
  pop2020: number;
}

export interface CommunityAggregate {
  state: { actions: number; helped: number; goal: number };
  towns: TownAgg[];
  counties: CountyAgg[];
  helpers: { firstName: string; lastInitial: string; town: string; helped: number }[];
}

export interface CommunityStore {
  createMember(input: {
    town_id: string | null;
    language: Lang;
    referred_by_code: string | null;
  }): Promise<Member>;
  getMemberByCode(code: string): Promise<Member | null>;
  getMember(id: string): Promise<Member | null>;
  setOptin(id: string, optin: { firstName: string } | null): Promise<void>;
  setTown(id: string, townId: string | null): Promise<void>;
  addEvent(e: CommunityEvent): Promise<void>;
  allEvents(): Promise<CommunityEvent[]>;
  allMembers(): Promise<Member[]>;
}

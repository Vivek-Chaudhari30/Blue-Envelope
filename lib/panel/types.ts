// Navigator panel types. All data is SYNTHETIC.

import type { Lang } from "@/lib/i18n";

export type PanelStatus =
  | "not_started"
  | "notice_received"
  | "proof_gathered"
  | "submitted";

export interface Patient {
  id: string;
  firstName: string;
  lastInitial: string;
  language: Lang;
  /** ISO date of the renewal deadline. */
  renewalDue: string;
  status: PanelStatus;
  /** ISO date of the next medication refill, if any. */
  nextRefill?: string;
  /** ISO date of the next appointment, if any. */
  nextAppointment?: string;
  /** ISO date contact details were last updated. */
  contactUpdatedOn: string;
  /** Whether the member has shared their packet with the health center. */
  sharedPacket: boolean;
}

export const STATUS_ORDER: PanelStatus[] = [
  "not_started",
  "notice_received",
  "proof_gathered",
  "submitted",
];

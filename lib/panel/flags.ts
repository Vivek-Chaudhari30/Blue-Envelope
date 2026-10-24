// Pure flag logic for the Navigator Board. All functions take `now` so the
// property tests (RULES_SOURCE.md §4 properties 12-13) are deterministic.

import type { Patient } from "./types";

const DAY = 86_400_000;

export function daysUntil(isoDate: string, now: number): number {
  return Math.ceil((new Date(isoDate).getTime() - now) / DAY);
}

/** Contact updated more than 12 months (365 days) ago. */
export function staleContact(patient: Patient, now: number): boolean {
  return daysUntil(patient.contactUpdatedOn, now) < -365;
}

/**
 * Property 13: a refill or appointment after the renewal deadline AND status
 * not submitted => continuity risk.
 */
export function continuityFlag(patient: Patient, now: number): boolean {
  void now; // signature kept uniform with other flags; continuity uses the deadline only
  if (patient.status === "submitted") return false;
  const due = new Date(patient.renewalDue).getTime();
  const refillAfter =
    patient.nextRefill !== undefined &&
    new Date(patient.nextRefill).getTime() > due;
  const apptAfter =
    patient.nextAppointment !== undefined &&
    new Date(patient.nextAppointment).getTime() > due;
  return refillAfter || apptAfter;
}

/**
 * Property 12: deadline <= 14 days away AND packet incomplete
 * (not submitted and not proof_gathered) => act-now queue.
 */
export function actNow(patient: Patient, now: number): boolean {
  const incomplete =
    patient.status !== "submitted" && patient.status !== "proof_gathered";
  const d = daysUntil(patient.renewalDue, now);
  return incomplete && d <= 14;
}

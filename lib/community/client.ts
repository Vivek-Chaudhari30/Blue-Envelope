"use client";

import type { EventType } from "./types";
import type { Lang } from "@/lib/i18n";

const ID_KEY = "be:member:id";
const CODE_KEY = "be:member:code";
const REF_KEY = "be:member:ref"; // pending referred_by_code from a /r link
const TOWN_KEY = "be:member:town";

function ls(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function captureReferral(code: string): void {
  ls()?.setItem(REF_KEY, code);
}
export function getHelperCode(): string | null {
  return ls()?.getItem(CODE_KEY) ?? null;
}
export function getMemberId(): string | null {
  return ls()?.getItem(ID_KEY) ?? null;
}
export function getTown(): string | null {
  return ls()?.getItem(TOWN_KEY) ?? null;
}
export function setTownLocal(townId: string | null): void {
  const s = ls();
  if (!s) return;
  if (townId) s.setItem(TOWN_KEY, townId);
  else s.removeItem(TOWN_KEY);
}

/** Ensure a member exists (creates one on the server on first call). */
export async function ensureMember(lang: Lang): Promise<string | null> {
  const s = ls();
  if (!s) return null;
  const existing = s.getItem(ID_KEY);
  if (existing) return existing;
  const referred_by_code = s.getItem(REF_KEY);
  try {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ town_id: s.getItem(TOWN_KEY), language: lang, referred_by_code }),
    });
    const data = (await res.json()) as { id: string; helper_code: string };
    s.setItem(ID_KEY, data.id);
    s.setItem(CODE_KEY, data.helper_code);
    s.removeItem(REF_KEY);
    return data.id;
  } catch {
    return null;
  }
}

export async function logEvent(
  lang: Lang,
  type: EventType,
  extra: { optin?: { firstName: string } | null; set_town?: string | null } = {},
): Promise<void> {
  const id = (await ensureMember(lang)) ?? getMemberId();
  if (!id) return;
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: id, type, town_id: getTown(), ...extra }),
    });
  } catch {
    /* best-effort; the app never blocks on this */
  }
}

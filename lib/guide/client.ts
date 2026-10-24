"use client";

import { redact } from "@/lib/readers/redact";
import type { GuideReason, GuideResponse } from "./schema";

/** Small non-crypto hash for the device cache key. */
function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const CACHE_PREFIX = "be:guide:";

function cacheGet(key: string): GuideResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as GuideResponse) : null;
  } catch {
    return null;
  }
}

function cacheSet(key: string, value: GuideResponse): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export interface AskGuideArgs {
  reason: GuideReason;
  /** Raw text — redacted here before it leaves the device. */
  text: string;
  lang: string;
  question?: string;
  rulesSummary?: string;
  lineIds?: string[];
}

/**
 * Ask the Luna guide. Redacts on the device, caches by a hash of the REDACTED
 * text, and never sends an image. Returns the sample fallback on any failure.
 */
export async function askGuide(args: AskGuideArgs): Promise<GuideResponse> {
  const redacted = redact(args.text).text;
  const key = hash(`${args.reason}:${args.lang}:${redacted}:${args.question ?? ""}`);

  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const res = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: args.reason,
        text: redacted,
        lang: args.lang,
        question: args.question,
        rulesSummary: args.rulesSummary,
        lineIds: args.lineIds,
      }),
    });
    const data = (await res.json()) as GuideResponse;
    cacheSet(key, data);
    return data;
  } catch {
    return { reason: args.reason, grounded: false, fallback: true, note: "Offline; showing the sample." };
  }
}

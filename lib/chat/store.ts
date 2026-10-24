"use client";

// Device-only persistence for the letter chat and extracted values.
// Everything lives under localStorage; clearLetter() wipes it all (D2).
// Nothing here ever leaves the device.

import type { ChatTurn, ExtractedValues, LetterState } from "./types";

const TURNS_KEY = "be:letter:turns";
const VALUES_KEY = "be:letter:values";
const PHOTO_KEY = "be:letter:photo";
const OCR_KEY = "be:letter:ocr";
// Prefixes cleared wholesale on delete.
const LETTER_PREFIX = "be:letter:";
const GUIDE_PREFIX = "be:guide:";

function ls(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  const s = ls();
  if (!s) return fallback;
  const raw = s.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  ls()?.setItem(key, JSON.stringify(value));
}

export function loadTurns(): ChatTurn[] {
  return readJson<ChatTurn[]>(TURNS_KEY, []);
}
export function saveTurns(turns: ChatTurn[]): void {
  writeJson(TURNS_KEY, turns);
}
export function loadValues(): ExtractedValues {
  return readJson<ExtractedValues>(VALUES_KEY, {});
}
export function saveValues(values: ExtractedValues): void {
  writeJson(VALUES_KEY, values);
}
export function loadLetter(): LetterState {
  return { turns: loadTurns(), values: loadValues() };
}

export { PHOTO_KEY, OCR_KEY };

/** How many questions have been asked for this letter (cap at 5 — A6). */
export function userQuestionCount(turns: ChatTurn[]): number {
  return turns.filter((t) => t.role === "user").length;
}

/**
 * D2: clear the photo, OCR text, chat and extracted values from memory and
 * localStorage. Removes every be:letter:* and be:guide:* key.
 */
export function clearLetter(): void {
  const s = ls();
  if (!s) return;
  const toRemove: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k && (k.startsWith(LETTER_PREFIX) || k.startsWith(GUIDE_PREFIX))) {
      toRemove.push(k);
    }
  }
  for (const k of toRemove) s.removeItem(k);
}

/** True when no letter/chat/guide key remains (used by the delete property test). */
export function hasAnyLetterKey(): boolean {
  const s = ls();
  if (!s) return false;
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k && (k.startsWith(LETTER_PREFIX) || k.startsWith(GUIDE_PREFIX))) {
      return true;
    }
  }
  return false;
}

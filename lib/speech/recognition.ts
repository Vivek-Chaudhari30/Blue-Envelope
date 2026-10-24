"use client";

// Thin wrapper over the browser SpeechRecognition / webkitSpeechRecognition.
// Feature-detected: if unsupported, isSupported() is false and the caller hides
// the mic. No audio is stored — the browser turns speech into text.

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function Ctor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSupported(): boolean {
  return Ctor() !== null;
}

export interface Recognizer {
  stop: () => void;
}

/** Start listening; onText fires with the recognized transcript, onEnd when done. */
export function listen(
  speechCode: string,
  onText: (text: string) => void,
  onEnd: () => void,
): Recognizer | null {
  const C = Ctor();
  if (!C) return null;
  const rec = new C();
  rec.lang = speechCode;
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (e) => {
    const first = e.results[0];
    const alt = first && first[0];
    if (alt) onText(alt.transcript);
  };
  rec.onerror = () => onEnd();
  rec.onend = () => onEnd();
  rec.start();
  return { stop: () => rec.stop() };
}

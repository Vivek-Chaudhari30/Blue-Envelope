"use client";

import { t, speechCode, type Lang } from "@/lib/i18n";

/** Read an answer aloud with the browser speech synthesizer. */
export function ReadAloud({ lang, text }: { lang: Lang; text: string }) {
  function speak() {
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechCode(lang);
      window.speechSynthesis.speak(u);
    } catch {
      /* no voice available — silently ignore */
    }
  }
  return (
    <button type="button" className="btn secondary small" onClick={speak}>
      🔊 {t("read_answer", lang)}
    </button>
  );
}

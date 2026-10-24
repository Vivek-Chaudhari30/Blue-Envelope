"use client";

import { useRef, useState } from "react";
import { t, speechCode, type Lang } from "@/lib/i18n";
import { isSupported, listen, type Recognizer } from "@/lib/speech/recognition";

/** Speech-to-text mic. Hidden when unsupported; typing always works. */
export function Mic({
  lang,
  onText,
}: {
  lang: Lang;
  onText: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognizer | null>(null);

  if (!isSupported()) return null;

  function start() {
    setListening(true);
    recRef.current = listen(
      speechCode(lang),
      (text) => onText(text),
      () => setListening(false),
    );
  }
  function stop() {
    recRef.current?.stop();
    setListening(false);
  }

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <button
        type="button"
        className="btn secondary small"
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        {listening ? `⏹ ${t("mic_stop", lang)}` : `🎤 ${t("mic_start", lang)}`}
      </button>
      {listening && <span className="sub" style={{ fontSize: ".8rem" }}>{t("mic_listening", lang)}</span>}
      <span className="sub" style={{ fontSize: ".75rem" }}>{t("mic_note", lang)}</span>
    </div>
  );
}

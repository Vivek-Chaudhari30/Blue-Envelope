"use client";

import { useState } from "react";
import { useFlow } from "./FlowContext";
import { Button, Pill } from "@/components/ui";
import { t, speechCode, type MessageKey } from "@/lib/i18n";
import { daysLeft } from "@/lib/deadline";
import { SAMPLE_LETTER } from "@/content/sample-letter";

const CALLOUTS: {
  pin: 1 | 2 | 3 | 4;
  due: boolean;
  labelKey: MessageKey;
  bodyKey: MessageKey;
}[] = [
  { pin: 1, due: true, labelKey: "deadline", bodyKey: "e_deadline" },
  { pin: 2, due: false, labelKey: "asking", bodyKey: "e_asking" },
  { pin: 3, due: false, labelKey: "send", bodyKey: "e_send" },
  { pin: 4, due: false, labelKey: "how", bodyKey: "e_how" },
];

export function LetterXRay() {
  const { state, dispatch } = useFlow();
  const L = state.lang;
  const [speechNote, setSpeechNote] = useState<string | null>(null);

  function readAloud() {
    const text = CALLOUTS.map((c) => `${t(c.labelKey, L)}. ${t(c.bodyKey, L)}`).join(". ");
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        throw new Error("none");
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechCode(L);
      window.speechSynthesis.speak(u);
      setSpeechNote(t("read_aloud_working", L));
    } catch {
      setSpeechNote(t("read_aloud_unavailable", L));
    }
  }

  return (
    <>
      <div>
        <span className="label">{t("xray_label", L)}</span>
        <h2 className="title">{t("xray_title", L)}</h2>
      </div>

      {state.letterPhoto && (
        <div className="card photo-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.letterPhoto} alt="Your letter photo" />
          <p className="sub" style={{ fontSize: ".875rem" }}>
            {t("photo_got", L)}
          </p>
        </div>
      )}

      <div className="letter" aria-label="Sample renewal letter">
        <div className="head">
          <span>{SAMPLE_LETTER.header}</span>
          <span>{SAMPLE_LETTER.headerTag}</span>
        </div>
        <div className="meta">
          {SAMPLE_LETTER.meta[0]}
          <br />
          {SAMPLE_LETTER.meta[1]}
        </div>
        <p>{SAMPLE_LETTER.greeting}</p>
        <p>{SAMPLE_LETTER.intro}</p>
        {SAMPLE_LETTER.lines.map((line, i) => {
          const h = line.highlight!;
          return (
            <p key={i}>
              {h.before}
              <span className={`hl ${h.due ? "due" : ""}`}>
                <span className={`pin ${h.due ? "due" : ""}`}>{h.pin}</span>
                {h.mark}
              </span>
              {h.after}
            </p>
          );
        })}
      </div>

      <div className="callouts" lang={L}>
        {CALLOUTS.map((c) => (
          <div key={c.pin} className={`callout ${c.due ? "due" : ""}`}>
            <span className={`pin ${c.due ? "due" : ""}`}>{c.pin}</span>
            <b>
              {t(c.labelKey, L)}{" "}
              {c.pin === 1 && <Pill tone="due">{t("days_left", L, { n: daysLeft() })}</Pill>}
            </b>
            <p>{t(c.bodyKey, L)}</p>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={readAloud}>
        {t("read_aloud", L)}
      </Button>
      {speechNote && <p className="note">{speechNote}</p>}

      <Button onClick={() => dispatch({ type: "go", step: "questions" })}>
        {t("check_applies", L)}
      </Button>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFlow } from "./FlowContext";
import { Button, Pill } from "@/components/ui";
import { HelpButton } from "./HelpButton";
import { t, speechCode, type MessageKey } from "@/lib/i18n";
import { daysLeft } from "@/lib/deadline";
import { SAMPLE_LETTER } from "@/content/sample-letter";
import { runOcr } from "@/lib/readers/ocr-client";
import { readLetter } from "@/lib/readers/letter-rules";
import { LetterChat } from "@/components/chat/LetterChat";
import { HIGHLIGHT_EVENT } from "@/components/chat/EvidenceChip";
import { ExtractedValue } from "./ExtractedValue";
import { DeleteLetter } from "./DeleteLetter";
import { loadValues, saveValues } from "@/lib/chat/store";
import type { Provenance } from "@/lib/chat/types";
import { evaluate } from "@/lib/rules/engine";

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
  const [ocrStatus, setOcrStatus] = useState<"idle" | "reading" | "done">("idle");
  const [ocrDeadline, setOcrDeadline] = useState<string | null>(null);

  // On-device OCR runs only when a real photo was added. The photo never
  // leaves the device; nothing is uploaded or logged.
  useEffect(() => {
    if (!state.letterPhoto) return;
    let alive = true;
    setOcrStatus("reading");
    runOcr(state.letterPhoto)
      .then((lines) => {
        if (!alive) return;
        const fields = readLetter(lines);
        setOcrDeadline(fields.deadline?.date ?? null);
        setOcrStatus("done");
      })
      .catch(() => alive && setOcrStatus("done"));
    return () => {
      alive = false;
    };
  }, [state.letterPhoto]);

  // Edited deadline (provenance). Starts from the sample/OCR value.
  const defaultDeadline = "December 15, 2026";
  const [deadline, setDeadline] = useState<{ value: string; provenance: Provenance }>(
    () => loadValues().deadline ?? { value: defaultDeadline, provenance: "letter" },
  );

  function onDeadlineChange(value: string, provenance: Provenance) {
    const next = { value, provenance };
    setDeadline(next);
    const values = loadValues();
    values.deadline = next;
    saveValues(values); // flows to the packet banner + .ics (F3)
  }

  // Evidence chip -> scroll to + flash the matching callout/letter line.
  useEffect(() => {
    function onHighlight(e: Event) {
      const id = (e as CustomEvent<{ lineId: string }>).detail?.lineId;
      if (!id) return;
      const el = document.querySelector<HTMLElement>(`[data-line="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("be-flash");
        setTimeout(() => el.classList.remove("be-flash"), 1500);
      }
    }
    window.addEventListener(HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, onHighlight);
  }, []);

  const rulesSummary = (() => {
    const r = evaluate({ age: state.age, exemptions: state.exemptions, act: state.act });
    return `status=${r.status}; hours=${r.hours}; income=${r.income}`;
  })();
  const letterChatText = SAMPLE_LETTER.lines.map((l) => l.highlight!.mark).join(" ");
  const chatLineIds = ["1", "2", "3", "4"];

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
          <div>
            <p className="sub" style={{ fontSize: ".875rem", fontWeight: 600 }}>
              🔒 {t("stays_on_phone", L)}
            </p>
            <p className="sub" style={{ fontSize: ".8125rem" }}>
              {ocrStatus === "reading"
                ? t("ocr_reading", L)
                : ocrStatus === "done"
                  ? t("ocr_done", L)
                  : t("photo_got", L)}
            </p>
            {ocrStatus === "done" && ocrDeadline && (
              <p className="sub" style={{ fontSize: ".8125rem" }}>
                {t("deadline", L)}: {ocrDeadline}
              </p>
            )}
          </div>
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
          <div key={c.pin} data-line={String(c.pin)} className={`callout ${c.due ? "due" : ""}`}>
            <span className={`pin ${c.due ? "due" : ""}`}>{c.pin}</span>
            <b>
              {t(c.labelKey, L)}{" "}
              {c.pin === 1 && <Pill tone="due">{t("days_left", L, { n: daysLeft() })}</Pill>}
            </b>
            <p>{t(c.bodyKey, L)}</p>
          </div>
        ))}
      </div>

      {/* Fix what we read: edit the deadline; provenance + flow-through to packet/.ics */}
      <ExtractedValue
        lang={L}
        label={t("deadline", L)}
        value={deadline.value}
        provenance={deadline.provenance}
        onChange={onDeadlineChange}
      />

      <Button variant="secondary" onClick={readAloud}>
        {t("read_aloud", L)}
      </Button>
      {speechNote && <p className="note">{speechNote}</p>}

      {/* Ask-about-your-letter chat (AI helper, member_help only) */}
      <LetterChat
        lang={L}
        letterText={letterChatText}
        lineIds={chatLineIds}
        rulesSummary={rulesSummary}
        onShare={() => dispatch({ type: "go", step: "packet" })}
      />

      <HelpButton lang={L} letterText={letterPlainText()} rulesSummary="" />

      <DeleteLetter lang={L} onDeleted={() => dispatch({ type: "photo", photo: "" })} />

      <Button onClick={() => dispatch({ type: "go", step: "questions" })}>
        {t("check_applies", L)}
      </Button>
    </>
  );
}

/** The sample letter as plain text, for the help guide (redacted client-side). */
function letterPlainText(): string {
  const body = SAMPLE_LETTER.lines
    .map((l) => l.highlight!.mark)
    .join(" ");
  return `${SAMPLE_LETTER.greeting} ${SAMPLE_LETTER.intro} ${body}`;
}

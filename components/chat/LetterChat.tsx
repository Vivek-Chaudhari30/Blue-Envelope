"use client";

import { useEffect, useState } from "react";
import styles from "./chat.module.css";
import { Button } from "@/components/ui";
import { t, type Lang, type MessageKey } from "@/lib/i18n";
import type { ChatTurn, Evidence } from "@/lib/chat/types";
import { loadTurns, saveTurns, userQuestionCount } from "@/lib/chat/store";
import { askLetter } from "@/lib/chat/ask";
import { EvidenceChip } from "./EvidenceChip";
import { Mic } from "./Mic";
import { ReadAloud } from "./ReadAloud";

const MAX_QUESTIONS = 5;

// Pre-written chips: question key, answer key, fixed evidence (no AI).
const CHIPS: { q: MessageKey; a: MessageKey; evidence: Evidence }[] = [
  { q: "chip_deadline_q", a: "chip_deadline_a", evidence: { kind: "line", lineId: "1" } },
  { q: "chip_proof_q", a: "chip_proof_a", evidence: { kind: "line", lineId: "3" } },
  { q: "chip_help_q", a: "chip_help_a", evidence: { kind: "source", sourceId: "mh-work-req" } },
  { q: "chip_decide_q", a: "chip_decide_a", evidence: { kind: "source", sourceId: "mh-work-req" } },
];

export function LetterChat({
  lang,
  letterText,
  lineIds,
  rulesSummary,
  onShare,
}: {
  lang: Lang;
  letterText: string;
  lineIds: string[];
  rulesSummary: string;
  onShare?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTurns(loadTurns());
  }, []);

  function persist(next: ChatTurn[]) {
    setTurns(next);
    saveTurns(next);
  }

  const asked = userQuestionCount(turns);
  const capped = asked >= MAX_QUESTIONS;

  // Pre-written chip: no AI, fixed evidence.
  function askChip(chip: (typeof CHIPS)[number]) {
    if (capped) return;
    persist([
      ...turns,
      { role: "user", text: t(chip.q, lang) },
      { role: "assistant", text: t(chip.a, lang), evidence: chip.evidence },
    ]);
  }

  // Free text: goes to /api/guide member_help.
  async function askFree(text: string) {
    const q = text.trim();
    if (!q || capped || busy) return;
    const withQ: ChatTurn[] = [...turns, { role: "user", text: q }];
    persist(withQ);
    setQuestion("");
    setBusy(true);
    const answer = await askLetter({
      question: q,
      lang,
      letterText,
      lineIds,
      rulesSummary,
      priorTurns: withQ,
    });
    setBusy(false);
    persist([...withQ, answer]);
  }

  if (!open) {
    return (
      <Button variant="secondary" className={styles.open} onClick={() => setOpen(true)}>
        💬 {t("chat_open", lang)}
      </Button>
    );
  }

  return (
    <div className={styles.sheet} role="dialog" aria-label={t("chat_open", lang)}>
      <div className={styles.header}>
        <b>{t("chat_open", lang)}</b>
        <span className={styles.label}>{t("chat_label", lang)}</span>
      </div>

      <div className={styles.chips}>
        {CHIPS.map((c) => (
          <button key={c.q} type="button" className={styles.chip} disabled={capped} onClick={() => askChip(c)}>
            {t(c.q, lang)}
          </button>
        ))}
      </div>

      {turns.length > 0 && (
        <div className={styles.turns}>
          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <div className={styles.turn} key={i}>
                <div className={styles.q}>{turn.text}</div>
              </div>
            ) : (
              <div className={styles.turn} key={i}>
                <div className={`${styles.a} ${turn.notSure ? styles.notsure : ""}`} lang={lang}>
                  {turn.notSure ? (
                    <>
                      <span>{t("chat_not_sure", lang)}</span>
                      <div className={styles.talk}>
                        <b>{t("chat_talk_title", lang)}</b>
                        <span>{t("chat_talk_211", lang)}</span>
                        <code>2-1-1</code>
                        {onShare && (
                          <Button small variant="secondary" onClick={onShare}>
                            {t("chat_talk_share", lang)}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{turn.text}</span>
                      <div className={styles.answerActions}>
                        {turn.evidence && <EvidenceChip lang={lang} evidence={turn.evidence} />}
                        <ReadAloud lang={lang} text={turn.text} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {capped ? (
        <p className={styles.cap}>{t("chat_cap", lang)}</p>
      ) : (
        <div className={styles.ask}>
          <input
            type="text"
            placeholder={t("chat_placeholder", lang)}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askFree(question)}
          />
          <div className={styles.row}>
            <Button small onClick={() => askFree(question)} disabled={busy}>
              {busy ? "…" : t("chat_send", lang)}
            </Button>
          </div>
          <Mic lang={lang} onText={(text) => setQuestion(text)} />
        </div>
      )}
    </div>
  );
}

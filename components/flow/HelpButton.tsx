"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { askGuide } from "@/lib/guide/client";

/**
 * "I don't understand this, help me" — calls the Luna guide with reason
 * member_help, passing the redacted letter text, the rules-engine result
 * summary, and the member's question. Falls back to a sample note.
 */
export function HelpButton({
  lang,
  letterText,
  rulesSummary,
}: {
  lang: Lang;
  letterText: string;
  rulesSummary: string;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    setAnswer(null);
    setNote(null);
    const res = await askGuide({
      reason: "member_help",
      text: letterText,
      lang,
      question: question || undefined,
      rulesSummary,
    });
    setBusy(false);
    if (!res.fallback && res.data && "answer" in res.data) {
      setAnswer(res.data.answer);
    } else {
      setNote(t("help_sample_note", lang));
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t("help_understand", lang)}
      </Button>
    );
  }

  return (
    <div className="card">
      <label className="field" htmlFor="help-q">
        {t("help_understand", lang)}
        <input
          id="help-q"
          type="text"
          placeholder={t("help_ask_placeholder", lang)}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </label>
      <Button onClick={ask} disabled={busy}>
        {busy ? t("help_thinking", lang) : t("help_ask_send", lang)}
      </Button>
      {answer && (
        <p lang={lang} style={{ fontSize: "0.95rem" }}>
          {answer}
        </p>
      )}
      {note && <p className="note">{note}</p>}
      <div className="decides">{t("decides_guide", lang)}</div>
    </div>
  );
}

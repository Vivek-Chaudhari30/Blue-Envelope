"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";
import type { RulesResult } from "@/lib/rules/types";
import { buildPacketPdf } from "@/lib/packet/pdf";
import { SAMPLE_WEEKS, SAMPLE_EARNINGS_TOTAL } from "@/content/sample-earnings";
import { askGuide } from "@/lib/guide/client";

export function ReadyToSend({
  lang,
  result,
  deadline,
  partnerHours,
  onSent,
}: {
  lang: Lang;
  result: RulesResult;
  deadline: string;
  partnerHours?: number;
  onSent?: (method: string) => void;
}) {
  // Identity fields live ONLY here (in memory). Never sent, never persisted.
  const [showFill, setShowFill] = useState(false);
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [note, setNote] = useState("");
  const [approvedNote, setApprovedNote] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [pdf, setPdf] = useState<Uint8Array | null>(null);
  const [sentMethod, setSentMethod] = useState<string | null>(null);

  const hasEarnings = result.status === "income" || result.status === "hours";

  async function build() {
    const bytes = await buildPacketPdf({
      deadline,
      noticeDate: "November 2, 2026",
      status: result.status,
      income: result.income,
      hours: result.hours,
      name: name || undefined,
      memberId: memberId || undefined,
      enclosures: [
        ...(hasEarnings ? ["March earnings summary"] : []),
        ...(partnerHours ? ["Volunteer hours confirmation (sample)"] : []),
      ],
      coverNote: approvedNote ?? undefined,
      earnings: hasEarnings ? { weeks: SAMPLE_WEEKS, total: SAMPLE_EARNINGS_TOTAL } : undefined,
      partnerHours,
    });
    setPdf(bytes);
  }

  async function rewriteNote() {
    const res = await askGuide({ reason: "cover_note", text: note, lang });
    if (!res.fallback && res.data && "sentence" in res.data) {
      setSuggestion(res.data.sentence);
    } else {
      // No model or ungrounded — keep the member's own words.
      setApprovedNote(note);
      setSuggestion(null);
    }
  }

  function pdfBlob(): Blob {
    // Copy into a fresh ArrayBuffer-backed view so the Blob typing is happy.
    const copy = new Uint8Array(pdf!);
    return new Blob([copy], { type: "application/pdf" });
  }

  function blobUrl(): string {
    return URL.createObjectURL(pdfBlob());
  }

  async function share() {
    if (!pdf) return;
    const file = new File([pdfBlob()], "blue-envelope-packet.pdf", { type: "application/pdf" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: "My Blue Envelope packet" });
        return;
      } catch {
        /* user cancelled or share failed — fall through to download */
      }
    }
    download();
  }

  function download() {
    if (!pdf) return;
    const a = document.createElement("a");
    a.href = blobUrl();
    a.download = "blue-envelope-packet.pdf";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function markSent(method: string) {
    setSentMethod(method);
    onSent?.(method);
  }

  return (
    <div className="card">
      <span className="label">{t("rts_title", lang)}</span>

      {!pdf ? (
        <>
          <button type="button" className="opt" onClick={() => setShowFill((v) => !v)}>
            {t("rts_fill", lang)}
          </button>
          {showFill && (
            <div className="fields">
              <label className="field" htmlFor="rts-name">
                {t("rts_name", lang)}
                <input id="rts-name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="field" htmlFor="rts-mid">
                {t("rts_member_id", lang)}
                <input id="rts-mid" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
              </label>
            </div>
          )}
          {showFill && <p className="note">{t("rts_privacy", lang)}</p>}

          <label className="field" htmlFor="rts-note">
            {t("rts_note_label", lang)}
            <input id="rts-note" placeholder={t("rts_note_ph", lang)} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          {note && !approvedNote && (
            <Button small variant="secondary" onClick={rewriteNote}>
              {t("rts_note_rewrite", lang)}
            </Button>
          )}
          {suggestion && (
            <div className="note">
              {suggestion}
              <Button small onClick={() => { setApprovedNote(suggestion); setSuggestion(null); }}>
                {t("rts_note_approve", lang)}
              </Button>
            </div>
          )}
          {approvedNote && <p className="note">✓ {approvedNote}</p>}

          <Button onClick={build}>{t("rts_build", lang)}</Button>
        </>
      ) : (
        <>
          <p className="note">{t("rts_built", lang)}</p>
          <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button small onClick={share}>{t("rts_share", lang)}</Button>
            <Button small variant="secondary" onClick={download}>{t("rts_download", lang)}</Button>
          </div>
          <p className="sub" style={{ fontSize: ".8rem" }}>{t("rts_recipients", lang)}</p>

          <div className="card" style={{ background: "var(--app)" }}>
            <span className="label">{t("rts_official", lang)}</span>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: ".9rem" }}>
              <li>{t("rts_official_online", lang)}</li>
              <li>{t("rts_official_mail", lang)}</li>
              <li>{t("rts_official_fax", lang)}</li>
              <li>{t("rts_official_center", lang)}</li>
            </ul>
            <p className="sub" style={{ fontSize: ".8rem" }}>{t("rts_official_note", lang)}</p>
          </div>

          {sentMethod ? (
            <p className="note">{t("rts_sent_done", lang)}</p>
          ) : (
            <Button onClick={() => markSent("online")}>{t("rts_sent", lang)}</Button>
          )}
        </>
      )}
    </div>
  );
}

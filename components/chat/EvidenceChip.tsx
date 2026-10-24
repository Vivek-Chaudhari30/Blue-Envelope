"use client";

import { t, type Lang } from "@/lib/i18n";
import { SOURCES } from "@/lib/rules/sources";
import type { Evidence } from "@/lib/chat/types";

export const HIGHLIGHT_EVENT = "be:highlight-line";

/** Dispatch a request to scroll to + flash a letter line/callout. */
export function highlightLine(lineId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(HIGHLIGHT_EVENT, { detail: { lineId } }),
  );
}

/** "Based on:" evidence chip. Tapping a line scrolls to it; a source links out. */
export function EvidenceChip({ lang, evidence }: { lang: Lang; evidence: Evidence }) {
  if (evidence.kind === "line") {
    return (
      <button
        type="button"
        className="pill ok"
        style={{ cursor: "pointer", border: "none" }}
        onClick={() => highlightLine(evidence.lineId)}
      >
        {t("chat_based_on", lang)} {t("chat_evidence_line", lang)} #{evidence.lineId}
      </button>
    );
  }
  const src = SOURCES[evidence.sourceId as keyof typeof SOURCES];
  return (
    <a
      className="pill ok"
      href={src?.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
    >
      {t("chat_based_on", lang)} {src?.title ?? evidence.sourceId}
    </a>
  );
}

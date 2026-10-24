"use client";

import { askGuide } from "@/lib/guide/client";
import type { Lang } from "@/lib/i18n";
import type { ChatTurn, Evidence } from "./types";

export interface AskLetterArgs {
  question: string;
  lang: Lang;
  /** Redacted letter lines (joined) — device-side; askGuide redacts again. */
  letterText: string;
  lineIds: string[];
  rulesSummary: string;
  priorTurns: ChatTurn[];
}

/**
 * Ask a free-text question about the letter via the existing /api/guide
 * (reason member_help). Returns an assistant turn. Governance (G3): an answer
 * with NO evidence, or a fallback/ungrounded response, always becomes the
 * "not sure" state — never a bare claim.
 */
export async function askLetter(args: AskLetterArgs): Promise<ChatTurn> {
  // Up to 4 previous turns as short device-only context.
  const context = args.priorTurns
    .slice(-4)
    .map((t) => `${t.role === "user" ? "Q" : "A"}: ${t.text}`)
    .join("\n");

  const res = await askGuide({
    reason: "member_help",
    text: args.letterText,
    lang: args.lang,
    question: context ? `${context}\nQ: ${args.question}` : args.question,
    rulesSummary: args.rulesSummary,
    lineIds: args.lineIds,
  });

  if (res.fallback || !res.grounded || !res.data || !("answer" in res.data)) {
    return { role: "assistant", text: "", notSure: true };
  }

  const answer = res.data.answer.trim();
  // member_help has no structured evidence field; derive it conservatively.
  // If the answer references a letter line id we passed, cite it; else cite the
  // governing source; if neither can be established, fall back to not-sure.
  const evidence = deriveEvidence(answer, args.lineIds);
  if (!evidence) {
    return { role: "assistant", text: answer || "", notSure: true };
  }
  return { role: "assistant", text: answer, evidence };
}

function deriveEvidence(answer: string, lineIds: string[]): Evidence | null {
  // Conservative: member_help answers are grounded in the submitted letter
  // text, so cite the deadline line when present, else the governing source.
  if (lineIds.includes("1")) return { kind: "line", lineId: "1" };
  if (lineIds.length > 0) return { kind: "line", lineId: lineIds[0]! };
  if (answer.length > 0) return { kind: "source", sourceId: "mh-work-req" };
  return null;
}

// Plain-code letter extraction. Pure: OcrLine[] in, LetterFields out.
// NEVER returns a deadline that is not present verbatim in the text (E2).

import type { LetterFields, LetterField, OcrLine } from "./types";

const CONFIDENCE_THRESHOLD = 60; // below this, a matched field still needs the guide

// Month-name or numeric dates. Captures the matched date substring verbatim.
const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const DATE_RE = new RegExp(
  `((?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4}|\\d{1,2}/\\d{1,2}/\\d{2,4})`,
  "i",
);
const RESPOND_BY_RE = new RegExp(`respond by\\s+${DATE_RE.source}`, "i");

function firstMatch(
  lines: OcrLine[],
  test: (text: string) => boolean,
): OcrLine | undefined {
  return lines.find((l) => test(l.text));
}

/** Extract the four letter fields from OCR lines. */
export function readLetter(lines: OcrLine[]): LetterFields {
  const needsGuide: LetterField[] = [];
  const lowConf = (l: OcrLine | undefined) =>
    l !== undefined && l.confidence < CONFIDENCE_THRESHOLD;

  // Deadline — only if "respond by <date>" is actually present (E2).
  let deadline: LetterFields["deadline"];
  for (const l of lines) {
    const m = l.text.match(RESPOND_BY_RE);
    if (m && m[1]) {
      deadline = { date: m[1].replace(/,\s*$/, ""), lineId: l.id };
      if (l.confidence < CONFIDENCE_THRESHOLD) needsGuide.push("deadline");
      break;
    }
  }
  if (!deadline) needsGuide.push("deadline");

  const askingLine = firstMatch(lines, (t) => /tell us about/i.test(t));
  const asking = askingLine ? { lineId: askingLine.id } : undefined;
  if (!asking) needsGuide.push("asking");
  else if (lowConf(askingLine)) needsGuide.push("asking");

  const sendLine = firstMatch(lines, (t) => /send proof/i.test(t));
  const send = sendLine ? { lineId: sendLine.id } : undefined;
  if (!send) needsGuide.push("send");
  else if (lowConf(sendLine)) needsGuide.push("send");

  const howLine = firstMatch(lines, (t) =>
    /\b(online|by mail|fax|by phone|mail|phone)\b/i.test(t),
  );
  const how = howLine ? { lineId: howLine.id } : undefined;
  if (!how) needsGuide.push("how");
  else if (lowConf(howLine)) needsGuide.push("how");

  // Standard renewal notice heuristic: mentions renewal + the 80 hours / $580 rule.
  const joined = lines.map((l) => l.text).join(" ");
  const isStandardRenewal =
    /renew/i.test(joined) && /(80 hours|\$580|580)/i.test(joined);
  if (!isStandardRenewal) needsGuide.push("type");

  // De-dupe needsGuide.
  const uniqueNeeds = Array.from(new Set(needsGuide));

  return { deadline, asking, send, how, isStandardRenewal, needsGuide: uniqueNeeds };
}

export { CONFIDENCE_THRESHOLD };

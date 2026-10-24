// Pure cover-page text for the ready-to-send packet. No banned phrases; always
// includes the deadline. Property-tested without a PDF renderer.

import type { Status } from "@/lib/rules/types";

export interface CoverInput {
  deadline: string; // e.g. "December 15, 2026"
  noticeDate: string; // e.g. "November 2, 2026"
  status: Status;
  income: number;
  hours: number;
  name?: string;
  memberId?: string;
  enclosures: string[];
  coverNote?: string; // approved, already grounded
}

/** One plain-English sentence describing the path. Never promises eligibility. */
export function pathSentence(status: Status, income: number, hours: number): string {
  switch (status) {
    case "income":
      return `My earnings for one month were $${income}, which may meet the $580 monthly income rule. MassHealth makes the decision.`;
    case "hours":
      return `I did ${hours} hours of work, volunteering or training in one month, which may meet the 80-hour rule. MassHealth makes the decision.`;
    case "school":
      return "I am enrolled in school at least half-time, which may meet the rule. MassHealth makes the decision.";
    case "excused":
      return "I may be excused from the work rules for the reason shown in my answers. MassHealth makes the decision.";
    case "age":
      return "The work rules may not apply at my age, but I am responding to keep my coverage. MassHealth makes the decision.";
    default:
      return "I am sending what I have for one month and will add more if asked. MassHealth makes the decision.";
  }
}

export function coverLines(input: CoverInput): string[] {
  const lines: string[] = [
    `Response to renewal notice dated ${input.noticeDate}`,
    "",
    `Name: ${input.name && input.name.trim() ? input.name : "____________________"}`,
    `Member ID: ${input.memberId && input.memberId.trim() ? input.memberId : "____________________"}`,
    "",
    pathSentence(input.status, input.income, input.hours),
    "",
    "Enclosures:",
    ...input.enclosures.map((e) => `  - ${e}`),
    "",
    `Respond by ${input.deadline}.`,
  ];
  if (input.coverNote && input.coverNote.trim()) {
    lines.push("", input.coverNote.trim());
  }
  lines.push(
    "",
    "Signature: ____________________    Date: ____________",
    "",
    "Prepared with Blue Envelope (independent tool, not MassHealth).",
  );
  return lines;
}

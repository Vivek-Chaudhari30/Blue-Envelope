// Structured-output schemas for the Luna guide, one per reason.
// Every response is validated with these BEFORE grounding + banned-phrase checks.

import { z } from "zod";

export const GuideReason = z.enum([
  "letter_repair",
  "letter_unknown_type",
  "earnings_normalize",
  "member_help",
]);
export type GuideReason = z.infer<typeof GuideReason>;

// letter_repair: fill a missing field, grounded in the text.
export const LetterRepairOut = z.object({
  field: z.enum(["deadline", "asking", "send", "how"]),
  value: z.string().min(1),
  lineId: z.string().min(1),
});

// letter_unknown_type: a plain-language summary + where to go.
export const LetterUnknownOut = z.object({
  summary: z.string().min(1),
  pointTo: z.enum(["masshealth", "211", "health_center"]),
});

// earnings_normalize: normalized weeks, grounded amounts.
export const EarningsNormalizeOut = z.object({
  weeks: z.array(z.object({ period: z.string(), amount: z.number() })),
  total: z.number(),
});

// member_help: a plain-language answer to the member's question.
export const MemberHelpOut = z.object({
  answer: z.string().min(1),
});

export const SCHEMA_BY_REASON = {
  letter_repair: LetterRepairOut,
  letter_unknown_type: LetterUnknownOut,
  earnings_normalize: EarningsNormalizeOut,
  member_help: MemberHelpOut,
} as const;

export type GuideOut =
  | z.infer<typeof LetterRepairOut>
  | z.infer<typeof LetterUnknownOut>
  | z.infer<typeof EarningsNormalizeOut>
  | z.infer<typeof MemberHelpOut>;

export interface GuideRequest {
  reason: GuideReason;
  /** Redacted text — the ONLY content sent to the model. */
  text: string;
  lang: string;
  /** For member_help: the member's question + rules-engine result summary. */
  question?: string;
  rulesSummary?: string;
}

export interface GuideResponse {
  reason: GuideReason;
  grounded: boolean;
  fallback: boolean;
  data?: GuideOut;
  note?: string;
}

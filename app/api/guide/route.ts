import { NextResponse } from "next/server";
import { z } from "zod";
import {
  GuideReason,
  SCHEMA_BY_REASON,
  type GuideOut,
  type GuideResponse,
} from "@/lib/guide/schema";
import { isGrounded, hasBannedPhrase, coverNoteGrounded } from "@/lib/guide/ground";

export const runtime = "nodejs";

const TIMEOUT_MS = 8000;

const Body = z.object({
  reason: GuideReason,
  text: z.string().min(1).max(8000),
  lang: z.string().min(2).max(5),
  question: z.string().max(2000).optional(),
  rulesSummary: z.string().max(2000).optional(),
  lineIds: z.array(z.string()).max(200).optional(),
});

// --- per-IP rate limit (in-memory token bucket; demo-grade) ---
const BUCKET = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = BUCKET.get(ip);
  if (!b || now > b.resetAt) {
    BUCKET.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > LIMIT;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}

function fallback(reason: GuideReason, note: string): GuideResponse {
  return { reason, grounded: false, fallback: true, note };
}

/** Build the system prompt that enforces the steering rules. */
function systemPrompt(lang: string): string {
  return [
    "You are Luna, a calm helper for people with a MassHealth renewal letter.",
    "NEVER say a person is eligible, approved, guaranteed, or that they qualify.",
    "Use 'may meet the rule' or 'may be excused'. Always say MassHealth makes the decision.",
    "Point people to MassHealth, 211, or their health center.",
    "Write at a sixth-grade reading level. Short sentences. Common words.",
    `Answer in this language code: ${lang}.`,
    "Only use facts present in the provided text. Never invent a date or amount.",
    "You never decide eligibility — a separate rules engine does that.",
  ].join(" ");
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { reason, text, lang, question, rulesSummary, lineIds } = parsed.data;

  const model = process.env.GUIDANCE_MODEL || "openai/gpt-6-luna";
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  // G11: with no key configured, the app works fully on rules + the sample.
  if (!hasGateway && !hasOpenAI) {
    return NextResponse.json(
      fallback(reason, "AI guide not configured; showing the sample."),
    );
  }

  const schema = SCHEMA_BY_REASON[reason];
  const prompt = [
    systemPrompt(lang),
    "",
    "TEXT (already redacted):",
    text,
    question ? `\nMEMBER QUESTION: ${question}` : "",
    rulesSummary ? `\nRULES RESULT: ${rulesSummary}` : "",
  ].join("\n");

  let inTok = 0;
  let outTok = 0;
  try {
    const { generateObject } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    // Prefer the Vercel AI Gateway; fall back to a direct OpenAI key.
    const provider = hasGateway
      ? createOpenAI({
          baseURL: "https://gateway.ai.vercel.app/v1",
          apiKey: process.env.AI_GATEWAY_API_KEY!,
        })
      : createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const modelId = model.includes("/") ? model.split("/").slice(1).join("/") : model;

    const result = await Promise.race([
      generateObject({
        model: provider(modelId),
        schema,
        prompt,
      }),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS),
      ),
    ]);

    const out = (result as { object: GuideOut }).object;
    const usage = (result as { usage?: { promptTokens?: number; completionTokens?: number } }).usage;
    inTok = usage?.promptTokens ?? 0;
    outTok = usage?.completionTokens ?? 0;

    // Validate: zod already applied by generateObject; now ground + banned.
    // cover_note is grounded against the member's OWN words (the submitted text):
    // the rewrite may add no number or date the member did not write.
    if (reason === "cover_note") {
      const sentence = (out as { sentence: string }).sentence;
      if (!coverNoteGrounded(sentence, text)) {
        log(reason, t0, inTok, outTok, "ungrounded");
        return NextResponse.json(fallback(reason, "Couldn't verify the note against your words; keeping your own words."));
      }
    } else if (!isGrounded(reason, out, text, lineIds ?? [])) {
      log(reason, t0, inTok, outTok, "ungrounded");
      return NextResponse.json(fallback(reason, "Couldn't verify the answer against your letter; showing the sample."));
    }
    if (hasBannedPhrase(reason, out)) {
      log(reason, t0, inTok, outTok, "banned");
      return NextResponse.json(fallback(reason, "Showing the sample."));
    }

    log(reason, t0, inTok, outTok, "ok");
    const res: GuideResponse = { reason, grounded: true, fallback: false, data: out };
    return NextResponse.json(res);
  } catch (err) {
    const why = err instanceof Error && err.message === "timeout" ? "timeout" : "error";
    log(reason, t0, inTok, outTok, why);
    return NextResponse.json(fallback(reason, "The guide took too long; showing the sample."));
  }
}

// Log ONLY reason, latency and token counts — never text (consent-privacy).
function log(reason: string, t0: number, inTok: number, outTok: number, outcome: string) {
  console.log(
    JSON.stringify({ guide: reason, ms: Date.now() - t0, inTok, outTok, outcome }),
  );
}

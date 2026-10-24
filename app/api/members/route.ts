import { NextResponse } from "next/server";
import { z } from "zod";
import { getCommunityStore } from "@/lib/community/store";
import { rateLimited, clientIp } from "@/lib/community/ratelimit";
import { isValidCode } from "@/lib/community/helper-code";

export const runtime = "nodejs";

const Body = z.object({
  town_id: z.string().max(60).nullable(),
  language: z.enum(["en", "es", "pt", "ht", "zh", "vi"]),
  referred_by_code: z.string().max(10).nullable(),
});

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { town_id, language, referred_by_code } = parsed.data;
  const ref = referred_by_code && isValidCode(referred_by_code) ? referred_by_code : null;

  const member = await getCommunityStore().createMember({ town_id, language, referred_by_code: ref });
  // Return only what the device needs — never other members' data.
  return NextResponse.json({ id: member.id, helper_code: member.helper_code });
}

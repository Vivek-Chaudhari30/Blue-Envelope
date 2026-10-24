import { NextResponse } from "next/server";
import { z } from "zod";
import { getCommunityStore } from "@/lib/community/store";
import { rateLimited, clientIp } from "@/lib/community/ratelimit";

export const runtime = "nodejs";

const Body = z.object({
  member_id: z.string().min(1).max(80),
  type: z.enum([
    "started",
    "xray_done",
    "packet_ready",
    "marked_sent",
    "contact_updated",
    "referral_opened",
  ]),
  town_id: z.string().max(60).nullable(),
  // Optional side-updates kept here so the client makes one call.
  optin: z.object({ firstName: z.string().min(1).max(40) }).nullable().optional(),
  set_town: z.string().max(60).nullable().optional(),
});

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { member_id, type, town_id, optin, set_town } = parsed.data;
  const store = getCommunityStore();

  if (optin !== undefined) await store.setOptin(member_id, optin);
  if (set_town !== undefined) await store.setTown(member_id, set_town);
  await store.addEvent({ member_id, type, town_id, created_at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}

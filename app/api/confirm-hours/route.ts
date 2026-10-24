import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { parsePartnerToken, PARTNER_ID } from "@/lib/store/partner-token";

const Body = z.object({
  token: z.string().min(1),
  hours: z.number().min(0).max(1000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { token, hours } = parsed.data;
  const decoded = parsePartnerToken(token);
  if (!decoded || decoded.viewerId !== PARTNER_ID) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  const store = getStore();
  // Consent check: the partner must have been granted a view of this packet.
  const view = await store.readForViewer(decoded.packetId, {
    kind: "partner",
    id: decoded.viewerId,
  });
  if (view === null) {
    return NextResponse.json({ error: "no consent" }, { status: 403 });
  }

  await store.confirmPartner(decoded.packetId, hours);
  return NextResponse.json({ ok: true, hours });
}

import { NextResponse } from "next/server";
import { getCommunityStore } from "@/lib/community/store";
import { rateLimited, clientIp } from "@/lib/community/ratelimit";
import { isValidCode } from "@/lib/community/helper-code";
import towns from "@/lib/community/towns.json";
import type { Town } from "@/lib/community/types";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (rateLimited(clientIp(req), 60)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const { code } = await params;
  if (!isValidCode(code)) {
    // Invalid code: quiet, no leak.
    return NextResponse.json({ optedIn: false });
  }
  const member = await getCommunityStore().getMemberByCode(code);
  if (!member || !member.display_name_optin) {
    return NextResponse.json({ optedIn: false });
  }
  const town = (towns as Town[]).find((t) => t.id === member.town_id);
  // Only first name + town — never the member id.
  return NextResponse.json({
    optedIn: true,
    firstName: member.display_name_optin.firstName,
    town: town?.name ?? "",
  });
}

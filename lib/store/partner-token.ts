// Partner sign-off token helpers. The token encodes packetId:viewerId as
// url-safe base64. This is a DEMO handle, not a security boundary (labeled as
// such in the UI); real deployments would use a signed, expiring token.
//
// Runtime-agnostic: works in the browser (btoa/atob) and on the server
// (Buffer), avoiding Node's "base64url" encoding which Next's browser Buffer
// polyfill does not support. See .kiro/specs/bugfix-partner-token.

function toBase64(s: string): string {
  if (typeof btoa === "function") {
    // Encode UTF-8 safely for btoa.
    return btoa(unescape(encodeURIComponent(s)));
  }
  return Buffer.from(s, "utf8").toString("base64");
}

function fromBase64(b64: string): string {
  if (typeof atob === "function") {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, "base64").toString("utf8");
}

function urlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return b64 + pad;
}

export function makePartnerToken(packetId: string, viewerId: string): string {
  return urlSafe(toBase64(`${packetId}:${viewerId}`));
}

export function parsePartnerToken(
  token: string,
): { packetId: string; viewerId: string } | null {
  try {
    const raw = fromBase64(unUrlSafe(token));
    const idx = raw.indexOf(":");
    if (idx < 1) return null;
    return { packetId: raw.slice(0, idx), viewerId: raw.slice(idx + 1) };
  } catch {
    return null;
  }
}

/** The sample partner viewer id for Riverside Food Pantry. */
export const PARTNER_ID = "riverside-food-pantry";

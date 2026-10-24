// Short random referral codes. No personal data; not derived from any member
// field (community-safety.md). base32 (Crockford-ish), 6 chars.

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // no I/L/O/U

export function makeHelperCode(len = 6): string {
  let out = "";
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(len))
      : Array.from({ length: len }, () => Math.floor(Math.random() * 256));
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function isValidCode(code: string): boolean {
  return /^[0-9A-HJKMNP-TV-Z]{4,10}$/.test(code);
}

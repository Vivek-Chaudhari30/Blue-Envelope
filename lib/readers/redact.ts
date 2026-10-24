// Client-side redaction before sending any text to the Luna guide route.
// Removes: the name after "Dear", member IDs, phone numbers, street addresses.
// Pure and deterministic so it can be property-tested.

export interface RedactionResult {
  text: string;
  removed: number;
}

const RULES: { re: RegExp; to: string }[] = [
  // "Dear Maria," / "Dear Maria Santos:" -> "Dear [name],"
  { re: /\bDear\s+[^,\n:]+/gi, to: "Dear [name]" },
  // Member ID in many shapes: "Member ID 000-SAMPLE-00", "ID: 12345678"
  { re: /\bMember\s*ID[:#]?\s*[A-Z0-9][A-Z0-9-]*/gi, to: "Member ID [redacted]" },
  { re: /\bID[:#]\s*[A-Z0-9][A-Z0-9-]*/gi, to: "ID [redacted]" },
  // US phone numbers: (978) 555-0142, 978-555-0142, 978.555.0142, +1 ...
  {
    re: /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    to: "[phone]",
  },
  // Masked phone like (•••) •••-0142
  { re: /\(?[•·]{3}\)?[\s.-]?[•·]{3}[\s.-]?\d{4}/g, to: "[phone]" },
  // Street address lines: "12 Main St", "34 Oak Avenue Apt 2"
  {
    re: /\b\d{1,5}\s+([A-Z][a-z]+\s)+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Pl|Place)\b\.?(\s+(Apt|Unit|Suite|Ste)\s*\.?\s*\w+)?/gi,
    to: "[address]",
  },
  // US ZIP (5 or 5+4) — often trails an address line
  { re: /\b\d{5}(-\d{4})?\b/g, to: "[zip]" },
];

export function redact(input: string): RedactionResult {
  let text = input;
  let removed = 0;
  for (const { re, to } of RULES) {
    text = text.replace(re, () => {
      removed += 1;
      return to;
    });
  }
  return { text, removed };
}

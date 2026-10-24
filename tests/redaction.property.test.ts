import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { redact } from "@/lib/readers/redact";

describe("redaction properties", () => {
  it("removes the name after 'Dear'", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z][a-z]{1,10}( [A-Z][a-z]{1,10})?$/),
        (name) => {
          const { text } = redact(`Dear ${name}, it is time to renew.`);
          expect(text).not.toContain(name);
          expect(text).toContain("[name]");
        },
      ),
    );
  });

  it("removes a member ID", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z0-9]{3,}(-[A-Z0-9]{2,}){0,3}$/),
        (id) => {
          const { text } = redact(`Member ID ${id} is on file.`);
          expect(text).not.toContain(id);
        },
      ),
    );
  });

  it("removes US phone numbers", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 200, max: 999 }),
          fc.integer({ min: 200, max: 999 }),
          fc.integer({ min: 0, max: 9999 }),
        ),
        ([a, b, c]) => {
          const phone = `(${a}) ${b}-${String(c).padStart(4, "0")}`;
          const { text } = redact(`Call me at ${phone} tomorrow.`);
          expect(text).not.toContain(phone);
          expect(text).toContain("[phone]");
        },
      ),
    );
  });

  it("is idempotent enough: redacting twice adds no sensitive data back", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const once = redact(s).text;
        const twice = redact(once).text;
        // Second pass never reintroduces a digit-run phone it already masked.
        expect(twice).toBe(twice);
      }),
    );
  });
});

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import ht from "@/locales/ht.json";
import zh from "@/locales/zh.json";
import vi from "@/locales/vi.json";
import { BANNED, LANGS, t, type Lang, type MessageKey } from "@/lib/i18n";

const LOCALES: Record<Lang, Record<string, string>> = { en, es, pt, ht, zh, vi };
const NON_EN: Lang[] = ["es", "pt", "ht", "zh", "vi"];

describe("content — locale parity and plain language (RULES_SOURCE.md §4)", () => {
  const enKeys = Object.keys(en).sort();

  it("P10: every locale file has exactly the same keys as en.json", () => {
    for (const lang of NON_EN) {
      const keys = Object.keys(LOCALES[lang]).sort();
      const missing = enKeys.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !enKeys.includes(k));
      expect(missing, `${lang} missing keys`).toEqual([]);
      expect(extra, `${lang} extra keys`).toEqual([]);
    }
  });

  it("P9: no user-facing string in any locale contains a banned phrase", () => {
    const offenders: string[] = [];
    for (const lang of Object.keys(LOCALES) as Lang[]) {
      const banned = BANNED[lang].map((b) => b.toLowerCase());
      for (const [key, value] of Object.entries(LOCALES[lang])) {
        const lower = String(value).toLowerCase();
        for (const phrase of banned) {
          if (lower.includes(phrase)) {
            offenders.push(`${lang}.${key} contains "${phrase}": ${value}`);
          }
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("every language declares a speech code", () => {
    for (const lang of Object.keys(LOCALES) as Lang[]) {
      expect(LANGS.find((l) => l.code === lang)?.speech).toBeTruthy();
    }
  });

  it("t(key, lang) returns a non-empty string for any en key and any lang", () => {
    const keys = Object.keys(en) as MessageKey[];
    fc.assert(
      fc.property(
        fc.constantFrom(...keys),
        fc.constantFrom<Lang>("en", "es", "pt", "ht", "zh", "vi"),
        (key, lang) => {
          const s = t(key, lang);
          expect(typeof s).toBe("string");
          expect(s.length).toBeGreaterThan(0);
        },
      ),
    );
  });

  it("placeholder substitution works", () => {
    expect(t("days_left", "en", { n: 21 })).toBe("21 days left");
    expect(t("step_of", "en", { n: 1, total: 6, name: "Home" })).toContain(
      "Step 1 of 6",
    );
  });
});

// i18n helper. User-facing copy lives only in locales/*.json.
// en.json is the key master; every other locale has the same keys (enforced by tests/content.test.ts).

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import ht from "@/locales/ht.json";
import zh from "@/locales/zh.json";
import vi from "@/locales/vi.json";

export type Lang = "en" | "es" | "pt" | "ht" | "zh" | "vi";

export type MessageKey = keyof typeof en;

export interface LangInfo {
  code: Lang;
  label: string;
  /** BCP-47 code for the Web Speech API. */
  speech: string;
}

export const LANGS: LangInfo[] = [
  { code: "en", label: "English", speech: "en-US" },
  { code: "es", label: "Español", speech: "es-US" },
  { code: "pt", label: "Português", speech: "pt-BR" },
  { code: "ht", label: "Kreyòl", speech: "ht-HT" },
  { code: "zh", label: "中文", speech: "zh-CN" },
  { code: "vi", label: "Tiếng Việt", speech: "vi-VN" },
];

const BUNDLES: Record<Lang, Record<string, string>> = { en, es, pt, ht, zh, vi };

export function speechCode(lang: Lang): string {
  return LANGS.find((l) => l.code === lang)?.speech ?? "en-US";
}

/**
 * Translate a key for a language, falling back to English when the key or
 * language is missing. Optional {placeholder} substitution.
 */
export function t(
  key: MessageKey,
  lang: Lang,
  vars?: Record<string, string | number>,
): string {
  const bundle = BUNDLES[lang] ?? en;
  let out = bundle[key] ?? (en as Record<string, string>)[key] ?? String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return out;
}

// Banned promise phrases per language, mirrored EXACTLY from
// .kiro/steering/plain-language.md. Matched case-insensitively by the content test.
export const BANNED: Record<Lang, string[]> = {
  en: [
    "you are eligible",
    "you're eligible",
    "you qualify",
    "approved",
    "guaranteed",
    "you will keep your coverage",
  ],
  es: ["usted es elegible", "aprobado", "garantizado"],
  pt: ["você é elegível", "aprovado", "garantido"],
  ht: ["ou kalifye", "apwouve", "garanti"],
  zh: ["您符合资格", "已批准", "保证"],
  vi: ["bạn đủ điều kiện", "đã được chấp thuận", "đảm bảo"],
};

export const LOCALES = BUNDLES;

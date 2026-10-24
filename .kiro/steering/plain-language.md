---
inclusion: fileMatch
fileMatchPattern: ["locales/**", "content/**", "components/**", "app/**/*.tsx"]
---

# Plain language and translation rules

- Write at a sixth-grade reading level. Short sentences. Common words. Active voice.
- Talk to the member as "you". Name things the way members do: "your letter", "your papers", "your health center", not "notice artifact" or "case".
- Numbers as digits: "80 hours", "$580", "December 15, 2026".
- Never use these phrases in any language: "you are eligible", "you're eligible", "you qualify", "approved", "guaranteed", "you will keep your coverage". Spanish: "usted es elegible", "aprobado", "garantizado". Portuguese: "você é elegível", "aprovado", "garantido". Haitian Creole: "ou kalifye", "apwouve", "garanti". Chinese: "您符合资格", "已批准", "保证". Vietnamese: "bạn đủ điều kiện", "đã được chấp thuận", "đảm bảo".
- Use instead: "may meet the rule", "may be excused", "MassHealth makes the decision".
- Every locale file has exactly the same keys as `locales/en.json`.
- Translations are drafts until a native speaker reviews them; list them in the README under "Needs review".
- Set the `lang` attribute on any element showing translated text so screen readers and fonts behave.

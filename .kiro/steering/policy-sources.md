---
inclusion: fileMatch
fileMatchPattern: ["lib/rules/**", "tests/**rules**", ".kiro/specs/rules-engine/**"]
---

# Policy sources for the rules engine

#[[file:docs/RULES_SOURCE.md]]

- Every threshold, exemption and timing rule in `lib/rules/` must reference a source id from the table in `docs/RULES_SOURCE.md` (for example `// source: mh-work-req`).
- Every engine result returns `sources: Source[]` with at least one entry.
- Do not invent rules. If the official page is ambiguous, encode the conservative reading, add a `TODO(policy)` comment, and add a note to `docs/RULES_SOURCE.md`.
- The engine is pure: no network, no dates from `Date.now()` inside rule functions (pass dates in), no AI.
- When `docs/RULES_SOURCE.md` changes, update the rules-engine spec requirements first, then the code, then the property tests.

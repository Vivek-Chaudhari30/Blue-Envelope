// Source table mirrored from docs/RULES_SOURCE.md.
// When the official page changes: update docs/RULES_SOURCE.md first, then this file,
// then the rules-engine spec, then the property tests.

import type { Source } from "./types";

export const SOURCES = {
  "mh-work-req": {
    id: "mh-work-req",
    title:
      "New work and education requirements for MassHealth members (published July 21, 2026)",
    url: "https://www.mass.gov/info-details/new-work-and-education-requirements-for-masshealth-members",
    readOn: "2026-10-24",
  },
  "mh-federal": {
    id: "mh-federal",
    title: "MassHealth federal updates and impact",
    url: "https://www.mass.gov/info-details/masshealth-federal-updates-and-impact",
    readOn: "2026-10-24",
  },
  "kff-hardship": {
    id: "kff-hardship",
    title: "KFF: high-unemployment hardship exception",
    url: "https://www.kff.org/medicaid/a-look-at-the-high-unemployment-hardship-exception-to-medicaid-work-requirements-based-on-unemployment-data-from-february-2025-to-january-2026/",
    readOn: "2026-10-24",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

export function source(id: SourceId): Source {
  return SOURCES[id];
}

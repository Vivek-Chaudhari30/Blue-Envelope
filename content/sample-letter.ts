// Sample renewal letter — SYNTHETIC. Rendered as a paper letter with the
// "SAMPLE · NOT AN OFFICIAL NOTICE" watermark. Content is verbatim from
// docs/SAMPLE_CONTENT.md. The highlighted spans map to the four X-Ray pins.

export interface LetterLine {
  /** Plain paragraph with no highlight. */
  text?: string;
  /** A highlighted span: { pin, before, mark, after, due }. */
  highlight?: {
    pin: 1 | 2 | 3 | 4;
    before?: string;
    mark: string;
    after?: string;
    due?: boolean;
  };
}

export interface SampleLetter {
  header: string;
  headerTag: string;
  meta: [string, string];
  greeting: string;
  intro: string;
  lines: LetterLine[];
}

export const SAMPLE_LETTER: SampleLetter = {
  header: "HEALTH COVERAGE RENEWAL",
  headerTag: "SAMPLE",
  meta: ["November 2, 2026", "Maria Santos · Member ID 000-SAMPLE-00"],
  greeting: "Dear Maria,",
  intro:
    "It is time to renew your MassHealth coverage. Starting January 1, 2027, some members must show work, school, volunteering or a job program for at least 80 hours a month, or income of at least $580 a month. We could not confirm this from the information we have.",
  lines: [
    {
      highlight: {
        pin: 1,
        mark: "Please respond by December 15, 2026.",
        after: " If we do not hear from you, your coverage may end.",
        due: true,
      },
    },
    {
      highlight: {
        pin: 2,
        mark: "Tell us about your work, school, volunteering or job training for one month since your last renewal, or tell us if a reason applies that excuses you.",
      },
    },
    {
      highlight: {
        pin: 3,
        mark: "Send proof such as pay stubs, a letter from your employer or volunteer organization, or proof of school enrollment.",
      },
    },
    {
      highlight: {
        pin: 4,
        mark: "You can respond online, by mail, by fax, or by phone",
        after: " using the contact information on this notice.",
      },
    },
  ],
};

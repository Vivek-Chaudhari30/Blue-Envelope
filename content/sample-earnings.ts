// Sample earnings — SYNTHETIC gig-app payouts for March.
// From docs/SAMPLE_CONTENT.md. Total MUST be 612.00 (148.50 + 171.25 + 139.00 + 153.25).

export interface EarningsWeek {
  label: string;
  amount: number;
}

export const SAMPLE_WEEKS: EarningsWeek[] = [
  { label: "Mar 1–7", amount: 148.5 },
  { label: "Mar 8–14", amount: 171.25 },
  { label: "Mar 15–21", amount: 139.0 },
  { label: "Mar 22–31", amount: 153.25 },
];

export const SAMPLE_EARNINGS_TOTAL = SAMPLE_WEEKS.reduce(
  (sum, w) => sum + w.amount,
  0,
); // 612.00

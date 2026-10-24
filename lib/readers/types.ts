// Reader types shared by on-device OCR and the plain-code extractors.

export interface OcrLine {
  id: string;
  text: string;
  bbox: { x: number; y: number; w: number; h: number };
  /** 0..100 per tesseract.js. */
  confidence: number;
}

export type LetterField = "deadline" | "asking" | "send" | "how" | "type";

export interface LetterFields {
  deadline?: { date: string; lineId: string };
  asking?: { lineId: string };
  send?: { lineId: string };
  how?: { lineId: string };
  /** Whether this looks like the standard MassHealth renewal notice. */
  isStandardRenewal: boolean;
  /** Fields the plain-code rules could not fill; candidates for the Luna guide. */
  needsGuide: LetterField[];
}

export interface EarningsWeekRead {
  period: string;
  amount: number;
}

export interface EarningsRead {
  weeks: EarningsWeekRead[];
  total: number;
}

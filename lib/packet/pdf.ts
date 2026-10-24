// On-device packet PDF. Built with pdf-lib — no network, no server, no storage.
// The optional name/memberId are written into the PDF bytes only.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { coverLines, type CoverInput } from "./cover";
import type { EarningsWeek } from "@/content/sample-earnings";

export interface PacketInput extends CoverInput {
  earnings?: { weeks: EarningsWeek[]; total: number };
  partnerHours?: number; // confirmed volunteer hours, if any
}

export async function buildPacketPdf(input: PacketInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.11, 0.14, 0.2);
  const muted = rgb(0.29, 0.34, 0.44);

  // --- Cover page ---
  let page = doc.addPage([612, 792]); // US Letter
  let y = 740;
  const left = 56;
  const draw = (text: string, size = 11, f = font, color = ink) => {
    page.drawText(text, { x: left, y, size, font: f, color });
    y -= size + 7;
  };
  page.drawText("Blue Envelope", { x: left, y, size: 18, font: bold, color: rgb(0.12, 0.31, 0.64) });
  y -= 34;
  for (const line of coverLines(input)) {
    if (line === "") { y -= 8; continue; }
    const isFooter = line.startsWith("Prepared with");
    draw(line, isFooter ? 9 : 11, isFooter ? font : font, isFooter ? muted : ink);
  }

  // --- Earnings page ---
  if (input.earnings && input.earnings.weeks.length) {
    page = doc.addPage([612, 792]);
    y = 740;
    page.drawText("Earnings summary", { x: left, y, size: 15, font: bold, color: ink });
    y -= 30;
    for (const w of input.earnings.weeks) {
      page.drawText(w.label, { x: left, y, size: 11, font, color: ink });
      page.drawText(`$${w.amount.toFixed(2)}`, { x: 360, y, size: 11, font, color: ink });
      y -= 20;
    }
    y -= 6;
    page.drawText("Total", { x: left, y, size: 12, font: bold, color: ink });
    page.drawText(`$${input.earnings.total.toFixed(2)}`, { x: 360, y, size: 12, font: bold, color: ink });
  }

  // --- Partner hours page ---
  if (typeof input.partnerHours === "number" && input.partnerHours > 0) {
    page = doc.addPage([612, 792]);
    y = 740;
    page.drawText("Volunteer hours", { x: left, y, size: 15, font: bold, color: ink });
    y -= 30;
    page.drawText(
      `${input.partnerHours} hours confirmed by Riverside Food Pantry (sample).`,
      { x: left, y, size: 11, font, color: ink },
    );
  }

  return doc.save();
}

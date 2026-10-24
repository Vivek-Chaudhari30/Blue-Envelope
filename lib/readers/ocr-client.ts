"use client";

// On-device OCR. tesseract.js runs in its own Web Worker, lazy-loaded ONLY
// when the member adds a photo. The image is resized to 1600px first. The
// photo NEVER leaves the device, is never stored, and is never logged.

import type { OcrLine } from "./types";

const MAX_DIM = 1600;

/** Resize a data URL / blob URL to max 1600px on the longest side, as a blob. */
async function resize(src: string): Promise<Blob> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/**
 * Run OCR on the device. Lazy-imports tesseract.js (which spawns its own
 * worker) only when called. Returns line-level text, bounding boxes and
 * confidence. Nothing about the image is persisted or logged.
 */
export async function runOcr(src: string): Promise<OcrLine[]> {
  const blob = await resize(src);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(blob, {}, { blocks: true });
    const lines: OcrLine[] = [];
    let i = 0;
    // tesseract.js v7 exposes lines under data.blocks[].paragraphs[].lines[].
    const blocks = (data as unknown as { blocks?: TessBlock[] }).blocks ?? [];
    for (const block of blocks) {
      for (const para of block.paragraphs ?? []) {
        for (const line of para.lines ?? []) {
          lines.push({
            id: `ocr-${i++}`,
            text: line.text.trim(),
            bbox: {
              x: line.bbox.x0,
              y: line.bbox.y0,
              w: line.bbox.x1 - line.bbox.x0,
              h: line.bbox.y1 - line.bbox.y0,
            },
            confidence: line.confidence,
          });
        }
      }
    }
    return lines;
  } finally {
    await worker.terminate();
  }
}

interface TessBBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
interface TessLine {
  text: string;
  confidence: number;
  bbox: TessBBox;
}
interface TessParagraph {
  lines?: TessLine[];
}
interface TessBlock {
  paragraphs?: TessParagraph[];
}

const path = require("node:path");

// Content-Security-Policy. Must allow:
// - the tesseract.js OCR Web Worker (worker-src blob:) and its wasm
//   (script-src 'wasm-unsafe-eval'), loaded from the same origin;
// - Next.js App Router inline bootstrap/hydration scripts. The App Router
//   injects inline <script> tags without a nonce in the default setup, so
//   script-src needs 'unsafe-inline'. (Future hardening: a nonce-based CSP via
//   middleware would let us drop 'unsafe-inline' — tracked in ROADMAP_V2.)
// - next/font (self-hosted fonts -> font-src 'self' data:);
// - inline styles Next injects and CSS-module style attributes (style-src 'unsafe-inline');
// - the app's own API routes and the PDF blob/object URLs (connect/img 'self' blob: data:);
// - the tesseract.js CDN (jsDelivr) for the OCR worker, core wasm and language
//   data. ENGINE CODE ONLY — the user's photo and OCR text never leave the
//   device; OCR runs locally and nothing is uploaded.
const TESSERACT_CDN = "https://cdn.jsdelivr.net";
const isDev = process.env.NODE_ENV !== "production";
// Dev-only relaxations: Next's hot reload / React Refresh use eval and a
// websocket, which the production CSP (correctly) forbids. These apply ONLY to
// `next dev`; the deployed app gets the strict policy below.
const devScript = isDev ? " 'unsafe-eval'" : "";
const devConnect = isDev ? " ws: http://localhost:* http://127.0.0.1:*" : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${devScript} ${TESSERACT_CDN}`,
  `worker-src blob: 'self' ${TESSERACT_CDN}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  `connect-src 'self'${devConnect} ${TESSERACT_CDN}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We detected a parent-directory lockfile; pin tracing to this repo.
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;

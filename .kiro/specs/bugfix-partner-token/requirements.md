# Bugfix — partner token crashes in the browser

## Found
2026-10-24, during Phase B B3 e2e. Clicking "Send sign-off link" on the Proof packet reverted the UI to Home instead of showing "Waiting for Riverside Food Pantry".

## Current (wrong) behavior
`lib/store/partner-token.ts` built the token with Node's `Buffer.from(raw).toString("base64url")`. In the browser bundle, Next's `Buffer` polyfill does **not** support the `"base64url"` encoding, so `makePartnerToken` threw `Unknown encoding: base64url` while rendering the "sent" state. The React render crashed and the flow reset to step 1. Caught by a Playwright `pageerror` listener (`PAGEERROR: Unknown encoding: base64url`); the plain assertion only showed "element not found".

## Expected behavior
`makePartnerToken` / `parsePartnerToken` must work identically in the browser and on the server, with no Node-only encoding. The partner link renders and the sign-off round-trip reaches "confirmed".

## Fix
Replace Node `Buffer` base64url with a runtime-agnostic implementation: encode with `btoa`/`atob` when available (browser) and `Buffer` (base64, then url-safe `+/=` → `-_` stripping) on the server, or a single manual url-safe base64 that runs in both. Keep the token a DEMO handle (not a security boundary), as documented.

## Test
The existing e2e "partner sign-off link reaches confirmed" reproduces it; a `pageerror` listener makes the failure explicit. No new runtime-specific encodings.

# Bugfix — suppression leak via perThousand

## Found
2026-10-24, review of `/api/community`.

## Current (wrong) behavior
The API applied small-cell suppression to `helped` (1–9 → "fewer than 10") but still returned `perThousand` AND `pop2020` for the same town. Because `perThousand = helped / pop2020 * 1000`, a reader recovers the exact suppressed count: e.g. Tyringham `12.232 × 327 / 1000 = 4`. Suppression was defeated.

## Expected behavior
For any town OR county whose count is in 1–9, the API returns **no `perThousand`, no raw count, and nothing else from which the count can be derived**. Only towns with count ≥ 10 are ranked (with numbers). Suppressed-but-nonzero towns are listed **alphabetically** under a "Getting started" group with **no numbers** at all.

## Fix
- In the `/api/community` serializer, split towns into `ranked` (helped ≥ 10, with `helped` + `perThousand`) and `gettingStarted` (1 ≤ helped ≤ 9, name + county only, sorted alphabetically). A suppressed town carries no numeric field.
- Counties: ranked counties keep a count only when ≥ 10; otherwise `helpedDisplay: "fewer than 10"` with no other numeric.

## Test
Property test: for every town the API returns, if it is in the "getting started" (suppressed) group it exposes NO numeric field (no `perThousand`, no `pop2020`, no count), so the count cannot be recovered; and the suppressed towns are in alphabetical order.

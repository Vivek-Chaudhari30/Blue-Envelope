---
inclusion: fileMatch
fileMatchPattern: ["app/**", "components/**", "**/*.css"]
---

# Design system

The reference prototype is the source of truth for look and behavior: #[[file:docs/design-reference/blue-envelope-app.html]]

Port its `:root` tokens, both dark-mode blocks, component styles and screen layouts. When in doubt, open the prototype in a browser and match it.

## Identity

- **Security-envelope tint:** the crosshatch pattern from the prototype's page background (two `repeating-linear-gradient`s at ±45° using `--tint`).
- **Envelope blue** (`--envelope`) is the only accent. Red (`--stamp`) is reserved for deadlines. Green (`--ok`) and amber (`--warn`) are status colors only.
- **Type:** Bricolage Grotesque for headings and big numbers, Public Sans for body, IBM Plex Mono for labels, step counts and figures. The sample letter uses a monospace "typewriter" face on paper-colored `--letter-bg`.
- **Home illustration:** the CSS envelope with a flap, stamp box and address window from the prototype.

## Components (match the prototype)

App bar with back button, "Step N of 6 · name", language picker; 3 px progress bar; primary and secondary 52 px buttons; option buttons with `aria-pressed`; toggles; meters; pills (`ok`, `warn`, `due`); callout cards with numbered pins; due banner; packet items with status icons; "MassHealth makes the decision" dashed note; footer disclaimer.

## Layout

- Phones: the app is the page. Desktop: flow rail on the left (6 numbered steps with description and the technology behind each), phone frame on the right, as in the prototype.
- No horizontal scroll at 360 px. Tap targets at least 44 px. Both light and dark themes must be legible.

// Seeded synthetic navigator panel. Run: npm run generate:panel
// Prints the deterministic panel (seed 2026) as JSON. All data is SYNTHETIC.

import { generatePanel } from "@/lib/panel/generate";

const seed = Number(process.argv[2] ?? 2026);
const panel = generatePanel(seed);
process.stdout.write(JSON.stringify(panel, null, 2) + "\n");
process.stderr.write(
  `Generated ${panel.length} synthetic patients (seed ${seed}). Maria is first.\n`,
);

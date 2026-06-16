import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const p = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");
const raw = readFileSync(p, "utf8");
const start = raw.search(/\n## 3\. /);
const maturity = raw.search(/\n## 12\. Maturity/);
if (start < 0 || maturity < 0) throw new Error("markers not found");

const stub = `## 3. Module reference (source files)

Per-module documentation is authored in \`docs/modules/{moduleId}.md\` (63 files). Each file documents purpose, physics, governing equations, numerical method, inputs/outputs, design-code checks, assumptions, and numbered references. The web site compiles these into the full reference and per-module pages at \`/documentation/modules/{moduleId}\`.

Do **not** duplicate module write-ups in this file — edit the individual module files instead.

`;

writeFileSync(p, raw.slice(0, start) + "\n" + stub + "\n" + raw.slice(maturity));
console.log("trimmed legacy inline module docs:", maturity - start, "chars");

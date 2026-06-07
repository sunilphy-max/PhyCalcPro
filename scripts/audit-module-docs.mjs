/**
 * Audit docs/Modules-Technical-Reference.md module headings and math coverage.
 * Run: node scripts/audit-module-docs.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const REF = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");
const raw = readFileSync(REF, "utf8");

const MODULE_HEADING_RE = /^### .+? \(`([^`]+)`\)/gm;
const ids = [];
let m;
while ((m = MODULE_HEADING_RE.exec(raw)) !== null) {
  ids.push({ id: m[1], index: m.index });
}

const counts = new Map();
for (const entry of ids) {
  counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
}
const dupes = [...counts.entries()].filter(([, c]) => c > 1).map(([id]) => id);

/** Longest chunk wins (matches parseModuleSections in loadReference.ts). */
function resolveModuleSections(markdown) {
  const chunks = markdown.split(/\n(?=### )/);
  const map = new Map();
  for (const chunk of chunks) {
    const idMatch = chunk.match(/^### .+? \(`([^`]+)`\)/);
    if (!idMatch) continue;
    const moduleId = idMatch[1];
    const section = { moduleId, length: chunk.trim().length, title: chunk.split("\n")[0] };
    const existing = map.get(moduleId);
    if (!existing || section.length > existing.length) {
      map.set(moduleId, section);
    }
  }
  return map;
}

const resolved = resolveModuleSections(raw);

console.log("headings found:", ids.length);
console.log("unique module ids (raw):", new Set(ids.map((e) => e.id)).size);
console.log("unique module ids (resolved, longest wins):", resolved.size);
console.log("duplicate ids:", dupes.join(", ") || "none");

for (const id of dupes) {
  const entries = ids.filter((e) => e.id === id);
  const winner = resolved.get(id);
  console.log(`\n  ${id} — ${entries.length} headings; winner (${winner.length} chars):`);
  console.log(`    ${winner.title}`);
  for (const e of entries) {
    const line = raw.slice(0, e.index).split("\n").length;
    const chunkStart = raw.lastIndexOf("\n### ", e.index) + 1;
    const chunkEnd = raw.indexOf("\n### ", e.index + 1);
    const chunk = raw.slice(chunkStart, chunkEnd < 0 ? undefined : chunkEnd).trim();
    const marker = chunk.length === winner.length ? " ← kept" : "";
    console.log(`    line ${line} (${chunk.length} chars)${marker}`);
  }
}

const plainFormula = /^[^$\n]*(?:\\sigma|\\tau|k = |P_\{?cr|\\\\dot )[^$\n]*$/gm;
const plain = [];
let pm;
while ((pm = plainFormula.exec(raw)) !== null) {
  const line = raw.slice(0, pm.index).split("\n").length;
  if (!pm[0].includes("\\(") && !pm[0].includes("\\[") && !pm[0].includes("$")) {
    plain.push({ line, text: pm[0].slice(0, 80) });
  }
}
console.log("\nplain formula-ish lines:", plain.length);
plain.slice(0, 10).forEach((p) => console.log(`  L${p.line}: ${p.text}`));

const allModuleIds = [
  "beams", "frames", "trusses", "columns", "plates", "combined-loading", "load-case-manager", "circular-plates",
  "v-belts", "timing-belts", "roller-chains", "multi-pulley",
  "shafts", "gears", "bearings", "cams", "flywheels", "bevel-gears", "worm-gears", "planetary-gears", "gear-ratio-design", "plain-bearings", "brakes-clutches",
  "compression-springs", "extension-springs", "torsion-springs",
  "bolts", "welds", "rivets", "safety-factor", "keys-splines", "shaft-hubs", "pins",
  "material-db", "sections", "rolled-sections", "composites", "temperature-properties", "fatigue", "corrosion",
  "pipes", "vessels", "hydraulics", "heat-exchangers",
  "vibrations", "rotation", "impact", "suspension",
  "tolerance", "fits", "cost-estimator", "cam-toolpaths",
  "vacuum-engineering", "cryogenic-engineering", "magnetic-fields", "superconducting-systems", "thermal-management", "battery-ev-systems", "hydrogen-systems", "precision-motion",
  "formula-reference", "unit-converter", "profiles",
];

const missing = allModuleIds.filter((id) => !resolved.has(id));
console.log("\nmissing module headings (resolved):", missing.join(", ") || "none");

const harmfulDupes = dupes.filter((id) => {
  const entries = ids.filter((e) => e.id === id);
  const lengths = entries.map((e) => {
    const chunkStart = raw.lastIndexOf("\n### ", e.index) + 1;
    const chunkEnd = raw.indexOf("\n### ", e.index + 1);
    return raw.slice(chunkStart, chunkEnd < 0 ? undefined : chunkEnd).trim().length;
  });
  return Math.max(...lengths) !== Math.min(...lengths);
});
console.log("harmful dupes (unequal length):", harmfulDupes.join(", ") || "none");

if (missing.length > 0) {
  process.exitCode = 1;
}

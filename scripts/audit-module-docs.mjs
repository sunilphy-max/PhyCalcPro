/**
 * Audit module documentation in docs/modules/*.md and compiled reference.
 * Run: node scripts/audit-module-docs.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const MODULES_DIR = path.join(process.cwd(), "docs", "modules");
const REF = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");

const MODULE_HEADING_RE = /^### .+? \(`([^`]+)`\)/;

const REQUIRED_SECTIONS = [
  "**Purpose**",
  "**Physics & theory**",
  "**Governing equations**",
  "**Numerical method**",
  "**Inputs**",
  "**Outputs**",
  "**Design codes & checks**",
  "**Assumptions & limitations**",
  "**References**",
];

const allModuleIds = [
  "beams", "frames", "trusses", "columns", "plates", "combined-loading", "load-case-manager", "circular-plates",
  "v-belts", "timing-belts", "roller-chains", "multi-pulley",
  "shafts", "gears", "bearings", "cams", "flywheels", "bevel-gears", "worm-gears", "planetary-gears", "gear-ratio-design", "plain-bearings", "brakes-clutches",
  "compression-springs", "extension-springs", "torsion-springs",
  "bolts", "welds", "rivets", "safety-factor", "keys-splines", "shaft-hubs", "pins",
  "material-db", "sections", "rolled-sections", "profiles", "composites", "temperature-properties", "fatigue", "corrosion",
  "pipes", "vessels", "hydraulics", "heat-exchangers",
  "vibrations", "rotation", "impact", "suspension",
  "tolerance", "fits", "cost-estimator", "cam-toolpaths",
  "vacuum-engineering", "cryogenic-engineering", "magnetic-fields", "superconducting-systems", "thermal-management", "battery-ev-systems", "hydrogen-systems", "precision-motion",
  "formula-reference", "unit-converter",
];

function auditModuleFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const idMatch = content.match(MODULE_HEADING_RE);
  if (!idMatch) return { ok: false, error: "missing heading" };
  const missing = REQUIRED_SECTIONS.filter((s) => !content.includes(s));
  const hasDisplayMath = /\\\[/.test(content) || /\n\$\$/.test(content);
  const mathIssues = [];
  if (/\\mathrm\{[^}]*\\ /.test(content)) {
    mathIssues.push("invalid \\mathrm{...\\ ...} (backslash-space inside \\mathrm)");
  }
  if (/\\(?:\(|\[)[\s\S]*?[→←][\s\S]*?\\(?:\)|\])/.test(content)) {
    mathIssues.push("unicode arrow inside math delimiters");
  }
  if (/\\mathrm\{[^}]*→/.test(content)) {
    mathIssues.push("unicode arrow inside \\mathrm{}");
  }
  return {
    ok: missing.length === 0 && hasDisplayMath && mathIssues.length === 0,
    moduleId: idMatch[1],
    missing,
    hasDisplayMath,
    mathIssues,
    length: content.length,
  };
}

const files = existsSync(MODULES_DIR)
  ? readdirSync(MODULES_DIR).filter((f) => f.endsWith(".md"))
  : [];

const byId = new Map();
for (const file of files) {
  const result = auditModuleFile(path.join(MODULES_DIR, file));
  if (result.moduleId) byId.set(result.moduleId, { ...result, file });
}

console.log("module files:", files.length);
console.log("unique module ids:", byId.size);

const missing = allModuleIds.filter((id) => !byId.has(id));
console.log("missing module files:", missing.join(", ") || "none");

const incomplete = [...byId.values()].filter((r) => !r.ok);
if (incomplete.length) {
  console.log("\nincomplete files:");
  for (const r of incomplete) {
    console.log(
      `  ${r.file}: missing=${r.missing.join(", ") || "none"} math=${r.hasDisplayMath}` +
        (r.mathIssues?.length ? ` mathIssues=${r.mathIssues.join("; ")}` : "")
    );
  }
}

const dupes = files
  .map((f) => f.replace(/\.md$/, ""))
  .filter((id, i, arr) => arr.indexOf(id) !== i);
console.log("duplicate filenames:", dupes.join(", ") || "none");

// Legacy monolith should not contain inline module headings beyond stub
const monolith = readFileSync(REF, "utf8");
const inlineIds = [];
let m;
const inlineRe = /^### .+? \(`([^`]+)`\)/gm;
while ((m = inlineRe.exec(monolith)) !== null) {
  inlineIds.push(m[1]);
}
console.log("inline module headings in monolith:", inlineIds.length, inlineIds.length ? "(should be 0)" : "(ok)");

if (missing.length > 0 || incomplete.length > 0 || inlineIds.length > 0) {
  process.exitCode = 1;
}

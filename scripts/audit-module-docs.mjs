/**
 * Audit module documentation in docs/modules/*.md and compiled reference.
 * Run: node scripts/audit-module-docs.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const MODULES_DIR = path.join(process.cwd(), "docs", "modules");
const REF = path.join(process.cwd(), "docs", "Modules-Technical-Reference.md");

const MODULE_HEADING_RE = /^### .+? \(`([^`]+)`\)/m;

const REQUIRED_TECHNICAL = [
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

const REQUIRED_KNOWLEDGE = [
  "## Engineering workflow",
  "## Key quantities and formulas",
  "## Worked example",
  "## Common mistakes and checks",
  "## FAQ",
  "## Use the PhyCalcPro calculator",
];

const REQUIRED_FRONTMATTER = ["seoTitle:", "seoDescription:", "guideHeadline:"];

/** Live catalog module ids (must have docs). Obsolete ids intentionally omitted. */
const allModuleIds = [
  "beams",
  "frames",
  "trusses",
  "columns",
  "plates",
  "combined-loading",
  "circular-plates",
  "shells",
  "v-belts",
  "timing-belts",
  "roller-chains",
  "multi-pulley",
  "shafts",
  "gears",
  "internal-gears-rack",
  "bearings",
  "cams",
  "flywheels",
  "bevel-gears",
  "worm-gears",
  "planetary-gears",
  "gear-ratio-design",
  "plain-bearings",
  "brakes-clutches",
  "power-screws",
  "housing",
  "compression-springs",
  "extension-springs",
  "torsion-springs",
  "bolts",
  "welds",
  "rivets",
  "keys-splines",
  "shaft-hubs",
  "pins",
  "material-db",
  "sections",
  "rolled-sections",
  "profiles",
  "composites",
  "temperature-properties",
  "fatigue",
  "corrosion",
  "pipes",
  "vessels",
  "hydraulics",
  "heat-exchangers",
  "vibrations",
  "rotation",
  "motor",
  "impact",
  "suspension",
  "tolerance",
  "fits",
  "cost-estimator",
  "cam-toolpaths",
  "vacuum-engineering",
  "cryogenic-engineering",
  "magnetic-fields",
  "superconducting-systems",
  "thermal-management",
  "battery-ev-systems",
  "hydrogen-systems",
  "precision-motion",
  "unit-converter",
];

const SKIP_FILES = new Set(["bearings-suite-audit.md", "spring-modules-user-tasks.md"]);

function stripFrontmatter(content) {
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    return { frontmatter: "", body: content };
  }
  const endMatch = content.match(/\n---\r?\n/);
  if (!endMatch || endMatch.index === undefined) {
    return { frontmatter: "", body: content };
  }
  return {
    frontmatter: content.slice(0, endMatch.index + endMatch[0].length),
    body: content.slice(endMatch.index + endMatch[0].length),
  };
}

function auditModuleFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const { frontmatter, body } = stripFrontmatter(content);
  const idMatch = body.match(MODULE_HEADING_RE) || content.match(MODULE_HEADING_RE);
  if (!idMatch) return { ok: false, error: "missing heading", missing: ["heading"] };

  const missing = [
    ...REQUIRED_FRONTMATTER.filter((s) => !frontmatter.includes(s)).map((s) => `fm:${s}`),
    ...REQUIRED_KNOWLEDGE.filter((s) => !body.includes(s) && !content.includes(s)),
    ...REQUIRED_TECHNICAL.filter((s) => !body.includes(s) && !content.includes(s)),
  ];

  const hasDisplayMath = /\\\[/.test(content) || /\n\$\$/.test(content);
  const mathIssues = [];
  if (/\\mathrm\{[^}]*\\ /.test(content)) {
    mathIssues.push("invalid \\mathrm{...\\ ...} (backslash-space inside \\mathrm)");
  }
  // Only inspect content inside matched math delimiters (avoid prose between equations)
  for (const match of content.matchAll(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$/g)) {
    const body = match[1] ?? match[2] ?? match[3] ?? "";
    if (/[→←]/.test(body)) {
      mathIssues.push("unicode arrow inside math delimiters");
      break;
    }
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
  ? readdirSync(MODULES_DIR).filter((f) => f.endsWith(".md") && !SKIP_FILES.has(f))
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

const monolith = readFileSync(REF, "utf8");
const inlineIds = [];
let m;
const inlineRe = /^### .+? \(`([^`]+)`\)/gm;
while ((m = inlineRe.exec(monolith)) !== null) {
  inlineIds.push(m[1]);
}
console.log(
  "inline module headings in monolith:",
  inlineIds.length,
  inlineIds.length ? "(should be 0)" : "(ok)"
);

if (missing.length > 0 || incomplete.length > 0 || inlineIds.length > 0) {
  process.exitCode = 1;
}

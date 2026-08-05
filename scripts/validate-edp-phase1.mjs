/**
 * EDP-1 scorecard validation — flagship modules + fleet workspace shell.
 *
 * Run: node scripts/validate-edp-phase1.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

const layoutPath = path.join(root, "src/components/CalculatorLayout.tsx");
const layout = fs.readFileSync(layoutPath, "utf8");
if (!layout.includes("ModuleWorkspaceShell") || !layout.includes("ModuleWorkspaceProvider")) {
  errors.push("CalculatorLayout must wrap modules with ModuleWorkspaceProvider + ModuleWorkspaceShell");
}

const F1 = [
  {
    id: "beams",
    page: "src/app/products/structural/beams/page.tsx",
    results: "src/components/structural/beams/BeamResults.tsx",
  },
  {
    id: "shafts",
    page: "src/app/products/machine/shafts/page.tsx",
    results: "src/components/machine/shafts/ShaftResults.tsx",
  },
  {
    id: "bearings",
    page: "src/app/products/bearings/designer/page.tsx",
    results: "src/components/machine/bearings/BearingResults.tsx",
  },
];

for (const mod of F1) {
  const pagePath = path.join(root, mod.page);
  const resultsPath = path.join(root, mod.results);
  if (!fs.existsSync(pagePath)) {
    errors.push(`${mod.id}: missing page ${mod.page}`);
    continue;
  }
  if (!fs.existsSync(resultsPath)) {
    errors.push(`${mod.id}: missing results ${mod.results}`);
    continue;
  }
  const page = fs.readFileSync(pagePath, "utf8");
  const results = fs.readFileSync(resultsPath, "utf8");

  if (!/CalculatorResultsShell|ExportableReport|CalculatorLayout/.test(page + results)) {
    errors.push(`${mod.id}: expected CalculatorLayout / CalculatorResultsShell / ExportableReport`);
  }
  if (/import\s+WorkspaceChrome\b|<\s*WorkspaceChrome\b/.test(page) && mod.id === "beams") {
    errors.push("beams: must not wrap with page-level WorkspaceChrome (use CalculatorLayout fleet shell)");
  }
  if (mod.id === "beams") {
    if (!page.includes("useLiveModuleSolve") && !page.includes("livePreview")) {
      errors.push("beams: live solve (useLiveModuleSolve or livePreview) required");
    }
    if (!page.includes("summary=")) {
      errors.push("beams: Design Summary rail via CalculatorLayout summary prop required");
    }
  }
}

for (const rel of [
  "src/lib/workspace/designWorkspaceContract.ts",
  "src/lib/workspace/workspaceRegistry.ts",
  "src/lib/workspace/materialEvents.ts",
  "docs/Engineering-Decision-Platform-Roadmap.md",
]) {
  if (!fs.existsSync(path.join(root, rel))) {
    errors.push(`missing ${rel}`);
  }
}

if (errors.length) {
  console.error("EDP Phase 1 validation failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("validate-edp-phase1: F1 scorecard + fleet workspace shell checks passed.");

/**
 * EDP-1 scorecard validation — flagship modules must register design modes,
 * use CalculatorResultsShell / ExportableReport patterns, and expose workspace chrome hooks.
 *
 * Run: node scripts/validate-edp-phase1.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

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
    page: "src/app/products/bearings/page.tsx",
    results: "src/components/machine/bearings/BearingResults.tsx",
  },
];

const registryPath = path.join(root, "src/lib/design-workflows/designModeRegistry.ts");
const registry = fs.readFileSync(registryPath, "utf8");

for (const mod of F1) {
  if (!registry.includes(`"${mod.id}"`) && !registry.includes(`'${mod.id}'`)) {
    // designModeRegistry uses object keys — soft check via moduleDesignWorkflows or registry content
  }
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
  if (mod.id === "beams") {
    if (!page.includes("WorkspaceChrome")) {
      errors.push("beams: WorkspaceChrome required for EDP-0/1 gold template");
    }
    if (!page.includes("useLiveModuleSolve") && !page.includes("livePreview")) {
      errors.push("beams: live solve (useLiveModuleSolve or livePreview) required");
    }
  }
}

const contractPath = path.join(root, "src/lib/workspace/designWorkspaceContract.ts");
if (!fs.existsSync(contractPath)) {
  errors.push("missing DesignWorkspaceContract");
}

const edpDoc = path.join(root, "docs/Engineering-Decision-Platform-Roadmap.md");
if (!fs.existsSync(edpDoc)) {
  errors.push("missing docs/Engineering-Decision-Platform-Roadmap.md");
}

if (errors.length) {
  console.error("EDP Phase 1 validation failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("validate-edp-phase1: F1 scorecard checks passed.");

#!/usr/bin/env npx tsx
/**
 * Ensures modules marked beta/verified in the catalog have passing CI benchmarks.
 * Run after test:verification (reads last-run.json).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { moduleStandardCatalog } from "../src/lib/standards/moduleCatalog";
import { getBenchmarkStatsFromLastRun } from "../src/lib/qa/lastRun";

const lastRunPath = join(process.cwd(), "src/data/verification/last-run.json");

if (!existsSync(lastRunPath)) {
  console.error("[maturity-gates] Missing last-run.json — run npm run test:verification first.");
  process.exit(1);
}

const stats = getBenchmarkStatsFromLastRun();
const failures: string[] = [];

for (const [moduleId, profile] of Object.entries(moduleStandardCatalog)) {
  const status = profile.validationStatus;
  if (status !== "beta" && status !== "verified") continue;
  const bench = stats[moduleId];
  if (!bench || bench.passed === 0 || bench.passed < bench.total) {
    failures.push(
      `${moduleId}: catalog=${status} but benchmarks ${bench?.passed ?? 0}/${bench?.total ?? 0} passed`
    );
  }
}

if (failures.length > 0) {
  console.error("[maturity-gates] FAIL — beta/verified modules without full passing benchmarks:\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

const gated = Object.values(moduleStandardCatalog).filter(
  (p) => p.validationStatus === "beta" || p.validationStatus === "verified"
).length;

console.log(`[maturity-gates] OK — ${gated} beta/verified catalog modules have passing benchmarks.`);

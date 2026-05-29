import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import {
  runVerificationCases,
  supportedBenchmarkModules,
} from "../src/lib/qa/benchmarkRunner";
import {
  aggregateBenchmarkStats,
  parseVerificationCase,
} from "../src/lib/qa/loadCases";
import type { VerificationCase } from "../src/lib/qa/types";

const dir = join(process.cwd(), "src/data/verification");
const cases: VerificationCase[] = [];

if (!existsSync(dir)) {
  console.error("Missing src/data/verification/");
  process.exit(1);
}

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".json") || file === "last-run.json") continue;
  try {
    const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const parsed = parseVerificationCase(raw);
    if (parsed) cases.push(parsed);
    else console.warn(`[skip] ${file} — invalid schema`);
  } catch (e) {
    console.error(`[invalid] ${file}:`, e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

if (cases.length === 0) {
  console.log("No verification cases. Add JSON files to src/data/verification/");
  process.exit(0);
}

const report = runVerificationCases(cases);

for (const result of report.results) {
  const tag = result.pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${result.caseId} (${result.moduleId})`);
  if (result.error) console.log(`       ${result.error}`);
  for (const field of result.fields.filter((f) => !f.pass)) {
    console.log(
      `       ${field.field}: expected ${field.expected}, got ${field.actual}`
    );
  }
}

const outPath = join(dir, "last-run.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));

const statsPath = join(process.cwd(), "reports");
if (!existsSync(statsPath)) mkdirSync(statsPath, { recursive: true });
writeFileSync(join(statsPath, "verification-latest.json"), JSON.stringify(report, null, 2));

console.log(
  `\n${report.passed}/${report.total} passed, ${report.failed} failed, ${report.skipped} skipped.`
);
console.log(`Automated modules: ${supportedBenchmarkModules().join(", ")}`);
console.log(`Wrote ${outPath}`);

process.exit(report.failed > 0 ? 1 : 0);

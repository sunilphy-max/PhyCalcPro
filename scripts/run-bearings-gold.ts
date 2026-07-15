/**
 * CLI runner for bearings gold / screening-reference cases.
 * Pending vendor cases are skipped (pass). Active cases need expect in JSON
 * under src/data/verification/bearings-gold, or use vitest bearingsGold.test.ts
 * for self-snapshot screening gates.
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { runAllBearingsGold } from "../src/lib/qa/bearingsGold";
import { BEARINGS_GOLD_SEEDS } from "../src/lib/qa/bearingsGoldCases";
import { runBearingsGoldCase, type BearingsGoldCase } from "../src/lib/qa/bearingsGold";
import { solveBearingEngine } from "../src/lib/machine/bearings/engine";

const MATERIAL = {
  name: "Bearing steel",
  dynamicRatingFactor: 1,
  staticRatingFactor: 1,
  allowableLife: 1e6,
};

function snapshotExpect(inputs: Record<string, unknown>) {
  const ov = inputs.ratingsOverride as
    | {
        enabled: boolean;
        dynamicLoadRatingN?: number;
        staticLoadRatingN?: number;
        fatigueLoadLimitN?: number;
      }
    | undefined;
  const r = solveBearingEngine({
    radialLoad: Number(inputs.radialLoad ?? 0),
    axialLoad: Number(inputs.axialLoad ?? 0),
    speed: Number(inputs.speed ?? 1500),
    lifeHours: Number(inputs.lifeHours ?? 20000),
    safetyFactor: Number(inputs.safetyFactor ?? 1.5),
    bearingType: (inputs.bearingType as "deep_groove") ?? "deep_groove",
    designation: inputs.designation as string | undefined,
    lubricantType: (inputs.lubricantType as "oil" | "grease") ?? "oil",
    isoVgGrade: Number(inputs.isoVgGrade ?? 68),
    operatingTempC: Number(inputs.operatingTempC ?? 70),
    contamination: (inputs.contamination as "normal_clean") ?? "normal_clean",
    reliabilityPercent: (Number(inputs.reliabilityPercent ?? 90) as 90 | 95 | 96 | 97 | 98 | 99),
    ratingsOverride: ov?.enabled ? ov : undefined,
    material: MATERIAL,
  });
  return {
    modifiedLife: Number(r.modifiedLife.toFixed(2)),
    expectedLife: Number(r.expectedLife.toFixed(2)),
    equivalentLoad: Number(r.equivalentLoad.toFixed(2)),
    staticSafetyFactor: Number(r.staticSafetyFactor.toFixed(4)),
    aIso: Number(r.aIso.toFixed(4)),
    dynamicUtilization: Number(r.dynamicUtilization.toFixed(4)),
  };
}

const fromDisk = runAllBearingsGold();
const seedResults = BEARINGS_GOLD_SEEDS.map((seed) => {
  const c: BearingsGoldCase = {
    id: seed.id,
    source: seed.source,
    kind: seed.kind,
    status: seed.status,
    tolerancePct: seed.tolerancePct ?? 2,
    inputs: seed.inputs,
    expect:
      seed.status === "pending_vendor_gold"
        ? (seed.expect ?? { modifiedLife: 0 })
        : snapshotExpect(seed.inputs),
  };
  return runBearingsGoldCase(c);
});

const results = [...fromDisk.results, ...seedResults.filter((r) => !fromDisk.results.some((d) => d.id === r.id))];
const passed = results.filter((r) => r.pass && !r.skipped).length;
const failed = results.filter((r) => !r.pass && !r.skipped).length;
const skipped = results.filter((r) => r.skipped).length;

for (const result of results) {
  const tag = result.skipped ? "SKIP" : result.pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${result.id}`);
  if (result.reason) console.log(`       ${result.reason}`);
  for (const field of result.fields.filter((f) => !f.pass)) {
    console.log(
      `       ${field.field}: expected ${field.expected}, got ${field.actual} (±${field.relErrorPct.toFixed(2)}%)`
    );
  }
}

const reports = join(process.cwd(), "reports");
if (!existsSync(reports)) mkdirSync(reports, { recursive: true });
writeFileSync(
  join(reports, "bearings-gold-latest.json"),
  JSON.stringify({ passed, failed, skipped, results }, null, 2)
);

console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped (vendor pending).`);
process.exit(failed > 0 ? 1 : 0);

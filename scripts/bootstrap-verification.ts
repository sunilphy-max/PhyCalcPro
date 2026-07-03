#!/usr/bin/env npx tsx
/**
 * Bootstrap verification JSON files from VERIFICATION_SEEDS.
 * Skips files that already exist. Overwrite with --force
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getModuleSolver } from "../src/lib/qa/moduleSolverRegistry";
import { VERIFICATION_SEEDS } from "../src/lib/qa/verificationSeeds";

const dir = join(process.cwd(), "src/data/verification");
const force = process.argv.includes("--force");

function existingIds(): Set<string> {
  const ids = new Set<string>();
  if (!existsSync(dir)) return ids;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json") || file === "last-run.json") continue;
    try {
      const raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
      if (raw.id) ids.add(raw.id);
    } catch {
      /* skip */
    }
  }
  return ids;
}

const existing = existingIds();
let created = 0;
let skipped = 0;

for (const seed of VERIFICATION_SEEDS) {
  const path = join(dir, `${seed.id}.json`);
  if (existing.has(seed.id) && !force) {
    skipped++;
    continue;
  }

  const solver = getModuleSolver(seed.moduleId);
  if (!solver) {
    console.warn(`[skip] No solver for ${seed.moduleId}`);
    continue;
  }

  try {
    const result = solver(seed.inputs);
    const expected: Record<string, number> = {};
    for (const field of seed.fields) {
      const v = result[field];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new Error(`Field ${field} missing or non-numeric`);
      }
      expected[field] = v;
    }

    const payload = {
      id: seed.id,
      moduleId: seed.moduleId,
      designCode: "INDICATIVE",
      description: seed.description,
      inputs: seed.inputs,
      expected,
      tolerancePercent: seed.tolerancePercent ?? 5,
      source: seed.source ?? "PhyCalcPro bootstrap — replace with worksheet reference",
    };

    writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
    console.log(`[created] ${seed.id}.json`);
    created++;
  } catch (e) {
    console.error(`[fail] ${seed.id}:`, e instanceof Error ? e.message : e);
  }
}

console.log(`\nDone: ${created} created, ${skipped} skipped (already exist).`);

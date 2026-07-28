#!/usr/bin/env tsx
/**
 * Ensures product pages do not define local MATERIALS maps — use central catalog instead.
 * Also verifies every catalog grade has a complete encyclopedia datasheet.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { materials } from "../src/data/materials";
import { materialDatasheets } from "../src/data/materialDatasheets";
import { materialUseCases } from "../src/data/materialUseCases";

const ROOT = join(process.cwd(), "src", "app", "products");
const FORBIDDEN = /const\s+MATERIALS\s*:\s*Record/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const violations: string[] = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  if (FORBIDDEN.test(text)) {
    violations.push(file.replace(process.cwd(), "").replace(/\\/g, "/"));
  }
}

if (violations.length > 0) {
  console.error("Local MATERIALS maps found (use @/data/materials instead):");
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

const datasheetErrors: string[] = [];
if (Object.keys(materialDatasheets).length !== materials.length) {
  datasheetErrors.push(
    `Coverage ${Object.keys(materialDatasheets).length} datasheets vs ${materials.length} materials`
  );
}
for (const m of materials) {
  const sheet = materialDatasheets[m.id];
  if (!sheet) {
    datasheetErrors.push(`Missing datasheet: ${m.id}`);
    continue;
  }
  if (!sheet.summary?.trim()) datasheetErrors.push(`${m.id}: empty summary`);
  if (!sheet.applications?.length) datasheetErrors.push(`${m.id}: empty applications`);
  if (!sheet.advantages?.length) datasheetErrors.push(`${m.id}: empty advantages`);
  if (!sheet.limitations?.length) datasheetErrors.push(`${m.id}: empty limitations`);
  for (const alt of sheet.alternativeIds ?? []) {
    if (!materials.some((x) => x.id === alt)) {
      datasheetErrors.push(`${m.id}: invalid alternativeId ${alt}`);
    }
  }
}

for (const useCase of materialUseCases) {
  for (const rec of useCase.recommendations) {
    if (!materials.some((m) => m.id === rec.materialId)) {
      datasheetErrors.push(`use-case ${useCase.id}: missing material ${rec.materialId}`);
    }
  }
}

if (datasheetErrors.length > 0) {
  console.error("Material encyclopedia coverage errors:");
  for (const e of datasheetErrors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `validate-materials: OK — no local MATERIALS maps; ${materials.length} complete datasheets; ${materialUseCases.length} use cases.`
);

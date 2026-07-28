#!/usr/bin/env tsx
/**
 * Validates every catalog material has a complete encyclopedia datasheet.
 */
import { materials, type MaterialCategory } from "../src/data/materials";
import { materialDatasheets } from "../src/data/materialDatasheets";

const requiredArrays: Array<keyof (typeof materialDatasheets)[string]> = [
  "applications",
  "advantages",
  "limitations",
];

const errors: string[] = [];

for (const m of materials) {
  const sheet = materialDatasheets[m.id];
  if (!sheet) {
    errors.push(`Missing datasheet: ${m.id}`);
    continue;
  }
  if (!sheet.summary?.trim()) errors.push(`${m.id}: empty summary`);
  for (const key of requiredArrays) {
    const arr = sheet[key];
    if (!Array.isArray(arr) || arr.length === 0) {
      errors.push(`${m.id}: empty ${String(key)}`);
    }
  }
  if (!sheet.physicalNotes?.trim() && !sheet.formSupply?.trim()) {
    errors.push(`${m.id}: missing physicalNotes/formSupply`);
  }
  for (const alt of sheet.alternativeIds ?? []) {
    if (!materials.some((x) => x.id === alt)) {
      errors.push(`${m.id}: invalid alternativeId ${alt}`);
    }
  }
}

if (materials.length !== Object.keys(materialDatasheets).length) {
  errors.push(
    `Coverage mismatch: ${materials.length} materials vs ${Object.keys(materialDatasheets).length} datasheets`
  );
}

const byCat: Partial<Record<MaterialCategory, number>> = {};
for (const m of materials) {
  byCat[m.category] = (byCat[m.category] ?? 0) + 1;
}

if (errors.length) {
  console.error("bootstrap-material-datasheets: FAILED");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `bootstrap-material-datasheets: OK — ${materials.length} complete datasheets across ${Object.keys(byCat).length} categories.`
);

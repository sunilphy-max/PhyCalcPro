/**
 * Bearing gold / screening-reference benchmark harness.
 * Vendor ±5% cases use status "pending_vendor_gold" until SKF/MITCalc values are pasted.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import type { BearingConfig, BearingResult } from "@/lib/machine/bearings/types";

export type BearingsGoldCase = {
  id: string;
  source: string;
  /** screening_reference | vendor_skf | vendor_mitcalc */
  kind: "screening_reference" | "vendor_skf" | "vendor_mitcalc";
  status: "active" | "pending_vendor_gold";
  tolerancePct: number;
  inputs: Record<string, unknown>;
  expect: Partial<{
    modifiedLife: number;
    expectedLife: number;
    equivalentLoad: number;
    staticSafetyFactor: number;
    aIso: number;
    dynamicUtilization: number;
  }>;
};

export type GoldFieldResult = {
  field: string;
  expected: number;
  actual: number;
  pass: boolean;
  relErrorPct: number;
};

export type GoldCaseResult = {
  id: string;
  pass: boolean;
  skipped: boolean;
  reason?: string;
  fields: GoldFieldResult[];
};

const MATERIAL = {
  name: "Bearing steel",
  dynamicRatingFactor: 1,
  staticRatingFactor: 1,
  allowableLife: 1e6,
};

function withinTol(expected: number, actual: number, tolPct: number): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  if (expected === 0) return Math.abs(actual) < 1e-9;
  return (Math.abs(actual - expected) / Math.abs(expected)) * 100 <= tolPct;
}

function toConfig(inputs: Record<string, unknown>): BearingConfig {
  const ov = inputs.ratingsOverride as BearingConfig["ratingsOverride"] | undefined;
  return {
    radialLoad: Number(inputs.radialLoad ?? 0),
    axialLoad: Number(inputs.axialLoad ?? 0),
    speed: Number(inputs.speed ?? 1500),
    lifeHours: Number(inputs.lifeHours ?? 20000),
    safetyFactor: Number(inputs.safetyFactor ?? 1.5),
    bearingType: (inputs.bearingType as BearingConfig["bearingType"]) ?? "deep_groove",
    designation: inputs.designation as string | undefined,
    dynamicLoadRatingN: inputs.dynamicLoadRatingN as number | undefined,
    staticLoadRatingN: inputs.staticLoadRatingN as number | undefined,
    fatigueLoadLimitN: inputs.fatigueLoadLimitN as number | undefined,
    ratingsOverride: ov?.enabled ? ov : undefined,
    lubricantType: (inputs.lubricantType as BearingConfig["lubricantType"]) ?? "oil",
    isoVgGrade: Number(inputs.isoVgGrade ?? 68),
    operatingTempC: Number(inputs.operatingTempC ?? 70),
    contamination:
      (inputs.contamination as BearingConfig["contamination"]) ?? "normal_clean",
    reliabilityPercent: (Number(inputs.reliabilityPercent ?? 90) as 90 | 95 | 96 | 97 | 98 | 99),
    material: MATERIAL,
  };
}

function pickActual(result: BearingResult, field: string): number | undefined {
  switch (field) {
    case "modifiedLife":
      return result.modifiedLife;
    case "expectedLife":
      return result.expectedLife;
    case "equivalentLoad":
      return result.equivalentLoad;
    case "staticSafetyFactor":
      return result.staticSafetyFactor;
    case "aIso":
      return result.aIso;
    case "dynamicUtilization":
      return result.dynamicUtilization;
    default:
      return undefined;
  }
}

export function loadBearingsGoldCases(dir?: string): BearingsGoldCase[] {
  const root = dir ?? join(process.cwd(), "src/data/verification/bearings-gold");
  if (!existsSync(root)) return [];
  const cases: BearingsGoldCase[] = [];
  for (const file of readdirSync(root)) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(join(root, file), "utf8")) as BearingsGoldCase;
    if (raw?.id && raw?.inputs && raw?.expect) cases.push(raw);
  }
  return cases;
}

export function runBearingsGoldCase(c: BearingsGoldCase): GoldCaseResult {
  if (c.status === "pending_vendor_gold") {
    return { id: c.id, pass: true, skipped: true, reason: "pending_vendor_gold", fields: [] };
  }
  try {
    const result = solveBearingEngine(toConfig(c.inputs));
    const fields: GoldFieldResult[] = [];
    for (const [field, expected] of Object.entries(c.expect)) {
      if (expected == null || typeof expected !== "number") continue;
      const actual = pickActual(result, field);
      if (actual == null) {
        fields.push({
          field,
          expected,
          actual: NaN,
          pass: false,
          relErrorPct: Infinity,
        });
        continue;
      }
      const relErrorPct =
        expected === 0 ? Math.abs(actual) : (Math.abs(actual - expected) / Math.abs(expected)) * 100;
      fields.push({
        field,
        expected,
        actual,
        pass: withinTol(expected, actual, c.tolerancePct),
        relErrorPct,
      });
    }
    return { id: c.id, pass: fields.every((f) => f.pass), skipped: false, fields };
  } catch (e) {
    return {
      id: c.id,
      pass: false,
      skipped: false,
      reason: e instanceof Error ? e.message : String(e),
      fields: [],
    };
  }
}

export function runAllBearingsGold(dir?: string): {
  passed: number;
  failed: number;
  skipped: number;
  results: GoldCaseResult[];
} {
  const cases = loadBearingsGoldCases(dir);
  const results = cases.map(runBearingsGoldCase);
  return {
    passed: results.filter((r) => r.pass && !r.skipped).length,
    failed: results.filter((r) => !r.pass && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
  };
}

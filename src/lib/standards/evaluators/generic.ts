import type { DesignCodeId, EngineeringCheck } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck, makeUtilizationCheck } from "../buildSpec";
import type { CalculationSpec } from "../types";
import { getModuleStandardProfile } from "../moduleCatalog";

type ResultRecord = Record<string, unknown>;

const RESULT_TO_CHECK: Record<string, { checkId: string; kind: "safety_factor" | "utilization" }> = {
  safetyFactor: { checkId: "bending_strength", kind: "safety_factor" },
  contactSafetyFactor: { checkId: "contact_strength", kind: "safety_factor" },
  safetyFactorYield: { checkId: "von_mises_yield", kind: "safety_factor" },
  safetyFactorUltimate: { checkId: "von_mises_ultimate", kind: "safety_factor" },
  governingFactor: { checkId: "von_mises_yield", kind: "safety_factor" },
  safetyFactorOverall: { checkId: "shear", kind: "safety_factor" },
  safetyFactorShear: { checkId: "shear", kind: "safety_factor" },
  safetyFactorAxial: { checkId: "tensile", kind: "safety_factor" },
  safetyFactorBearing: { checkId: "bearing", kind: "safety_factor" },
  bucklingSafetyFactor: { checkId: "buckling_utilization", kind: "safety_factor" },
  criticalLoadFactor: { checkId: "euler_critical", kind: "safety_factor" },
  criticalSpeedMargin: { checkId: "critical_speed", kind: "safety_factor" },
  deflectionUtilization: { checkId: "deflection", kind: "utilization" },
  lifeUtilization: { checkId: "life_l10", kind: "utilization" },
  dynamicUtilization: { checkId: "dynamic_capacity", kind: "utilization" },
  staticSafetyFactor: { checkId: "static_capacity", kind: "safety_factor" },
  speedMargin: { checkId: "speed_limit", kind: "safety_factor" },
  fatigueSafetyFactor: { checkId: "fatigue", kind: "safety_factor" },
  stressUtilization: { checkId: "shear_stress", kind: "utilization" },
  surgeMargin: { checkId: "surge_margin", kind: "safety_factor" },
  hookSafetyFactor: { checkId: "hook_stress", kind: "safety_factor" },
  bodySafetyFactor: { checkId: "shear_stress", kind: "safety_factor" },
  safetyFactorResultant: { checkId: "von_mises", kind: "safety_factor" },
  fatigueUtilization: { checkId: "fatigue_life", kind: "utilization" },
};

const MODULE_FIELD_OVERRIDES: Record<string, Record<string, string>> = {
  rivets: {
    safetyFactorOverall: "shear",
    safetyFactorShear: "shear",
    safetyFactorAxial: "tensile",
    safetyFactorBearing: "bearing",
    safetyFactorResultant: "von_mises",
  },
  welds: {
    safetyFactorOverall: "shear",
    safetyFactorResultant: "von_mises",
  },
  shafts: {
    safetyFactor: "von_mises",
    criticalSpeedMargin: "critical_speed",
    deflectionUtilization: "deflection",
    fatigueSafetyFactor: "fatigue",
  },
  bearings: {
    lifeUtilization: "life_l10",
    dynamicUtilization: "dynamic_capacity",
    staticSafetyFactor: "static_capacity",
    speedMargin: "speed_limit",
  },
  fatigue: {
    safetyFactor: "goodman",
  },
  "compression-springs": {
    safetyFactor: "shear_stress",
    stressUtilization: "shear_stress",
    surgeMargin: "surge_margin",
    fatigueSafetyFactor: "fatigue_life",
  },
  "extension-springs": {
    safetyFactor: "shear_stress",
    bodySafetyFactor: "shear_stress",
    hookSafetyFactor: "hook_stress",
    stressUtilization: "shear_stress",
    surgeMargin: "surge_margin",
    fatigueSafetyFactor: "fatigue_life",
  },
  "torsion-springs": {
    safetyFactor: "bending_stress",
    stressUtilization: "bending_stress",
    fatigueSafetyFactor: "fatigue_life",
  },
  "combined-loading": {
    safetyFactor: "von_mises",
  },
};

function buildChecksFromResult(
  moduleId: string,
  designCode: DesignCodeId,
  result: ResultRecord
): EngineeringCheck[] {
  const profile = getModuleStandardProfile(moduleId);
  const overrides = MODULE_FIELD_OVERRIDES[moduleId] ?? {};
  const checks: EngineeringCheck[] = [];
  const usedCheckIds = new Set<string>();

  for (const [field, value] of Object.entries(result)) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;

    const mapping = RESULT_TO_CHECK[field];
    if (!mapping) continue;

    const checkId = overrides[field] ?? mapping.checkId;
    const def = profile?.checks.find((c) => c.id === checkId);
    if (!def || usedCheckIds.has(checkId)) continue;

    usedCheckIds.add(checkId);
    if (mapping.kind === "utilization") {
      checks.push(makeUtilizationCheck(checkId, def.label, value, designCode));
    } else {
      checks.push(makeSafetyFactorCheck(checkId, def.label, value, designCode));
    }
  }

  if (typeof result.maxStress === "number" && typeof result.allowableStress === "number") {
    const util = result.allowableStress > 0 ? result.maxStress / result.allowableStress : 0;
    const def = profile?.checks.find((c) => c.id === "bending_stress" || c.id === "von_mises");
    if (def && !usedCheckIds.has(def.id)) {
      checks.push(makeUtilizationCheck(def.id, def.label, util, designCode));
    }
  }

  return checks;
}

export function attachModuleCalculationSpec<T extends ResultRecord>(
  moduleId: string,
  designCode: DesignCodeId,
  result: T
): T & { calculationSpec: CalculationSpec } {
  const profile = getModuleStandardProfile(moduleId);
  const implementedChecks = buildChecksFromResult(moduleId, designCode, result);

  const method =
    designCode === "INDICATIVE"
      ? profile?.indicativeMethod ?? "Indicative closed-form or numerical screening"
      : `${designCode} screening — solver outputs mapped to catalog checks; not a full ${designCode} worksheet. Verify against code software for sign-off.`;

  const calculationSpec = buildCalculationSpec({
    moduleId,
    designCode,
    method,
    implementedChecks,
  });

  // Reinforce honesty for region codes when only the generic mapper is available.
  if (designCode !== "INDICATIVE") {
    const extraLimit =
      "US/EU/ISO selection sets unit defaults and screening labels; specialized code evaluators exist only for selected modules (beams, columns, gears, combined loading, welds).";
    if (!calculationSpec.limitations.includes(extraLimit)) {
      calculationSpec.limitations = [...calculationSpec.limitations, extraLimit];
    }
  }

  return { ...result, calculationSpec };
}

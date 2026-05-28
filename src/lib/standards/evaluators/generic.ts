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
};

const MODULE_FIELD_OVERRIDES: Record<string, Record<string, string>> = {
  "safety-factor": {
    safetyFactorYield: "von_mises_yield",
    safetyFactorUltimate: "von_mises_ultimate",
    governingFactor: "von_mises_yield",
  },
  rivets: {
    safetyFactorOverall: "shear",
    safetyFactorShear: "shear",
    safetyFactorAxial: "tensile",
    safetyFactorBearing: "bearing",
  },
  fatigue: {
    safetyFactor: "goodman",
  },
  "combined-loading": {
    safetyFactor: "von_mises",
  },
  "load-case-manager": {
    safetyFactor: "envelope_stress",
  },
};

function buildChecksFromResult(
  moduleId: string,
  designCode: DesignCodeId,
  result: ResultRecord
): EngineeringCheck[] {
  if (designCode !== "INDICATIVE") {
    return [];
  }

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

  const calculationSpec = buildCalculationSpec({
    moduleId,
    designCode,
    method: profile?.indicativeMethod,
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

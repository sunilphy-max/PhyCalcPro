import type {
  CalculationSpec,
  DesignCodeId,
  EngineeringCheck,
  EngineeringCheckStatus,
} from "./types";
import {
  getModuleStandardProfile,
  isCheckImplemented,
} from "./moduleCatalog";
import { getDesignCodeOption } from "./designCodes";

const ENGINE_VERSION = "phase0-0.1.0";

function statusFromFactor(
  factor: number,
  designCode: DesignCodeId,
  metricKind: EngineeringCheck["metricKind"]
): EngineeringCheckStatus {
  if (designCode === "INDICATIVE") {
    if (factor >= 1.5) return "indicative";
    if (factor >= 1.2) return "warning";
    return "fail";
  }
  if (metricKind === "utilization") {
    if (factor <= 1) return "pass";
    if (factor <= 1.1) return "warning";
    return "fail";
  }
  if (factor >= 1.5) return "pass";
  if (factor >= 1.0) return "warning";
  return "fail";
}

export function buildCalculationSpec(params: {
  moduleId: string;
  designCode: DesignCodeId;
  method?: string;
  implementedChecks: EngineeringCheck[];
}): CalculationSpec {
  const profile = getModuleStandardProfile(params.moduleId);
  const designCode = params.designCode;
  const implementedById = new Map(params.implementedChecks.map((c) => [c.id, c]));

  const checks: EngineeringCheck[] = [];

  for (const def of profile?.checks ?? []) {
    const ref = def.standardRef[designCode] ?? def.standardRef.INDICATIVE;
    const hasCodeRef = Boolean(def.standardRef[designCode]);
    const implemented = isCheckImplemented(def, designCode);
    const provided = implementedById.get(def.id);

    if (!hasCodeRef && designCode !== "INDICATIVE") {
      checks.push({
        id: def.id,
        label: def.label,
        metricKind: def.metricKind,
        status: "not_available",
        standardRef: ref,
        notes: `Not defined for ${getDesignCodeOption(designCode).shortLabel} practice in this module yet.`,
      });
      continue;
    }

    if (!implemented && !provided) {
      checks.push({
        id: def.id,
        label: def.label,
        metricKind: def.metricKind,
        status: "not_available",
        standardRef: ref,
        notes:
          designCode === "INDICATIVE"
            ? "Indicative check planned."
            : `Required by ${getDesignCodeOption(designCode).label} — implementation pending verification.`,
      });
      continue;
    }

    if (provided) {
      checks.push({
        ...provided,
        label: def.label,
        metricKind: def.metricKind,
        standardRef: provided.standardRef ?? ref,
      });
      continue;
    }
  }

  return {
    moduleId: params.moduleId,
    designCode,
    method: params.method ?? profile?.indicativeMethod ?? "Numerical evaluation",
    validationStatus: profile?.validationStatus ?? "indicative",
    standards: profile?.standardsByCode[designCode] ?? profile?.standardsByCode.INDICATIVE ?? [],
    equations: [],
    assumptions: profile?.assumptions ?? [],
    limitations: profile?.limitations ?? [],
    checks,
    engineVersion: ENGINE_VERSION,
    computedAt: new Date().toISOString(),
  };
}

export function makeSafetyFactorCheck(
  id: string,
  label: string,
  value: number,
  designCode: DesignCodeId,
  standardRef?: EngineeringCheck["standardRef"]
): EngineeringCheck {
  return {
    id,
    label,
    metricKind: "safety_factor",
    value,
    limit: designCode === "INDICATIVE" ? undefined : 1,
    status: statusFromFactor(value, designCode, "safety_factor"),
    standardRef,
  };
}

export function makeUtilizationCheck(
  id: string,
  label: string,
  utilization: number,
  designCode: DesignCodeId,
  standardRef?: EngineeringCheck["standardRef"]
): EngineeringCheck {
  return {
    id,
    label,
    metricKind: "utilization",
    value: utilization,
    limit: 1,
    status: statusFromFactor(utilization, designCode, "utilization"),
    standardRef,
  };
}

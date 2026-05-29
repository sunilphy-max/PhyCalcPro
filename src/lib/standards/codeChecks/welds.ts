import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck } from "../buildSpec";
import type { WeldResult } from "@/lib/fasteners/welds/types";

function throatUtilization(
  stress: number,
  allowable: number
): number {
  return allowable > 0 ? stress / allowable : 0;
}

export function buildWeldCodeChecks(
  result: WeldResult,
  designCode: DesignCodeId
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const checks: EngineeringCheck[] = [];

  checks.push(
    makeUtilizationCheck(
      "throat_shear",
      "Throat shear utilization",
      throatUtilization(result.shearStress, result.allowableShear),
      designCode
    ),
    makeUtilizationCheck(
      "throat_combined",
      "Combined throat utilization",
      throatUtilization(result.resultantStress, result.allowableResultant),
      designCode
    )
  );

  return checks;
}

export function weldCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "Fillet/groove throat stresses vs AWS D1.1-style allowables (β)";
    case "EU":
      return "Throat stresses vs EN 1993-1-8 style allowables (β)";
    case "ISO":
      return "Throat stresses vs ISO/EN weld basis (β)";
    default:
      return "Weld throat stress evaluation (indicative)";
  }
}

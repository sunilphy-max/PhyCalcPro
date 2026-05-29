import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck } from "../buildSpec";
import type { CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";
import { flexureAllowableStressPa } from "./factors";

export function buildCombinedLoadingCodeChecks(
  result: CombinedLoadingResult,
  designCode: DesignCodeId,
  yieldPa: number
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const allow = flexureAllowableStressPa(yieldPa, designCode);
  const util = allow > 0 ? result.vonMisesStress / allow : 0;

  return [
    makeUtilizationCheck(
      "von_mises",
      designCode === "US"
        ? "Von Mises utilization (ASD: σ_eq / (Fy/Ω))"
        : "Von Mises utilization (σ_Ed / σ_Rd)",
      util,
      designCode
    ),
  ];
}

export function combinedLoadingCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "Von Mises combined stress + AISC-style yield check (β)";
    case "EU":
      return "Von Mises combined stress + EN 1993-1-1 basis (β)";
    case "ISO":
      return "Von Mises combined stress + ISO/EN steel basis (β)";
    default:
      return "Von Mises combined loading (indicative)";
  }
}

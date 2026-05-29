import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck, makeSafetyFactorCheck } from "../buildSpec";
import type { BucklingResult } from "@/lib/structural/columns/types";
import { compressionAllowableLoadN } from "./factors";

export function buildColumnCodeChecks(
  result: BucklingResult,
  designCode: DesignCodeId
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const pAllow = compressionAllowableLoadN(result.Pcr, designCode);
  const appliedP = result.Pcr / Math.max(result.safetyFactor, 1e-9);
  const bucklingUtil = pAllow > 0 ? appliedP / pAllow : 0;

  const eulerSf = result.safetyFactor;

  return [
    makeUtilizationCheck(
      "buckling_utilization",
      designCode === "US"
        ? "Compression utilization (P / (Pcr/Ωc))"
        : "Compression utilization (N_Ed / N_Rd)",
      bucklingUtil,
      designCode
    ),
    makeSafetyFactorCheck(
      "euler_critical",
      "Buckling safety factor (Pcr / P)",
      eulerSf,
      designCode
    ),
  ];
}

export function columnCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "FEA buckling + AISC 360-22 Ch. E compression check (β)";
    case "EU":
      return "FEA buckling + EN 1993-1-1 buckling check (β)";
    case "ISO":
      return "FEA buckling + ISO/EN compression basis (β)";
    default:
      return "FEA eigenvalue buckling (indicative)";
  }
}

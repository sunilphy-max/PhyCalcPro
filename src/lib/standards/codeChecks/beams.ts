import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";
import { flexureAllowableStressPa } from "./factors";

export type BeamCodeCheckOptions = {
  yieldStressPa: number;
  deflectionLimit?: number;
};

export function buildBeamCodeChecks(
  result: BeamResult,
  designCode: DesignCodeId,
  options: BeamCodeCheckOptions
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const checks: EngineeringCheck[] = [];
  const sigmaAllow = flexureAllowableStressPa(options.yieldStressPa, designCode);
  const flexUtil = sigmaAllow > 0 ? result.maxStress / sigmaAllow : 0;

  checks.push(
    makeUtilizationCheck(
      "bending_stress",
      designCode === "US"
        ? "Flexure utilization (ASD: σ / (Fy/Ωb))"
        : "Flexure utilization (σ_Ed / σ_Rd)",
      flexUtil,
      designCode
    )
  );

  if (options.deflectionLimit && options.deflectionLimit > 0) {
    checks.push(
      makeUtilizationCheck(
        "deflection_serviceability",
        "Deflection serviceability (δ / δ_limit)",
        result.maxDeflection / options.deflectionLimit,
        designCode
      )
    );
  }

  return checks;
}

export function beamCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "1D beam FEM + AISC 360-22 ASD flexure & serviceability (β)";
    case "EU":
      return "1D beam FEM + EN 1993-1-1 Cl. 6.2.5 flexure & serviceability (β)";
    case "ISO":
      return "1D beam FEM + ISO/EN steel flexure basis (β)";
    default:
      return "1D beam FEM (Euler-Bernoulli)";
  }
}

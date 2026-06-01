import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";
import { flexureAllowableStressPa } from "./factors";

export type BeamCodeCheckOptions = {
  yieldStressPa: number;
  allowableStressPa?: number;
  deflectionLimit?: number;
  /** Distance to extreme fiber (m) — used with I for area estimate */
  c?: number;
  /** Second moment of area (m⁴) */
  I?: number;
  /** Unbraced length for LTB (m); defaults to span when omitted */
  unbracedLength?: number;
  /** Beam span length (m) */
  spanLength?: number;
};

export function buildBeamCodeChecks(
  result: BeamResult,
  designCode: DesignCodeId,
  options: BeamCodeCheckOptions
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const checks: EngineeringCheck[] = [];
  const sigmaAllow =
    options.allowableStressPa ?? flexureAllowableStressPa(options.yieldStressPa, designCode);
  const flexUtil = sigmaAllow > 0 ? result.maxStress / sigmaAllow : 0;

  checks.push(
    makeUtilizationCheck(
      "bending_stress",
      designCode === "US"
        ? "Flexure utilization (application allowable)"
        : "Flexure utilization (application resistance target)",
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

  const c = options.c ?? 0.05;
  const I = options.I ?? 1e-6;
  const areaEstimate = Math.max((3 * I) / (c * c), 1e-9);
  const tauMax = (1.5 * result.maxShear) / areaEstimate;
  const tauAllow = 0.6 * sigmaAllow;
  checks.push(
    makeUtilizationCheck(
      "shear_stress",
      designCode === "US"
        ? "Shear utilization (mechanical allowable)"
        : "Shear utilization (application shear target)",
      tauAllow > 0 ? tauMax / tauAllow : 0,
      designCode
    )
  );

  const Lb = options.unbracedLength ?? options.spanLength ?? 1;
  const Sx = I / Math.max(c, 1e-9);
  const r = Math.sqrt(I / areaEstimate);
  const Fe = (Math.PI ** 2 * 210e9) / Math.pow(Lb / Math.max(r, 1e-9), 2);
  const Fy = sigmaAllow;
  const Mn =
    Fe >= 0.7 * Fy
      ? 0.9 * Fy * Sx
      : 0.9 * Fy * Sx * Math.sqrt(Fe / Math.max(Fy, 1e-9));
  const Mmax = result.maxMoment;
  checks.push(
    makeUtilizationCheck(
      "lateral_torsional_buckling",
      "Lateral-torsional buckling screening (M / Mn, indicative)",
      Mn > 0 ? Mmax / Mn : 0,
      designCode
    )
  );

  return checks;
}

export function beamCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "1D beam FEM + mechanical/ASME-style allowable stress screening";
    case "EU":
      return "1D beam FEM + EN 13001/FKM-style industrial structure screening";
    case "ISO":
      return "1D beam FEM + ISO 8686-style industrial load screening";
    default:
      return "1D beam FEM (Euler-Bernoulli)";
  }
}

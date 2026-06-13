import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck, makeSafetyFactorCheck } from "../buildSpec";
import type { BucklingResult } from "@/lib/structural/columns/types";
import { AISC_ASD, EN_PARTIAL } from "./factors";

/**
 * AISC 360-16/22 Chapter E, §E3: flexural buckling of members without
 * slender elements.
 *   Fe = π²E/(Lc/r)²  (taken from the FEM/Euler critical stress)
 *   Fy/Fe ≤ 2.25  →  Fcr = (0.658^(Fy/Fe))·Fy   (inelastic)
 *   Fy/Fe > 2.25  →  Fcr = 0.877·Fe              (elastic)
 *   Pn = Fcr·A; ASD allowable Pn/Ωc with Ωc = 1.67.
 */
export function aiscE3CriticalStressPa(fyPa: number, fePa: number): number {
  if (fePa <= 0) return 0;
  const ratio = fyPa / fePa;
  if (ratio <= 2.25) {
    return Math.pow(0.658, ratio) * fyPa;
  }
  return 0.877 * fePa;
}

/**
 * EN 1993-1-1 §6.3.1.2 flexural buckling reduction factor χ.
 *   λ̄ = √(A·fy/Ncr) = √(fy/Fe)
 *   Φ = 0.5·[1 + α(λ̄ − 0.2) + λ̄²]
 *   χ = 1/(Φ + √(Φ² − λ̄²)) ≤ 1
 * Imperfection factor α defaults to buckling curve c (α = 0.49), the
 * conservative choice when the section type is unknown.
 */
export function ec3BucklingChi(fyPa: number, fePa: number, alpha = 0.49): number {
  if (fePa <= 0) return 0;
  const lambdaBar = Math.sqrt(fyPa / fePa);
  if (lambdaBar <= 0.2) return 1;
  const phi = 0.5 * (1 + alpha * (lambdaBar - 0.2) + lambdaBar * lambdaBar);
  const chi = 1 / (phi + Math.sqrt(Math.max(phi * phi - lambdaBar * lambdaBar, 0)));
  return Math.min(chi, 1);
}

export function buildColumnCodeChecks(
  result: BucklingResult,
  designCode: DesignCodeId
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const basis = result.codeCheckBasis;
  if (!basis) {
    // Legacy results without the SI basis: fall back to the Euler ratio only.
    return [
      makeSafetyFactorCheck(
        "euler_critical",
        "Buckling safety factor (Pcr / P)",
        result.safetyFactor,
        designCode
      ),
    ];
  }

  const { fyPa, eulerStressPa, appliedLoadN, areaM2 } = basis;

  if (designCode === "US") {
    const fcr = aiscE3CriticalStressPa(fyPa, eulerStressPa);
    const pn = fcr * areaM2;
    const pAllow = pn / AISC_ASD.omegaCompression;
    const util = pAllow > 0 ? appliedLoadN / pAllow : 0;
    const inelastic = fyPa / Math.max(eulerStressPa, 1e-9) <= 2.25;
    return [
      makeUtilizationCheck(
        "buckling_utilization",
        `Compression utilization P/(Pn/Ωc) — AISC 360 E3 ${inelastic ? "inelastic" : "elastic"} curve, Fcr = ${(fcr / 1e6).toFixed(1)} MPa`,
        util,
        designCode
      ),
      makeSafetyFactorCheck(
        "euler_critical",
        "Elastic buckling reserve (Pe / P)",
        result.safetyFactor,
        designCode
      ),
    ];
  }

  // EU and ISO: EN 1993-1-1 §6.3.1
  const chi = ec3BucklingChi(fyPa, eulerStressPa);
  const nbRd = (chi * areaM2 * fyPa) / EN_PARTIAL.gammaM1;
  const util = nbRd > 0 ? appliedLoadN / nbRd : 0;
  const lambdaBar = eulerStressPa > 0 ? Math.sqrt(fyPa / eulerStressPa) : Infinity;
  return [
    makeUtilizationCheck(
      "buckling_utilization",
      `Compression utilization N_Ed/N_b,Rd — EN 1993-1-1 curve c, χ = ${chi.toFixed(3)}, λ̄ = ${lambdaBar.toFixed(2)}`,
      util,
      designCode
    ),
    makeSafetyFactorCheck(
      "euler_critical",
      "Elastic buckling reserve (Ncr / N_Ed)",
      result.safetyFactor,
      designCode
    ),
  ];
}

export function columnCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "FEA buckling + AISC 360 §E3 flexural buckling (Fcr = 0.658^(Fy/Fe)·Fy / 0.877·Fe, Ωc = 1.67)";
    case "EU":
      return "FEA buckling + EN 1993-1-1 §6.3.1 buckling curve c (χ·A·fy/γM1)";
    case "ISO":
      return "FEA buckling + EN 1993-1-1 §6.3.1 buckling reduction (ISO practice)";
    default:
      return "FEA eigenvalue buckling (indicative)";
  }
}

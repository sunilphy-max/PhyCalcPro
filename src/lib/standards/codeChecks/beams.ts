import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";
import { AISC_ASD, EN_PARTIAL } from "./factors";

export type BeamCodeCheckOptions = {
  yieldStressPa: number;
  allowableStressPa?: number;
  deflectionLimit?: number;
  /** Distance to extreme fiber (m) — used with I for area estimate */
  c?: number;
  /** Second moment of area (m⁴) */
  I?: number;
  /** Elastic modulus (Pa); defaults to steel */
  E?: number;
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
  const fy = options.yieldStressPa;
  const E = options.E ?? 210e9;
  const c = options.c ?? 0.05;
  const I = options.I ?? 1e-6;
  const Sx = I / Math.max(c, 1e-9);

  // ---- Flexure ----
  // US: AISC 360 Ch. F yielding limit state with elastic section modulus
  //     (Mn = Fy·Sx, conservative vs Zx), ASD Mn/Ωb with Ωb = 1.67.
  // EU/ISO: EN 1993-1-1 §6.2.5 elastic resistance Mc,Rd = Wel·fy/γM0.
  const mAllow =
    designCode === "US"
      ? (fy * Sx) / AISC_ASD.omegaFlexure
      : (fy * Sx) / EN_PARTIAL.gammaM0;
  checks.push(
    makeUtilizationCheck(
      "bending_stress",
      designCode === "US"
        ? "Flexure utilization M/(Fy·Sx/Ωb) — AISC 360 F (elastic, Ωb = 1.67)"
        : "Flexure utilization M_Ed/M_c,Rd — EN 1993-1-1 §6.2.5 (elastic)",
      mAllow > 0 ? result.maxMoment / mAllow : 0,
      designCode
    )
  );

  // ---- Serviceability ----
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

  // ---- Shear ----
  // Web/section area is estimated from I and c (rectangular assumption
  // A ≈ 3I/c²); peak shear stress τ = 1.5·V/A for a rectangle.
  // US: AISC 360 G yield limit 0.6·Fy/Ωv. EU/ISO: EN 1993-1-1 §6.2.6
  // plastic shear basis fy/(√3·γM0).
  const areaEstimate = Math.max((3 * I) / (c * c), 1e-9);
  const tauMax = (1.5 * result.maxShear) / areaEstimate;
  const tauAllow =
    designCode === "US"
      ? (0.6 * fy) / AISC_ASD.omegaShear
      : fy / (Math.sqrt(3) * EN_PARTIAL.gammaM0);
  checks.push(
    makeUtilizationCheck(
      "shear_stress",
      designCode === "US"
        ? "Shear utilization τ/(0.6·Fy/Ωv) — AISC 360 G (section estimated from I, c)"
        : "Shear utilization τ/(fy/√3/γM0) — EN 1993-1-1 §6.2.6 (section estimated from I, c)",
      tauAllow > 0 ? tauMax / tauAllow : 0,
      designCode
    )
  );

  // ---- Lateral-torsional buckling (screening) ----
  // Without ry/J/Cw section data this is a screening check: elastic LTB
  // stress is approximated by Euler buckling about the weak axis estimate.
  const Lb = options.unbracedLength ?? options.spanLength ?? 1;
  const r = Math.sqrt(I / areaEstimate);
  const Fe = (Math.PI ** 2 * E) / Math.pow(Lb / Math.max(r, 1e-9), 2);
  const Mn =
    Fe >= 0.7 * fy
      ? fy * Sx
      : fy * Sx * Math.sqrt(Fe / Math.max(fy, 1e-9));
  const mnAllow =
    designCode === "US" ? Mn / AISC_ASD.omegaFlexure : Mn / EN_PARTIAL.gammaM1;
  checks.push(
    makeUtilizationCheck(
      "lateral_torsional_buckling",
      "Lateral-torsional buckling screening (M / Mn) — section properties estimated",
      mnAllow > 0 ? result.maxMoment / mnAllow : 0,
      designCode
    )
  );

  return checks;
}

export function beamCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "1D beam FEM + AISC 360 Ch. F/G elastic flexure and shear checks (ASD)";
    case "EU":
      return "1D beam FEM + EN 1993-1-1 §6.2 elastic resistance checks";
    case "ISO":
      return "1D beam FEM + EN 1993-1-1 §6.2 basis (ISO practice)";
    default:
      return "1D beam FEM (Euler-Bernoulli)";
  }
}

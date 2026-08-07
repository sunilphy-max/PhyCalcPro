/**
 * Focused ISO 281 life + equivalent-load helpers for suite tool pages.
 */

import type { BearingType } from "./types";
import {
  equivalentLoadFromRadialAxial,
  lifeExponentFor,
} from "./equivalentLoad";
import {
  A1_BY_RELIABILITY,
  CONTAMINATION_EC,
  estimateFatigueLoadLimitN,
  resolveModifiedLifeFactors,
  type ContaminationLevel,
} from "./iso281Life";

/** Re-export canonical ISO 281 a₁ table (see iso281Life). */
export { A1_BY_RELIABILITY };

export type BearingLifeToolInput = {
  bearingType: BearingType;
  dynamicRatingN: number;
  staticRatingN?: number;
  fatigueLoadLimitN?: number;
  radialLoadN: number;
  axialLoadN: number;
  speedRpm: number;
  reliabilityPercent: number;
  meanDiameterMm: number;
  kinematicViscosityCst: number;
  contamination: ContaminationLevel;
  catalogFactors?: { X: number; Y: number; e: number };
};

export type BearingLifeToolResult = {
  equivalentLoadN: number;
  lifeExponent: number;
  a1: number;
  aIso: number;
  kappa: number;
  eC: number;
  puOverP: number;
  basicLifeMillionRev: number;
  modifiedLifeMillionRev: number;
  basicLifeHours: number;
  modifiedLifeHours: number;
  dynamicUtilization: number;
  staticSafetyFactor: number | null;
  factorsUsed: { X: number; Y: number; e: number; faOverFr: number; regime: "Fr" | "XFr+YFa" | "thrust" };
};

function defaultFactors(type: BearingType): { X: number; Y: number; e: number } {
  const map: Record<string, { X: number; Y: number; e: number }> = {
    deep_groove: { X: 0.56, Y: 1.6, e: 0.3 },
    angular_contact: { X: 0.35, Y: 0.57, e: 1.14 },
    cylindrical_roller: { X: 1.0, Y: 0.0, e: Infinity },
    cylindrical_nj: { X: 1.0, Y: 0.35, e: 0.4 },
    cylindrical_nup: { X: 1.0, Y: 0.45, e: 0.4 },
    tapered_roller: { X: 0.4, Y: 1.0, e: 0.4 },
    spherical_roller: { X: 1.0, Y: 2.1, e: 0.65 },
    toroidal_roller: { X: 1.0, Y: 0.0, e: Infinity },
    needle_roller: { X: 1.0, Y: 0.0, e: Infinity },
    self_aligning_ball: { X: 1.0, Y: 2.3, e: 0.65 },
    thrust_ball: { X: 0.0, Y: 1.0, e: 0.0 },
    thrust_cylindrical_roller: { X: 0.0, Y: 1.0, e: 0.0 },
    thrust_spherical_roller: { X: 0.0, Y: 1.0, e: 0.0 },
  };
  return map[type] ?? map.deep_groove!;
}

export function explainEquivalentLoad(
  Fr: number,
  Fa: number,
  bearingType: BearingType,
  catalogFactors?: { X: number; Y: number; e: number }
): BearingLifeToolResult["factorsUsed"] & { P: number; notes: string[] } {
  const coeffs = catalogFactors ?? defaultFactors(bearingType);
  const notes: string[] = [];
  const isThrust = bearingType.startsWith("thrust_");
  if (isThrust) {
    notes.push("Thrust bearings: equivalent dynamic load P is governed by axial load Fa.");
    return { ...coeffs, faOverFr: Fr > 0 ? Fa / Fr : Infinity, regime: "thrust", P: Math.max(Fa, 1e-9), notes };
  }
  const faOverFr = Fr > 0 ? Fa / Fr : Number.POSITIVE_INFINITY;
  notes.push(`Load ratio Fa/Fr = ${Number.isFinite(faOverFr) ? faOverFr.toFixed(3) : "∞"}.`);
  notes.push(`Type factors: X = ${coeffs.X}, Y = ${coeffs.Y}, e = ${Number.isFinite(coeffs.e) ? coeffs.e : "∞"}.`);
  if (!(faOverFr > coeffs.e)) {
    notes.push("Fa/Fr ≤ e → radial load dominates; P = Fr.");
    return { ...coeffs, faOverFr, regime: "Fr", P: Math.max(Fr, 1e-9), notes };
  }
  const P = Math.max(coeffs.X * Fr + coeffs.Y * Fa, Fr);
  notes.push("Fa/Fr > e → combined loading; P = X·Fr + Y·Fa (not less than Fr).");
  return { ...coeffs, faOverFr, regime: "XFr+YFa", P, notes };
}

export function solveBearingLifeTool(input: BearingLifeToolInput): BearingLifeToolResult {
  const Fr = Math.abs(input.radialLoadN);
  const Fa = Math.abs(input.axialLoadN);
  const explained = explainEquivalentLoad(Fr, Fa, input.bearingType, input.catalogFactors);
  const P = explained.P;
  const p = lifeExponentFor(input.bearingType);
  const a1 = A1_BY_RELIABILITY[input.reliabilityPercent] ?? 1;
  const C = Math.max(input.dynamicRatingN, 1e-9);
  const Pu =
    input.fatigueLoadLimitN ??
    estimateFatigueLoadLimitN(input.dynamicRatingN, input.bearingType);

  const factors = resolveModifiedLifeFactors({
    kinematicViscosityCst: input.kinematicViscosityCst,
    meanDiameterMm: Math.max(input.meanDiameterMm, 1),
    speedRpm: Math.max(input.speedRpm, 1),
    contamination: input.contamination,
    fatigueLoadLimitN: Pu,
    equivalentLoadN: P,
    bearingType: input.bearingType,
  });

  const basicMillion = a1 * Math.pow(C / P, p);
  const modifiedMillion = a1 * factors.aIso * Math.pow(C / P, p);
  const n = Math.max(input.speedRpm, 1e-9);
  const basicHours = (basicMillion * 1e6) / (60 * n);
  const modifiedHours = (modifiedMillion * 1e6) / (60 * n);

  const C0 = input.staticRatingN;
  const staticSafetyFactor =
    C0 != null && C0 > 0 ? C0 / Math.max(0.6 * Fr + 0.5 * Fa, Fa, Fr, 1e-9) : null;

  return {
    equivalentLoadN: P,
    lifeExponent: p,
    a1,
    aIso: factors.aIso,
    kappa: factors.kappa,
    eC: factors.eC,
    puOverP: factors.puOverP,
    basicLifeMillionRev: basicMillion,
    modifiedLifeMillionRev: modifiedMillion,
    basicLifeHours: basicHours,
    modifiedLifeHours: modifiedHours,
    dynamicUtilization: P / C, // rough C/P inverted usage as P/C
    staticSafetyFactor,
    factorsUsed: {
      X: explained.X,
      Y: explained.Y,
      e: explained.e,
      faOverFr: explained.faOverFr,
      regime: explained.regime,
    },
  };
}

export { CONTAMINATION_EC };

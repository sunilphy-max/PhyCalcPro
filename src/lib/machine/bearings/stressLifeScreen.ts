/**
 * Transparent stress-life screening — contact-pressure + film inspired modifier.
 *
 * NOT SKF GBLM / AFC. PhyCalcPro screening curve fit only.
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType } from "./types";

export type StressLifeScreenInput = {
  bearingType: BearingType;
  equivalentLoadN: number;
  dynamicRatingN: number;
  meanDiameterMm: number;
  kappa: number;
  eC: number;
  puOverP: number;
};

export type StressLifeScreenResult = {
  aStress: number;
  contactPressureProxyMpa: number;
  pressureRatio: number;
  note: string;
};

/**
 * Crude Hertz-like pressure proxy (MPa) from P and mean diameter.
 * Point contact (ball) vs line contact (roller) scales differently.
 */
export function contactPressureProxyMpa(params: {
  bearingType: BearingType;
  equivalentLoadN: number;
  meanDiameterMm: number;
}): number {
  const dm = Math.max(params.meanDiameterMm, 5);
  const P = Math.max(params.equivalentLoadN, 1);
  // Characteristic contact length / area proxies
  if (isRollerBearingType(params.bearingType)) {
    // Line contact: p ~ P / (dm * L_char); L_char ~ 0.15·dm
    const L = 0.15 * dm;
    return (P / Math.max(L * dm * 0.35, 1)) * 1e-3; // N/mm² ≈ MPa after scale
  }
  // Point contact: p ~ (P / dm²)^(1/3) style screening
  return 180 * Math.pow(P / Math.max(dm * dm, 1), 1 / 3);
}

/** Reference pressure (MPa) near typical steel fatigue onset for screening. */
function referencePressureMpa(bearingType: BearingType): number {
  return isRollerBearingType(bearingType) ? 1500 : 2000;
}

/**
 * a_stress ∈ [0.05, 5] — reduces life when pressure high / film poor / dirty.
 */
export function calculateStressLifeFactor(input: StressLifeScreenInput): StressLifeScreenResult {
  const pProxy = contactPressureProxyMpa({
    bearingType: input.bearingType,
    equivalentLoadN: input.equivalentLoadN,
    meanDiameterMm: input.meanDiameterMm,
  });
  const pRef = referencePressureMpa(input.bearingType);
  const pressureRatio = pProxy / pRef;

  const kappa = Math.max(input.kappa, 0.05);
  const eC = Math.min(Math.max(input.eC, 0.01), 1);
  const puOverP = Math.min(Math.max(input.puOverP, 0.001), 5);

  // Film quality: κ≥2 and clean → near 1; poor film cuts harder than aISO alone
  const filmTerm = Math.pow(Math.min(kappa, 4) / 2, 0.35) * Math.pow(eC, 0.25);
  // Stress term: pressure above ref and low Pu/P reduce life
  const stressTerm = Math.pow(Math.max(0.2, 1.15 - 0.55 * pressureRatio), 2.2);
  const fatigueTerm = Math.pow(Math.min(puOverP, 2) / 0.5, 0.15);

  let aStress = filmTerm * stressTerm * fatigueTerm;
  // Soft floor/ceiling; keep milder than aISO extremes
  aStress = Math.min(Math.max(aStress, 0.05), 5);

  return {
    aStress,
    contactPressureProxyMpa: pProxy,
    pressureRatio,
    note:
      "Stress-life screening (PhyCalcPro) — contact-pressure / film inspired modifier. Not SKF GBLM or AFC.",
  };
}

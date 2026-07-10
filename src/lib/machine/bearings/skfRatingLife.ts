/**
 * SKF rating life — aligned with SKF Product Select / ISO 281:2007 modified life.
 *
 * Lnm  = a1 · aSKF · (C/P)^p   [million revolutions]
 * Lnmh = 10^6 · Lnm / (60·n)   [operating hours]
 *
 * @see https://www.skf.com/group/products/rolling-bearings/.../skf-rating-life
 */

import type { BearingType } from "./types";
import { lifeExponentFor } from "./equivalentLoad";
import {
  calculateAiso,
  estimateFatigueLoadLimitN,
  ratedViscosityNu1,
  type ContaminationLevel,
  CONTAMINATION_EC,
  viscosityRatio,
} from "./iso281Life";

export type SkfRatingLifeInputs = {
  dynamicRatingN: number;
  equivalentLoadN: number;
  speedRpm: number;
  a1: number;
  bearingType: BearingType;
  /** Kinematic viscosity ν at operating temperature (cSt). Omit for basic L10 (aSKF = 1). */
  kinematicViscosityCst?: number;
  meanDiameterMm: number;
  contamination?: ContaminationLevel;
  fatigueLoadLimitN?: number;
};

export type SkfRatingLifeResult = {
  /** SKF rating life Lnm [million revolutions] */
  lnmMillionRev: number;
  /** SKF rating life Lnmh [hours] */
  lnmHours: number;
  /** Life modification factor aSKF (= aISO in ISO 281:2007) */
  aSkf: number;
  kappa: number;
  nu1Cst: number;
  eC: number;
  puOverP: number;
  fatigueLoadLimitN: number;
  lifeExponent: number;
  /** Basic ISO 281 L10 without lubrication/contamination (aSKF = 1) [hours] */
  basicL10Hours: number;
  referenceSpeedMargin: number | null;
};

/** SKF life exponent p: 3 for ball bearings, 10/3 for roller bearings. */
export function skfLifeExponent(bearingType: BearingType): number {
  return lifeExponentFor(bearingType);
}

/** SKF rating life in million revolutions. */
export function skfRatingLifeMillionRevolutions(params: {
  a1: number;
  aSkf: number;
  dynamicRatingN: number;
  equivalentLoadN: number;
  lifeExponent: number;
}): number {
  const { a1, aSkf, dynamicRatingN, equivalentLoadN, lifeExponent: p } = params;
  if (equivalentLoadN <= 0 || dynamicRatingN <= 0) return 0;
  return a1 * aSkf * Math.pow(dynamicRatingN / equivalentLoadN, p);
}

/** Convert SKF Lnm [million rev] to operating hours at speed n [rpm]. */
export function skfRatingLifeHours(lnmMillionRev: number, speedRpm: number): number {
  if (lnmMillionRev <= 0) return 0;
  return (lnmMillionRev * 1e6) / (60 * Math.max(speedRpm, 1));
}

/**
 * Full SKF rating life evaluation — mirrors SKF Product Select bearing calculation.
 * When lubrication inputs are omitted, aSKF = 1 (basic ISO 281 L10 screening).
 */
export function calculateSkfRatingLife(
  input: SkfRatingLifeInputs,
  referenceSpeedRpm?: number | null
): SkfRatingLifeResult {
  const p = skfLifeExponent(input.bearingType);
  const pu =
    input.fatigueLoadLimitN ?? estimateFatigueLoadLimitN(input.dynamicRatingN, input.bearingType);
  const puOverP = pu / Math.max(input.equivalentLoadN, 1e-9);

  const nu1 = ratedViscosityNu1(input.meanDiameterMm, input.speedRpm);
  let kappa = 0;
  let eC = 1;
  let aSkf = 1;

  if (input.kinematicViscosityCst != null && input.contamination) {
    kappa = viscosityRatio(input.kinematicViscosityCst, nu1);
    eC = CONTAMINATION_EC[input.contamination];
    aSkf = calculateAiso({ kappa, eC, puOverP });
  }

  const basicLnm = skfRatingLifeMillionRevolutions({
    a1: input.a1,
    aSkf: 1,
    dynamicRatingN: input.dynamicRatingN,
    equivalentLoadN: input.equivalentLoadN,
    lifeExponent: p,
  });

  const lnmMillionRev = skfRatingLifeMillionRevolutions({
    a1: input.a1,
    aSkf,
    dynamicRatingN: input.dynamicRatingN,
    equivalentLoadN: input.equivalentLoadN,
    lifeExponent: p,
  });

  const speed = Math.max(input.speedRpm, 1);
  const referenceSpeedMargin =
    referenceSpeedRpm != null && referenceSpeedRpm > 0 ? referenceSpeedRpm / speed : null;

  return {
    lnmMillionRev,
    lnmHours: skfRatingLifeHours(lnmMillionRev, speed),
    aSkf,
    kappa,
    nu1Cst: nu1,
    eC,
    puOverP,
    fatigueLoadLimitN: pu,
    lifeExponent: p,
    basicL10Hours: skfRatingLifeHours(basicLnm, speed),
    referenceSpeedMargin,
  };
}

/**
 * PhyCalcPro modified rating life — ISO 281:2007 screening.
 *
 * Lnm  = a1 · aISO · (C/P)^p   [million revolutions]
 * Lnmh = 10^6 · Lnm / (60·n)   [operating hours]
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

export type ModifiedRatingLifeInputs = {
  dynamicRatingN: number;
  equivalentLoadN: number;
  speedRpm: number;
  a1: number;
  bearingType: BearingType;
  /** Kinematic viscosity ν at operating temperature (cSt). Omit for basic L10 (aISO = 1). */
  kinematicViscosityCst?: number;
  meanDiameterMm: number;
  contamination?: ContaminationLevel;
  fatigueLoadLimitN?: number;
};

export type ModifiedRatingLifeResult = {
  /** Modified rating life Lnm [million revolutions] */
  lnmMillionRev: number;
  /** Modified rating life Lnmh [hours] */
  lnmHours: number;
  /** Life modification factor aISO (ISO 281:2007) */
  aIso: number;
  kappa: number;
  nu1Cst: number;
  eC: number;
  puOverP: number;
  fatigueLoadLimitN: number;
  lifeExponent: number;
  /** Basic ISO 281 L10 without lubrication/contamination (aISO = 1) [hours] */
  basicL10Hours: number;
  referenceSpeedMargin: number | null;
};

/** Life exponent p: 3 for ball bearings, 10/3 for roller bearings. */
export function modifiedLifeExponent(bearingType: BearingType): number {
  return lifeExponentFor(bearingType);
}

/** Modified rating life in million revolutions. */
export function modifiedRatingLifeMillionRevolutions(params: {
  a1: number;
  aIso: number;
  dynamicRatingN: number;
  equivalentLoadN: number;
  lifeExponent: number;
}): number {
  const { a1, aIso, dynamicRatingN, equivalentLoadN, lifeExponent: p } = params;
  if (equivalentLoadN <= 0 || dynamicRatingN <= 0) return 0;
  return a1 * aIso * Math.pow(dynamicRatingN / equivalentLoadN, p);
}

/** Convert Lnm [million rev] to operating hours at speed n [rpm]. */
export function modifiedRatingLifeHours(lnmMillionRev: number, speedRpm: number): number {
  if (lnmMillionRev <= 0) return 0;
  return (lnmMillionRev * 1e6) / (60 * Math.max(speedRpm, 1));
}

/**
 * Full modified rating life evaluation (ISO 281 screening).
 * When lubrication inputs are omitted, aISO = 1 (basic ISO 281 L10 screening).
 */
export function calculateModifiedRatingLife(
  input: ModifiedRatingLifeInputs,
  referenceSpeedRpm?: number | null
): ModifiedRatingLifeResult {
  const p = modifiedLifeExponent(input.bearingType);
  const pu =
    input.fatigueLoadLimitN ?? estimateFatigueLoadLimitN(input.dynamicRatingN, input.bearingType);
  const puOverP = pu / Math.max(input.equivalentLoadN, 1e-9);

  const nu1 = ratedViscosityNu1(input.meanDiameterMm, input.speedRpm);
  let kappa = 0;
  let eC = 1;
  let aIso = 1;

  if (input.kinematicViscosityCst != null && input.contamination) {
    kappa = viscosityRatio(input.kinematicViscosityCst, nu1);
    eC = CONTAMINATION_EC[input.contamination];
    aIso = calculateAiso({ kappa, eC, puOverP });
  }

  const basicLnm = modifiedRatingLifeMillionRevolutions({
    a1: input.a1,
    aIso: 1,
    dynamicRatingN: input.dynamicRatingN,
    equivalentLoadN: input.equivalentLoadN,
    lifeExponent: p,
  });

  const lnmMillionRev = modifiedRatingLifeMillionRevolutions({
    a1: input.a1,
    aIso,
    dynamicRatingN: input.dynamicRatingN,
    equivalentLoadN: input.equivalentLoadN,
    lifeExponent: p,
  });

  const speed = Math.max(input.speedRpm, 1);
  const referenceSpeedMargin =
    referenceSpeedRpm != null && referenceSpeedRpm > 0 ? referenceSpeedRpm / speed : null;

  return {
    lnmMillionRev,
    lnmHours: modifiedRatingLifeHours(lnmMillionRev, speed),
    aIso,
    kappa,
    nu1Cst: nu1,
    eC,
    puOverP,
    fatigueLoadLimitN: pu,
    lifeExponent: p,
    basicL10Hours: modifiedRatingLifeHours(basicLnm, speed),
    referenceSpeedMargin,
  };
}

/**
 * ISO 281:2007 modified rating life — κ, ν₁, contamination eC, fatigue limit Pu, aISO.
 * Reference: ISO 281, SKF rating life methodology (screening implementation).
 */

import type { BearingType } from "./types";

const ROLLER_TYPES: BearingType[] = [
  "cylindrical_roller",
  "cylindrical_nj",
  "cylindrical_nup",
  "tapered_roller",
  "spherical_roller",
  "needle_roller",
  "thrust_ball",
];

/** ISO 281 contamination factor eC (ηc) — cleanliness classes. */
export type ContaminationLevel =
  | "extreme_clean"
  | "high_clean"
  | "normal_clean"
  | "slight_contamination"
  | "typical_contamination"
  | "heavy_contamination";

export const CONTAMINATION_EC: Record<ContaminationLevel, number> = {
  extreme_clean: 1.0,
  high_clean: 0.8,
  normal_clean: 0.5,
  slight_contamination: 0.3,
  typical_contamination: 0.1,
  heavy_contamination: 0.05,
};

export type LubricationInputs = {
  /** Kinematic viscosity at operating temperature (mm²/s = cSt). */
  kinematicViscosityCst: number;
  /** Mean bearing diameter dm = (d + D) / 2 in mm. */
  meanDiameterMm: number;
  /** Rotational speed rpm. */
  speedRpm: number;
  contamination: ContaminationLevel;
  /** Fatigue load limit Pu (N). */
  fatigueLoadLimitN: number;
  /** Equivalent dynamic load P (N). */
  equivalentLoadN: number;
  bearingType: BearingType;
};

export type ModifiedLifeFactors = {
  kappa: number;
  nu1Cst: number;
  eC: number;
  puOverP: number;
  aIso: number;
  fatigueLoadLimitN: number;
};

/** Estimate Pu when not in catalog (ISO 281 typical ratios). */
export function estimateFatigueLoadLimitN(dynamicRatingN: number, bearingType: BearingType): number {
  const roller = ROLLER_TYPES.includes(bearingType);
  return (roller ? 0.03 : 0.025) * dynamicRatingN;
}

/** Rated kinematic viscosity ν₁ at operating temperature (mm²/s). */
export function ratedViscosityNu1(meanDiameterMm: number, speedRpm: number): number {
  const dm = Math.max(meanDiameterMm, 1);
  const n = Math.max(speedRpm, 1);
  const nDm = n * dm;
  if (nDm < 20000) return 45000 / (2.4 * Math.sqrt(nDm));
  return 45000 / nDm;
}

/** Viscosity ratio κ = ν / ν₁. */
export function viscosityRatio(kinematicViscosityCst: number, nu1Cst: number): number {
  return kinematicViscosityCst / Math.max(nu1Cst, 1e-9);
}

/**
 * ISO 281:2007 life modification factor aISO (radial ball / roller screening).
 * Uses Pu/P form from the standard life modification diagram.
 */
export function calculateAiso(params: {
  kappa: number;
  eC: number;
  puOverP: number;
}): number {
  const κ = Math.max(params.kappa, 0.05);
  const eC = Math.min(Math.max(params.eC, 0.01), 1);
  const puOverP = Math.min(Math.max(params.puOverP, 0.001), 5);

  const aCoeff = 2.5671 - 1.9987 / Math.pow(κ, 0.19087);
  const inner = 1 - aCoeff * Math.pow(1 - eC, 0.83) * Math.pow(puOverP, 0.27974);
  const aIso = 0.1 * Math.pow(Math.max(inner, 0), 9.3) + 0.1;

  return Math.min(Math.max(aIso, 0.01), 50);
}

export function resolveModifiedLifeFactors(input: LubricationInputs): ModifiedLifeFactors {
  const nu1 = ratedViscosityNu1(input.meanDiameterMm, input.speedRpm);
  const kappa = viscosityRatio(input.kinematicViscosityCst, nu1);
  const eC = CONTAMINATION_EC[input.contamination];
  const pu = input.fatigueLoadLimitN;
  const puOverP = pu / Math.max(input.equivalentLoadN, 1e-9);

  const aIso = calculateAiso({ kappa, eC, puOverP });

  return {
    kappa,
    nu1Cst: nu1,
    eC,
    puOverP,
    aIso,
    fatigueLoadLimitN: pu,
  };
}

/** Map legacy 3-tier lubrication class to κ / contamination approximations. */
export function legacyLubricationToInputs(
  lubricationClass: "poor" | "average" | "good",
  meanDiameterMm: number,
  speedRpm: number,
  dynamicRatingN: number,
  equivalentLoadN: number,
  bearingType: BearingType
): LubricationInputs {
  const contamination: ContaminationLevel =
    lubricationClass === "good"
      ? "high_clean"
      : lubricationClass === "average"
        ? "normal_clean"
        : "typical_contamination";

  const nu1 = ratedViscosityNu1(meanDiameterMm, speedRpm);
  const kappaTarget = lubricationClass === "good" ? 4 : lubricationClass === "average" ? 1.5 : 0.4;

  return {
    kinematicViscosityCst: kappaTarget * nu1,
    meanDiameterMm,
    speedRpm,
    contamination,
    fatigueLoadLimitN: estimateFatigueLoadLimitN(dynamicRatingN, bearingType),
    equivalentLoadN,
    bearingType,
  };
}

/** Temperature derating factor for C at elevated operating temperature (screening). */
export function temperatureDeratingFactor(operatingTempC: number): number {
  if (operatingTempC <= 120) return 1;
  if (operatingTempC >= 200) return 0.85;
  return 1 - 0.001875 * (operatingTempC - 120);
}

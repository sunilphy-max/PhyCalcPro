/**
 * Minimum load and friction torque screening (SKF / ISO indicative).
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType } from "./types";

/** Minimum radial load to avoid skidding (N) — SKF indicative for ball bearings. */
export function minimumRadialLoadN(params: {
  dynamicRatingN: number;
  speedRpm: number;
  bearingType: BearingType;
}): number {
  const { dynamicRatingN, speedRpm, bearingType } = params;
  const n = Math.max(speedRpm, 1);
  if (isRollerBearingType(bearingType)) {
    return 0.01 * dynamicRatingN;
  }
  if (bearingType === "angular_contact") {
    return 0.02 * dynamicRatingN * Math.pow(n / 1000, 0.5);
  }
  return 0.0045 * dynamicRatingN * Math.pow(n / 1000, 1.5);
}

export type FrictionEstimate = {
  frictionTorqueNm: number;
  powerLossW: number;
  frictionCoefficient: number;
};

/**
 * Friction torque M = 0.5 μ P dm (SKF screening).
 * μ depends on bearing type and lubrication.
 */
export function estimateFriction(params: {
  equivalentLoadN: number;
  meanDiameterMm: number;
  speedRpm: number;
  bearingType: BearingType;
  sealed?: boolean;
}): FrictionEstimate {
  const dm = params.meanDiameterMm / 1000;
  const P = Math.max(params.equivalentLoadN, 1);
  const muBase = isRollerBearingType(params.bearingType) ? 0.002 : 0.0015;
  const mu = params.sealed ? muBase * 1.4 : muBase;
  const M = 0.5 * mu * P * dm;
  const omega = (2 * Math.PI * params.speedRpm) / 60;
  const powerLoss = M * omega;
  return { frictionTorqueNm: M, powerLossW: powerLoss, frictionCoefficient: mu };
}

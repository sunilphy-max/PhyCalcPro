/**
 * ISO 76 static equivalent load P₀ for rolling bearings (screening values).
 */

import type { BearingType } from "./types";

export function calculateStaticEquivalentLoad(
  radialLoad: number,
  axialLoad: number,
  bearingType: BearingType
): number {
  const Fr = Math.abs(radialLoad);
  const Fa = Math.abs(axialLoad);
  const ratio = Fr > 0 ? Fa / Fr : Fa > 0 ? Number.POSITIVE_INFINITY : 0;

  if (bearingType === "cylindrical_roller") {
    return Fr;
  }

  if (bearingType === "angular_contact") {
    return Fr + 0.44 * Fa;
  }

  // Deep groove ball — ISO 76 table screening
  if (ratio <= 0.8) return Fr;
  return 0.6 * Fr + 0.5 * Fa;
}

export function staticSafetyFactor(staticRatingN: number, staticEquivalentLoad: number): number {
  return staticRatingN / Math.max(staticEquivalentLoad, 1e-9);
}

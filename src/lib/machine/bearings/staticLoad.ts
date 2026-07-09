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

  if (bearingType === "thrust_ball") {
    return Fa;
  }

  if (
    bearingType === "cylindrical_roller" ||
    bearingType === "needle_roller"
  ) {
    return Fr;
  }

  if (bearingType === "cylindrical_nj" || bearingType === "cylindrical_nup") {
    return Fr + 0.44 * Fa;
  }

  if (bearingType === "angular_contact" || bearingType === "tapered_roller") {
    return Fr + 0.44 * Fa;
  }

  if (bearingType === "spherical_roller" || bearingType === "self_aligning_ball") {
    if (ratio <= 0.55) return Fr;
    return Fr + 1.5 * Fa;
  }

  // Deep groove ball — ISO 76 table screening
  if (ratio <= 0.8) return Fr;
  return 0.6 * Fr + 0.5 * Fa;
}

export function staticSafetyFactor(staticRatingN: number, staticEquivalentLoad: number): number {
  return staticRatingN / Math.max(staticEquivalentLoad, 1e-9);
}

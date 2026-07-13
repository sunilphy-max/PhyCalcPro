/**
 * ISO 281 equivalent dynamic load P — shared by solver and paired-bearing analysis.
 */

import { isRollerBearingType, isThrustBearingType } from "@/data/catalogs/bearing/types";
import type { BearingConfig, BearingType } from "./types";

const bearingCoefficients: Record<BearingType, { X: number; Y: number; e: number }> = {
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

export function lifeExponentFor(type: BearingType): number {
  return isRollerBearingType(type) ? 10 / 3 : 3;
}

function resolveCoefficients(config: BearingConfig): { X: number; Y: number; e: number } {
  if (config.catalogFactors) return config.catalogFactors;
  return bearingCoefficients[config.bearingType];
}

export function calculateBearingEquivalentLoad(config: BearingConfig): number {
  const Fr = Math.abs(config.radialLoad);
  const Fa = Math.abs(config.axialLoad);

  if (isThrustBearingType(config.bearingType)) {
    return Math.max(Fa, 1e-9);
  }

  const { X, Y, e } = resolveCoefficients(config);
  const FaOverFr = Fr > 0 ? Fa / Fr : Number.POSITIVE_INFINITY;

  if (!(FaOverFr > e)) return Fr;
  return Math.max(X * Fr + Y * Fa, Fr);
}

export function equivalentLoadFromRadialAxial(
  Fr: number,
  Fa: number,
  bearingType: BearingType,
  catalogFactors?: { X: number; Y: number; e: number }
): number {
  return calculateBearingEquivalentLoad({
    radialLoad: Fr,
    axialLoad: Fa,
    speed: 1,
    lifeHours: 1,
    safetyFactor: 1,
    bearingType,
    catalogFactors,
    material: { name: "", dynamicRatingFactor: 1, staticRatingFactor: 1, allowableLife: 1 },
  });
}

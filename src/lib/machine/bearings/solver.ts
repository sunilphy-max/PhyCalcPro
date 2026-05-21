import type { BearingConfig, BearingResult, BearingType } from "./types";

const bearingCoefficients: Record<BearingType, { X: number; Y: number; e: number }> = {
  deep_groove: { X: 1.0, Y: 0.0, e: 0.3 },
  angular_contact: { X: 0.56, Y: 1.0, e: 0.22 },
};

export function calculateBearingEquivalentLoad(config: BearingConfig): number {
  const Fr = Math.abs(config.radialLoad);
  const Fa = Math.abs(config.axialLoad);
  const { X, Y, e } = bearingCoefficients[config.bearingType];
  const FaOverFr = Fr > 0 ? Fa / Fr : Number.POSITIVE_INFINITY;
  const activeY = FaOverFr > e ? Y : 0;

  return X * Fr + activeY * Fa;
}

export function solveBearingDesign(config: BearingConfig): BearingResult {
  const equivalentLoad = calculateBearingEquivalentLoad(config);
  const ratingLifeRevolutions = config.lifeHours * config.speed * 60;
  const requiredDynamicRating =
    equivalentLoad * Math.pow(ratingLifeRevolutions / 1e6, 1 / 3) * config.safetyFactor;
  const expectedLife =
    equivalentLoad > 0
      ? Math.pow(config.material.dynamicRatingFactor / equivalentLoad, 3) * 1e6 / config.speed
      : 0;

  return {
    radialLoad: config.radialLoad,
    axialLoad: config.axialLoad,
    equivalentLoad,
    requiredDynamicRating,
    expectedLife,
    safetyFactor: config.safetyFactor,
    bearingType: config.bearingType,
    material: config.material,
  };
}

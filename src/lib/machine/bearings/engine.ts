import type { BearingConfig, BearingResult } from "./types";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import { solveBearingDesign } from "./solver";

export function solveBearingEngine(config: BearingConfig): BearingResult {
  if (config.radialLoad < 0) throw new Error("Radial load must be non-negative");
  if (config.axialLoad < 0) throw new Error("Axial load must be non-negative");
  if (config.speed <= 0) throw new Error("Bearing speed must be positive");
  if (config.lifeHours <= 0) throw new Error("Target life must be positive hours");
  if (config.safetyFactor < 1) throw new Error("Safety factor must be at least 1");

  const dynamicLoadRatingN =
    config.dynamicLoadRatingN ?? config.material.dynamicRatingFactor;
  if (dynamicLoadRatingN <= 0) {
    throw new Error("Dynamic load rating C must be positive");
  }

  if (config.designation) {
    const entry = findBearing(config.designation);
    if (entry) {
      const result = solveBearingDesign({
        ...config,
        dynamicLoadRatingN: entry.dynamicRatingN,
        staticLoadRatingN: entry.staticRatingN,
        limitingSpeedRpm: entry.limitingSpeedRpm,
        designation: entry.designation,
        bearingType: entry.type,
        catalogFactors: entry.catalogFactors,
      });
      result.geometry = {
        boreMm: entry.boreMm,
        outerDiameterMm: entry.outerDiameterMm,
        widthMm: entry.widthMm,
      };
      return result;
    }
  }

  return solveBearingDesign({
    ...config,
    dynamicLoadRatingN,
    staticLoadRatingN:
      config.staticLoadRatingN ?? config.material.staticRatingFactor,
  });
}

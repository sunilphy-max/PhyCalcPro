import type { BearingConfig, BearingResult } from "./types";
import { solveBearingDesign } from "./solver";

export function solveBearingEngine(config: BearingConfig): BearingResult {
  if (config.radialLoad < 0) {
    throw new Error("Radial load must be non-negative");
  }
  if (config.axialLoad < 0) {
    throw new Error("Axial load must be non-negative");
  }
  if (config.speed <= 0) {
    throw new Error("Bearing speed must be positive");
  }
  if (config.lifeHours <= 0) {
    throw new Error("Target life must be positive hours");
  }
  if (config.safetyFactor < 1) {
    throw new Error("Safety factor must be at least 1");
  }
  if (config.material.dynamicRatingFactor <= 0) {
    throw new Error("Material dynamic rating factor must be positive");
  }

  return solveBearingDesign(config);
}

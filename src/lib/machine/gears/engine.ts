import type { GearConfig, GearResult } from "./types";
import { solveGearDesign } from "./solver";

export function solveGearEngine(config: GearConfig): GearResult {
  if (config.power <= 0) {
    throw new Error("Power must be positive");
  }
  if (config.speed <= 0) {
    throw new Error("Speed must be positive");
  }
  if (config.module <= 0) {
    throw new Error("Gear module must be positive");
  }
  if (config.faceWidth <= 0) {
    throw new Error("Face width must be positive");
  }
  if (config.pinionTeeth <= 0) {
    throw new Error("Pinion teeth count must be positive");
  }
  if (config.gearRatio <= 0) {
    throw new Error("Gear ratio must be positive");
  }
  if (config.material.yieldStress <= 0) {
    throw new Error("Material yield strength must be positive");
  }

  return solveGearDesign(config);
}

import type { PressureVesselConfig, PressureVesselResult } from "./types";
import { solvePressureVesselFEM } from "./solver";

export function solvePressureVesselEngine(config: PressureVesselConfig): PressureVesselResult {
  if (config.radius <= 0) {
    throw new Error("Radius must be positive");
  }
  if (config.thickness <= 0) {
    throw new Error("Thickness must be positive");
  }
  if (config.length <= 0) {
    throw new Error("Length must be positive");
  }
  if (config.pressure <= 0) {
    throw new Error("Internal pressure must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Young's modulus must be positive");
  }
  if (config.segments < 8) {
    throw new Error("Mesh must use at least 8 segments");
  }

  return solvePressureVesselFEM(config);
}

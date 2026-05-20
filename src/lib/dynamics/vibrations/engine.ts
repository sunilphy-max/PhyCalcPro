import type { VibrationConfig, VibrationResult } from "./types";
import { solveVibrationFEM } from "./solver";

export function solveVibrationEngine(config: VibrationConfig): VibrationResult {
  if (config.length <= 0) {
    throw new Error("Beam length must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Elastic modulus must be positive");
  }
  if (config.I <= 0) {
    throw new Error("Second moment of inertia must be positive");
  }
  if (config.A <= 0) {
    throw new Error("Cross-sectional area must be positive");
  }
  if (config.rho <= 0) {
    throw new Error("Density must be positive");
  }
  if (config.segments < 2) {
    throw new Error("Mesh must use at least two segments");
  }

  return solveVibrationFEM(config);
}

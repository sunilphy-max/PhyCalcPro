import type { PressurePipeConfig, PressurePipeResult } from "./types";
import { solvePressurePipeFEM } from "./solver";

export function solvePressurePipeEngine(config: PressurePipeConfig): PressurePipeResult {
  if (config.radius <= 0) {
    throw new Error("Radius must be positive");
  }
  if (config.thickness <= 0) {
    throw new Error("Thickness must be positive");
  }
  if (config.length <= 0) {
    throw new Error("Length must be positive");
  }
  if (config.segments < 8) {
    throw new Error("Use at least 8 segments for adequate ring resolution");
  }
  if (config.pressure <= 0) {
    throw new Error("Internal pressure must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Young's modulus must be positive");
  }

  return solvePressurePipeFEM(config);
}

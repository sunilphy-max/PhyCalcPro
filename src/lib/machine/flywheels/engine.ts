import type { FlywheelConfig, FlywheelResult } from "./types";
import { solveFlywheelDesign } from "./solver";

export function solveFlywheelEngine(config: FlywheelConfig): FlywheelResult {
  if (config.outerDiameter <= 0) {
    throw new Error("Outer diameter must be positive.");
  }
  if (config.thickness <= 0) {
    throw new Error("Thickness must be positive.");
  }
  if (config.faceWidth <= 0) {
    throw new Error("Face width must be positive.");
  }
  if (config.density <= 0) {
    throw new Error("Material density must be positive.");
  }
  if (config.rpm <= 0) {
    throw new Error("Rotational speed must be positive.");
  }
  if (config.yieldStress <= 0) {
    throw new Error("Yield stress must be positive.");
  }

  return solveFlywheelDesign(config);
}

import type { RivetConfig, RivetResult } from "./types";
import { solveRivetDesign } from "./solver";

export function solveRivetEngine(config: RivetConfig): RivetResult {
  if (config.rivetDiameter <= 0) {
    throw new Error("Rivet diameter must be positive.");
  }
  if (config.plateThickness <= 0) {
    throw new Error("Plate thickness must be positive.");
  }
  if (config.quantity < 1) {
    throw new Error("Quantity must be at least one rivet.");
  }
  if (config.shearForce < 0 || config.axialForce < 0) {
    throw new Error("Loads must be non-negative.");
  }
  if (config.material.yieldStress <= 0) {
    throw new Error("Material strength must be positive.");
  }
  return solveRivetDesign(config);
}

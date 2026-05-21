import type { WeldConfig, WeldResult } from "./types";
import { solveWeldDesign } from "./solver";

export function solveWeldEngine(config: WeldConfig): WeldResult {
  if (config.weldSize <= 0) {
    throw new Error("Weld size must be positive.");
  }
  if (config.weldLength <= 0) {
    throw new Error("Weld length must be positive.");
  }
  if (config.weldCount < 1) {
    throw new Error("Weld count must be at least one.");
  }
  if (config.shearForce < 0 || config.axialForce < 0) {
    throw new Error("Applied loads must be non-negative.");
  }
  if (config.material.strength <= 0) {
    throw new Error("Material strength must be positive.");
  }

  return solveWeldDesign(config);
}

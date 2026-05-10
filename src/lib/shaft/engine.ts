/**
 * Shaft Engine
 * High-level wrapper for shaft solver with validation
 */

import type { ShaftConfig, ShaftResult } from "./types";
import { solveShaft } from "./solver";

/**
 * Solve shaft design with validation
 */
export function solveShaftEngine(config: ShaftConfig): ShaftResult {
  // Validate geometry
  if (config.geometry.diameter <= 0) {
    throw new Error("Shaft diameter must be positive");
  }
  if (config.geometry.length <= 0) {
    throw new Error("Shaft length must be positive");
  }

  // Validate material
  if (config.material.E <= 0) {
    throw new Error("Elastic modulus must be positive");
  }
  if (config.material.G <= 0) {
    throw new Error("Shear modulus must be positive");
  }

  // Solve
  return solveShaft(config);
}

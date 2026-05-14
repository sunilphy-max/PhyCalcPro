/**
 * Buckling Engine
 * High-level wrapper for FEA-based buckling solver with validation
 */

import type { BucklingConfig, BucklingResult } from "./types";
import { solveBucklingFEM } from "./femSolver";

/**
 * Solve buckling with validation and FEA-based analysis
 */
export function solveBucklingEngine(
  config: BucklingConfig
): BucklingResult {
  // Validate inputs
  if (config.length <= 0) {
    throw new Error("Column length must be positive");
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
  if (config.P < 0) {
    throw new Error("Applied load must be non-negative");
  }

  // Solve using FEA
  return solveBucklingFEM(config);
}

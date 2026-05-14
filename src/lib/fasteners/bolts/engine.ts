/**
 * Screw Design Engine
 * Validation and FEA-based calculation wrapper for screw analysis
 */

import { solveScrewFEM } from "./femSolver";
import { validateScrewConfig } from "./validators";
import type { ScrewConfig, ScrewResult } from "./types";

export function solveScrewEngine(config: ScrewConfig): ScrewResult {
  // Validate input configuration
  const validation = validateScrewConfig(config);
  if (!validation.isValid) {
    throw new Error(`Invalid screw configuration: ${validation.errors.join(", ")}`);
  }

  try {
    // Solve the screw analysis using FEA
    const result = solveScrewFEM(config);

    // Additional validation on results
    if (result.efficiency < 0 || result.efficiency > 100) {
      throw new Error("Invalid efficiency calculation");
    }

    if (result.safetyFactor <= 0) {
      throw new Error("Invalid safety factor calculation");
    }

    return result;
  } catch (error) {
    console.error("Screw calculation error:", error);
    throw new Error(`Screw calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

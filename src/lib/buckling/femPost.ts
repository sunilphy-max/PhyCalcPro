/**
 * Buckling Post-Processing
 * Extracts mode shapes and critical loads from eigenvalue analysis
 */

import type { BucklingFEMModel, BucklingStressData, EndCondition } from "./femTypes";

/**
 * Extract and scale mode shapes from eigenvectors
 */
export function extractModeShapes(
  model: BucklingFEMModel,
  eigenvectors: number[][],
  numberOfModes: number = 3
): BucklingStressData {
  const x = model.nodes.map((n) => n.x);
  const nDOF = model.nodes.length * 2;

  // Extract deflections (every other DOF, starting at 0)
  const modes: number[][] = [];
  for (let mode = 0; mode < Math.min(numberOfModes, eigenvectors.length); mode++) {
    const deflection: number[] = [];
    const maxDefl = Math.max(...eigenvectors[mode].map((v) => Math.abs(v)));
    const scaleFactor = maxDefl > 0 ? 0.05 / maxDefl : 1; // Normalize to 5% deflection

    for (let i = 0; i < model.nodes.length; i++) {
      deflection.push(eigenvectors[mode][i * 2] * scaleFactor);
    }

    modes.push(deflection);
  }

  // Pad with zeros if fewer than 3 modes computed
  while (modes.length < 3) {
    modes.push(Array(model.nodes.length).fill(0));
  }

  return {
    x,
    mode1: modes[0],
    mode2: modes[1],
    mode3: modes[2],
  };
}

/**
 * Determine safety status based on load and critical load
 */
export function determineBucklingSafety(
  appliedLoad: number,
  criticalLoad: number,
  safetyFactor: number
): "safe" | "warning" | "critical" {
  const ratio = appliedLoad / criticalLoad;

  if (ratio < 1 / safetyFactor) {
    return "safe";
  } else if (ratio < 0.9) {
    return "warning";
  } else {
    return "critical";
  }
}

/**
 * Calculate effective length based on end condition
 */
export function getEffectiveLength(length: number, endCondition: EndCondition): number {
  switch (endCondition) {
    case "pinned":
      return length;
    case "fixed":
      return length / 2;
    case "cantilever":
      return 2 * length;
    case "guided":
      return length;
    default:
      return length;
  }
}

/**
 * Calculate radius of gyration from I and A
 */
export function getRadiusOfGyration(I: number, A: number): number {
  return Math.sqrt(I / A);
}

/**
 * Calculate slenderness ratio
 */
export function getSlendernessRatio(effectiveLength: number, radiusOfGyration: number): number {
  return effectiveLength / radiusOfGyration;
}

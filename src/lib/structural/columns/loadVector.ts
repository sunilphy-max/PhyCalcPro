/**
 * Buckling Load Vector and Constraints
 * Handles boundary conditions for different end configurations
 */

import type { EndCondition } from "./femTypes";

/**
 * Apply boundary conditions based on end condition type
 * Returns list of constrained DOF indices
 */
export function applyBucklingConstraints(
  nDOF: number,
  endCondition: EndCondition
): number[] {
  const constraints: number[] = [];

  switch (endCondition) {
    case "pinned":
      // Pinned-pinned: constrain vertical displacement at both ends
      constraints.push(0); // v at node 0
      constraints.push(nDOF - 2); // v at last node
      break;

    case "fixed":
      // Fixed-fixed: constrain v and θ at both ends
      constraints.push(0, 1); // v, θ at node 0
      constraints.push(nDOF - 2, nDOF - 1); // v, θ at last node
      break;

    case "cantilever":
      // Cantilever: fix at base, free at tip
      constraints.push(0, 1); // v, θ at fixed base
      break;

    case "guided":
      // Guided: constrain v at both ends, allow rotation
      constraints.push(0); // v at node 0
      constraints.push(nDOF - 2); // v at last node
      break;

    default:
      constraints.push(0, nDOF - 2);
  }

  return constraints;
}

/**
 * Create empty load vector (no distributed loads for buckling)
 * Only applied end load matters via eigenvalue analysis
 */
export function createLoadVector(nDOF: number): number[] {
  return Array(nDOF).fill(0);
}

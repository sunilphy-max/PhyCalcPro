/**
 * Shaft Load Vector Assembly
 * Converts distributed and concentrated loads to global force vector
 */

import type { LoadCase } from "./types";

export type LoadVector = {
  F: number[];
  constraints: { dof: number; value: number }[];
};

/**
 * Create load vector for distributed loads on shaft
 * Converts point loads, distributed torques, etc. to nodal forces
 */
export function createLoadVector(
  nNodes: number,
  loads: LoadCase[],
  length: number
): { F: number[]; appliedLoads: LoadCase[] } {
  const nDOF = nNodes * 6;
  const F: number[] = Array(nDOF).fill(0);

  // Map concentrated loads to nearest nodes
  for (const load of loads) {
    // Find closest node to load position
    const fractionalPosition = load.position / length;
    const nodeIndex = Math.round(fractionalPosition * (nNodes - 1));

    // DOF mapping: [u, v, w, θx, θy, θz]
    const nodeDOF = nodeIndex * 6;

    // Apply torque (θx - around x-axis)
    if (load.torque) {
      F[nodeDOF + 3] += load.torque;
    }

    // Apply bending moment (θy - around y-axis, moment in XZ plane)
    if (load.bendingMoment) {
      F[nodeDOF + 4] += load.bendingMoment;
    }

    // Apply axial force if present
    if (load.axialForce) {
      F[nodeDOF + 0] += load.axialForce;
    }
  }

  return { F, appliedLoads: loads };
}

/**
 * Apply support constraints
 * Returns constrained DOF list for fixed end conditions
 */
export function applyConstraints(
  nNodes: number,
  supportType: "fixed" | "pinned" | "free"
): { dof: number; value: number }[] {
  const constraints: { dof: number; value: number }[] = [];

  if (supportType === "fixed") {
    // First node: fix all DOF
    for (let i = 0; i < 6; i++) {
      constraints.push({ dof: i, value: 0 });
    }
  } else if (supportType === "pinned") {
    // First node: fix translations only
    for (let i = 0; i < 3; i++) {
      constraints.push({ dof: i, value: 0 });
    }
  }

  // Last node: may have different constraints if needed
  // For now, typically free end

  return constraints;
}

/**
 * Screws Load Vector and Constraints
 * Handles loads and boundary conditions
 */

/**
 * Create load vector for axial force
 */
export function createLoadVector(nNodes: number, axialForce: number): number[] {
  const F = Array(nNodes).fill(0);

  // Apply axial load at tip
  if (nNodes > 0) {
    F[nNodes - 1] = axialForce;
  }

  return F;
}

/**
 * Apply boundary conditions (fixed at base)
 */
export function applyConstraints(nNodes: number): number[] {
  return [0]; // Fix first node (base)
}

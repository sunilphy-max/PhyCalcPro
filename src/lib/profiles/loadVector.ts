/**
 * Profiles Load Vector
 * Simple module for consistency with FEA infrastructure pattern
 */

export function createLoadVector(numNodes: number): number[] {
  // Not used for area properties, but included for consistency
  return Array(numNodes).fill(0);
}

/**
 * Profiles Linear Solver
 * Simple module for consistency with FEA infrastructure pattern
 */

export function solveSystem(K: number[][], F: number[]): number[] {
  // Not used for area properties analysis
  return F;
}

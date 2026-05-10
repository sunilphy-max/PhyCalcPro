/**
 * Buckling Module Types
 * Column buckling analysis using Euler formulas
 */

export type EndCondition = "pinned" | "fixed" | "cantilever" | "guided";

export type BucklingConfig = {
  length: number; // Column length (m)
  E: number; // Elastic modulus (Pa)
  I: number; // Second moment of inertia (m^4)
  A: number; // Cross-sectional area (m^2)
  P: number; // Applied axial load (N)
  endCondition: EndCondition; // Boundary conditions
};

export type BucklingResult = {
  // Critical buckling load (N)
  Pcr: number;

  // Euler buckling formula components
  k: number; // Effective length factor
  Le: number; // Effective length (m)

  // Stress values
  stress: number; // Applied stress (Pa)
  criticalStress: number; // Critical buckling stress (Pa)
  safetyFactor: number; // Ratio of Pcr to P

  // Slenderness ratio
  slenderness: number; // Le / r
  radius: number; // Radius of gyration (m)

  // Mode shape (for visualization)
  x: number[];
  deflection: number[];

  // Summary
  isSafe: boolean;
  bucklingMode: "elastic" | "inelastic" | "critical";
};

/**
 * Buckling Module Types
 * Column buckling analysis using FEA-based eigenvalue analysis
 */

export type EndCondition = "pinned" | "fixed" | "cantilever" | "guided";

export type BucklingConfig = {
  length: number; // Column length (m)
  E: number; // Elastic modulus (Pa)
  I: number; // Second moment of inertia (m^4)
  A: number; // Cross-sectional area (m^2)
  P: number; // Applied axial load (N)
  endCondition: EndCondition; // Boundary conditions
  meshSegments?: number; // FEA mesh segments
  fy?: number; // Yield strength (Pa) — used by design-code checks
};

export type BucklingResult = {
  // Critical buckling load (FEA-based)
  Pcr: number;
  criticalLoad: number;

  // Effective length parameters
  k: number; // Effective length factor
  Le: number; // Effective length (m)

  // Stress values
  stress: number; // Applied stress (Pa)
  criticalStress: number; // Critical buckling stress (Pa)
  safetyFactor: number; // Ratio of Pcr to P

  // Slenderness ratio
  slenderness: number; // Le / r
  radius: number; // Radius of gyration (m)

  // Mode shapes (FEA-based)
  x: number[];
  deflection: number[]; // Primary (first) mode
  mode1: number[]; // First buckling mode
  mode2: number[]; // Second buckling mode
  mode3: number[]; // Third buckling mode
  eigenvalues: number[]; // Load factors from eigenvalue analysis

  // Safety assessment
  isSafe: boolean;
  bucklingMode: "elastic" | "inelastic" | "critical";
  designStatus: "safe" | "warning" | "critical";

  // Analysis metadata
  analysisType: "FEA";

  // Base-unit (SI) snapshot for design-code checks. These stay in Pa/N/m²
  // even when the display copies of Pcr/stress are converted to UI units.
  codeCheckBasis?: {
    fyPa: number;
    eulerStressPa: number;
    appliedLoadN: number;
    areaM2: number;
    elasticModulusPa: number;
    slenderness: number;
  };
};

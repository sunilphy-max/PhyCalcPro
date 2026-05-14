/**
 * Shaft Design Module Types
 * Shaft stress and deflection analysis
 */

export type ShaftMaterial = {
  name: string;
  E: number; // Elastic modulus (Pa)
  G: number; // Shear modulus (Pa)
  density: number; // Density (kg/m³)
  yieldStress: number; // Yield stress (Pa)
};

export type ShaftGeometry = {
  diameter: number; // Shaft diameter (m)
  length: number; // Shaft length (m)
};

export type LoadCase = {
  position: number; // Position along shaft (m)
  torque?: number; // Torque (N·m)
  bendingMoment?: number; // Bending moment (N·m)
  axialForce?: number; // Axial force (N)
};

export type ShaftConfig = {
  geometry: ShaftGeometry;
  material: ShaftMaterial;
  loads: LoadCase[];
  meshSegments?: number;
};

export type ShaftResult = {
  // Position data
  x: number[];

  // Load distributions
  torqueDistribution: number[];
  bendingMomentDistribution: number[];

  // Stress components (FEA-based)
  shearStress: number[]; // Torsional shear (Pa)
  bendingStress: number[]; // Bending stress (Pa)
  vonMisesStress: number[]; // Combined Von Mises stress (Pa)

  // Deflection/rotation
  deflection: number[]; // Bending deflection (m)
  rotation: number[]; // Torsional rotation (rad)

  // Summary metrics
  maxStress: number; // Max Von Mises stress (Pa)
  maxShearStress: number;
  maxBendingStress: number;
  maxDeflection: number;
  maxTorque: number;
  maxBendingMoment: number;
  safetyFactor: number;

  // Design evaluation
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;

  // Critical locations
  criticalSection: number; // Position of max stress (m)

  // Dynamic analysis
  criticalSpeed: number; // First critical speed (RPM)

  // Analysis metadata
  analysisType: "FEA";

  // Geometry (for display)
  diameter?: number;
  radius?: number;
  polarMoment?: number;
  secondMoment?: number;
};

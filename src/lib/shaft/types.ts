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
  // Geometry properties
  diameter: number;
  radius: number;
  polarMoment: number; // J (m^4)
  secondMoment: number; // I (m^4)

  // Position data
  x: number[];

  // Stress components
  shearStress: number[]; // Torsional shear (Pa)
  bendingStress: number[]; // Bending stress (Pa)
  combinedStress: number[]; // Von Mises equivalent (Pa)

  // Deflection/rotation
  deflection: number[]; // Bending deflection (m)
  rotation: number[]; // Torsional rotation (rad)

  // Summary metrics
  maxShearStress: number;
  maxBendingStress: number;
  maxCombinedStress: number;
  maxDeflection: number;
  maxRotation: number;
  safetyFactor: number;
  isSafe: boolean;

  // Critical locations
  criticalSection: number; // Position of max stress (m)
};

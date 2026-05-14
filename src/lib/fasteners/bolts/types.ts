/**
 * Screw Design Module Types
 * Power screw and ball screw calculations
 */

export type ScrewType = "power_screw" | "ball_screw";

export type ThreadType = "square" | "acme" | "buttress";

export type PowerScrewConfig = {
  screwType: "power_screw";
  threadType: ThreadType;

  // Basic dimensions
  majorDiameter: number; // D (m)
  pitch: number; // p (m)
  lead: number; // L (m) - for multi-start screws
  length: number; // Length of screw (m)

  // Forces
  axialForce: number; // F (N) - axial load
  torque?: number; // T (N·m) - applied torque (optional)

  // Material properties
  frictionCoefficient: number; // μ - coefficient of friction
  efficiency?: number; // η - mechanical efficiency (calculated if not provided)

  // Operating conditions
  starts: number; // Number of thread starts
};

export type BallScrewConfig = {
  screwType: "ball_screw";

  // Basic dimensions
  majorDiameter: number; // D (m)
  pitch: number; // p (m)
  lead: number; // L (m)
  ballDiameter: number; // d_b (m)
  contactAngle: number; // α (degrees)

  // Forces
  axialForce: number; // F (N)
  preload?: number; // F_pre (N)

  // Material properties
  frictionCoefficient: number; // μ
  dynamicViscosity?: number; // η (Pa·s) for lubrication

  // Operating conditions
  speed: number; // n (rpm)
  temperature?: number; // T (°C)
};

export type ScrewConfig = PowerScrewConfig | BallScrewConfig;

export type ScrewResult = {
  // Basic parameters
  screwType: ScrewType;
  threadType?: ThreadType;

  // Thread geometry
  majorDiameter: number;
  minorDiameter: number;
  pitchDiameter: number;
  pitch: number;
  lead: number;
  helixAngle: number; // φ (degrees)

  // Force analysis
  axialForce: number;
  torque: number;
  efficiency: number;

  // Stress analysis
  shearStress: number; // τ (Pa)
  compressiveStress: number; // σ_c (Pa)
  vonMisesStress: number; // σ_vm (Pa)

  // Safety factors
  safetyFactor: number;
  fatigueSafetyFactor: number;

  // Power and efficiency
  power: number; // P (W)
  speed?: number; // n (rpm)

  // Ball screw specific
  ballCirculation?: number;
  recirculationPath?: string;
  dynamicLoadRating?: number;

  // Critical parameters
  criticalSpeed?: number; // N_cr (rpm)
  bucklingLoad?: number; // F_cr (N)

  // Design recommendations
  designStatus: "safe" | "warning" | "critical";
  recommendations: string[];
};

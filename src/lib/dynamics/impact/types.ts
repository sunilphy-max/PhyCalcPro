export type ImpactConfig = {
  mass: number;
  velocityChange: number;
  impactDuration: number;
  crossSectionArea: number;
  yieldStrength: number;
  /** Structural stiffness (N/m) for SDOF peak estimate; derived from duration if omitted. */
  stiffness?: number;
  /** Damping ratio ζ for energy absorption estimate. */
  dampingRatio?: number;
};

export type ImpactResult = {
  impulse: number;
  averageForce: number;
  dynamicStress: number;
  kineticEnergy: number;
  sdofPeakForce: number;
  dynamicAmplification: number;
  peakDynamicStress: number;
  energyAbsorbed: number;
  safetyFactor: number;
  designStatus: "safe" | "warning" | "critical";
};

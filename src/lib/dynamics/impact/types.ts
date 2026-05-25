export type ImpactConfig = {
  mass: number;
  velocityChange: number;
  impactDuration: number;
  crossSectionArea: number;
  yieldStrength: number;
};

export type ImpactResult = {
  impulse: number;
  averageForce: number;
  dynamicStress: number;
  safetyFactor: number;
  designStatus: "safe" | "warning" | "critical";
};

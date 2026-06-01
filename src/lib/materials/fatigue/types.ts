export type FatigueConfig = {
  alternatingStress: number;
  meanStress: number;
  ultimateStrength: number;
  enduranceLimit: number;
  meanStressMethod?: "goodman" | "gerber" | "morrow";
};

export type FatigueResult = {
  allowableStress: number;
  correctedEndurance: number;
  predictedCycles: number;
  safetyFactor: number;
  designStatus: "safe" | "warning" | "critical";
};

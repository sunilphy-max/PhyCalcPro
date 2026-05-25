export type CombinedLoadingConfig = {
  axialForce: number;
  bendingMoment: number;
  torque: number;
  shearForce: number;
  width: number;
  height: number;
  yieldStrength: number;
};

export type CombinedLoadingResult = {
  area: number;
  Ixx: number;
  J: number;
  axialStress: number;
  bendingStress: number;
  torsionalShear: number;
  shearStress: number;
  vonMisesStress: number;
  safetyFactor: number;
  designStatus: "safe" | "warning" | "critical";
};

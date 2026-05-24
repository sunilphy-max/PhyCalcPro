export type SafetyFactorConfig = {
  diameter: number;
  axialForce: number;
  shearForce: number;
  bendingMoment: number;
  torque: number;
  yieldStrength: number;
  ultimateStrength: number;
};

export type SafetyFactorResult = {
  diameter: number;
  area: number;
  polarMoment: number;
  axialStress: number;
  bendingStress: number;
  torsionalStress: number;
  shearStress: number;
  vonMisesStress: number;
  safetyFactorYield: number;
  safetyFactorUltimate: number;
  governingFactor: number;
  governingLimit: "yield" | "ultimate";
  designStatus: "safe" | "warning" | "critical";
};

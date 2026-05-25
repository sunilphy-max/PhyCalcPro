export type LoadCase = {
  name: string;
  axialForce: number;
  bendingMoment: number;
  shearForce: number;
};

export type LoadCaseManagerConfig = {
  cases: LoadCase[];
  width: number;
  height: number;
  yieldStrength: number;
};

export type LoadCaseManagerResult = {
  envelopeAxial: number;
  envelopeMoment: number;
  envelopeShear: number;
  axialStress: number;
  bendingStress: number;
  shearStress: number;
  combinedStress: number;
  safetyFactor: number;
  designStatus: "safe" | "warning" | "critical";
};

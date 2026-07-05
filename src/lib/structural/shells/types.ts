export type ShellConfig = {
  radius: number;
  thickness: number;
  length: number;
  internalPressure: number;
  axialForce: number;
  bendingMoment: number;
  modulus: number;
  poisson: number;
  endCondition: "open" | "closed";
  allowableStress: number;
};

export type ShellResult = {
  hoopStress: number;
  axialStress: number;
  bendingStress: number;
  vonMisesStress: number;
  safetyFactor: number;
  maxDeflection: number;
  status: string;
};

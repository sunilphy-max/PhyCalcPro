export type TorsionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  legLength: number;
  modulus: number;
  deflectionAngleDeg: number;
  ultimateStrength: number;
};
export type TorsionSpringResult = {
  springRate: number;
  torque: number;
  bendingStress: number;
  safetyFactor: number;
};

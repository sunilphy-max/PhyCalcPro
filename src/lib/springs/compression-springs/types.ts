export type CompressionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  modulus: number;
  deflection: number;
  ultimateStrength: number;
};
export type CompressionSpringResult = {
  springRate: number;
  solidHeight: number;
  maxLoad: number;
  shearStress: number;
  safetyFactor: number;
  naturalFrequency: number;
};

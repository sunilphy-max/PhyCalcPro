export type FlywheelConfig = {
  outerDiameter: number;
  thickness: number;
  faceWidth: number;
  density: number;
  rpm: number;
  yieldStress: number;
};

export type FlywheelResult = {
  outerDiameter: number;
  thickness: number;
  faceWidth: number;
  mass: number;
  inertia: number;
  angularSpeed: number;
  storedEnergy: number;
  hoopStress: number;
  specificSpeed: number;
  safetyFactor: number;
};

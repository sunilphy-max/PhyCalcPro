export type HydraulicsConfig = {
  boreDiameter: number;
  rodDiameter: number;
  strokeLength: number;
  pressure: number;
  forceGoal: number;
};

export type HydraulicsResult = {
  boreDiameter: number;
  rodDiameter: number;
  strokeLength: number;
  pistonArea: number;
  rodArea: number;
  annulusArea: number;
  extendForce: number;
  retractForce: number;
  fluidVolume: number;
  requiredPressure: number;
  pressureUtilization: number;
  rodStress: number;
};

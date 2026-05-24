import type { HydraulicsConfig, HydraulicsResult } from "./types";

export function solveHydraulicsEngine(config: HydraulicsConfig): HydraulicsResult {
  const boreDiameter = Math.max(config.boreDiameter, 1e-6);
  const rodDiameter = Math.min(Math.max(config.rodDiameter, 0), boreDiameter);
  const strokeLength = Math.max(config.strokeLength, 0);
  const pistonArea = (Math.PI * boreDiameter ** 2) / 4;
  const rodArea = (Math.PI * rodDiameter ** 2) / 4;
  const annulusArea = Math.max(pistonArea - rodArea, 0);
  const extendForce = config.pressure * pistonArea;
  const retractForce = config.pressure * annulusArea;
  const fluidVolume = pistonArea * strokeLength;
  const requiredPressure = pistonArea > 0 ? config.forceGoal / pistonArea : 0;
  const pressureUtilization = requiredPressure > 0 ? config.pressure / requiredPressure : 0;
  const rodStress = rodArea > 0 ? extendForce / rodArea : 0;

  return {
    boreDiameter,
    rodDiameter,
    strokeLength,
    pistonArea,
    rodArea,
    annulusArea,
    extendForce,
    retractForce,
    fluidVolume,
    requiredPressure,
    pressureUtilization,
    rodStress,
  };
}

import type { BrakesClutchesConfig, BrakesClutchesResult } from "./types";
export function solveBrakesClutchesEngine(c: BrakesClutchesConfig): BrakesClutchesResult {
  const ro = c.outerRadius;
  const ri = c.innerRadius;
  const rMean = (2 / 3) * ((ro ** 3 - ri ** 3) / Math.max(ro ** 2 - ri ** 2, 1e-9));
  const frictionTorque = c.frictionCoeff * c.actuationForce * rMean;
  const omega = (2 * Math.PI * c.speed) / 60;
  const powerDissipated = frictionTorque * omega;
  const energyPerStop = powerDissipated * c.engagementTime;
  const safetyFactor = frictionTorque / Math.max(c.actuationForce * c.frictionCoeff * ri, 1e-9);
  return { frictionTorque, powerDissipated, energyPerStop, safetyFactor };
}

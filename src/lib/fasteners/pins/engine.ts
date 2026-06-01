import type { PinConfig, PinResult } from "./types";
export function solvePinEngine(c: PinConfig): PinResult {
  const A = Math.PI * (c.pinDiameter / 2) ** 2;
  const shearStress = c.force / (c.pinCount * A);
  const bearingStress = c.force / (c.pinCount * c.pinDiameter * c.plateThickness);
  const tauAllow = 0.6 * c.pinMaterialYield;
  const sigmaAllow = 1.5 * c.pinMaterialYield;
  return { shearStress, bearingStress, shearSafety: tauAllow / Math.max(shearStress, 1e-9), bearingSafety: sigmaAllow / Math.max(bearingStress, 1e-9) };
}

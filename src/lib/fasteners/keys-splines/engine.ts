import type { KeysSplinesConfig, KeysSplinesResult } from "./types";
export function solveKeysSplinesEngine(c: KeysSplinesConfig): KeysSplinesResult {
  const d = Math.max(c.shaftDiameter, 1e-9);
  const L = Math.max(c.keyLength, 1e-9);
  const shearArea = c.keyWidth * L;
  const bearingArea = c.keyHeight * L / 2;
  const shearStress = c.torque / (0.5 * d * shearArea);
  const bearingStress = (2 * c.torque) / (d * bearingArea);
  const tauAllow = 0.6 * c.yieldStress;
  const sigmaAllow = 1.5 * c.yieldStress;
  const capacityTorque = Math.min(tauAllow * 0.5 * d * shearArea, sigmaAllow * d * bearingArea / 2);
  return { shearStress, bearingStress, shearSafety: tauAllow / Math.max(shearStress, 1e-9), bearingSafety: sigmaAllow / Math.max(bearingStress, 1e-9), capacityTorque };
}

import type { TorsionSpringConfig, TorsionSpringResult } from "./types";

export function solveTorsionSpringEngine(c: TorsionSpringConfig): TorsionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const E = c.modulus;
  const springRate = (E * d ** 4) / (116 * D * n);
  const angleRad = (c.deflectionAngleDeg * Math.PI) / 180;
  const torque = springRate * angleRad;
  const bendingStress = (32 * torque) / (Math.PI * d ** 3);
  const safetyFactor = c.ultimateStrength / Math.max(bendingStress, 1e-9);
  return { springRate, torque, bendingStress, safetyFactor };
}

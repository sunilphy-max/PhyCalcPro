import type { BevelGearConfig, BevelGearResult } from "./types";
export function solveBevelGearEngine(c: BevelGearConfig): BevelGearResult {
  const z1 = Math.max(12, Math.round(c.pinionTeeth));
  const z2 = Math.max(z1, Math.round(z1 * c.gearRatio));
  const d = c.module * z1;
  const torque = (60 * c.power) / (2 * Math.PI * Math.max(c.speed, 1));
  const Ft = (2 * torque) / Math.max(d, 1e-9);
  const Y = Math.max(0.15, 0.484 - 2.87 / z1);
  const bendingStress = Ft / (c.faceWidth * c.module * Y);
  const Eeff = 210e9;
  const contactStress = Math.sqrt((Ft / (c.faceWidth * Math.PI)) * Eeff * (2 / Math.max(d, 1e-6)));
  return { gearTeeth: z2, pitchDiameter: d, tangentialForce: Ft, bendingStress, contactStress, bendingSafety: c.yieldStress / Math.max(bendingStress, 1e-9), contactSafety: c.yieldStress / Math.max(contactStress, 1e-9) };
}

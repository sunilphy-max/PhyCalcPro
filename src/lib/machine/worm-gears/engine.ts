import type { WormGearConfig, WormGearResult } from "./types";
export function solveWormGearEngine(c: WormGearConfig): WormGearResult {
  const ratio = Math.max(c.gearTeeth, 1) / Math.max(c.wormStarts, 1);
  const lambda = (c.leadAngleDeg * Math.PI) / 180;
  const mu = c.frictionCoeff;
  const efficiency = Math.tan(lambda) / (Math.tan(lambda) + mu);
  const torque = (60 * c.power) / (2 * Math.PI * Math.max(c.speed, 1) * efficiency);
  const d = c.module * Math.max(c.wormStarts, 1);
  const contactStress = Math.sqrt(((2 * torque) / (d * c.faceWidth)) * 210e9 * 0.001);
  const axialForce = (2 * torque) / Math.max(d, 1e-9);
  return { ratio, efficiency, wormTorque: torque, contactStress, contactSafety: c.yieldStress / Math.max(contactStress, 1e-9), axialForce };
}

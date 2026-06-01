import type { ShaftHubConfig, ShaftHubResult } from "./types";
export function solveShaftHubEngine(c: ShaftHubConfig): ShaftHubResult {
  const di = Math.max(c.shaftDiameter, 1e-9);
  const do_ = Math.max(c.hubOuterDiameter, di + 1e-6);
  const delta = c.interference;
  const E = c.modulus;
  const C = (do_ ** 2 + di ** 2) / (do_ ** 2 - di ** 2);
  const contactPressure = (E * delta) / (2 * di * C);
  const frictionTorque = contactPressure * Math.PI * di * c.hubLength * c.frictionCoeff * di / 2;
  const requiredAssemblyForce = contactPressure * Math.PI * di * c.hubLength;
  return { contactPressure, frictionTorque, requiredAssemblyForce };
}

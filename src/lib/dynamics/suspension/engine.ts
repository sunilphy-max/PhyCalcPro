import type { SuspensionConfig, SuspensionResult } from "./types";

export function solveSuspensionEngine(config: SuspensionConfig): SuspensionResult {
  const lateralForce = config.sprungMass * config.lateralAcceleration;
  const rollMoment = lateralForce * (config.wheelbase / 2);
  const rollAngleRadians = rollMoment / Math.max(1e-3, config.rollStiffness);
  const rollAngleDegrees = (rollAngleRadians * 180) / Math.PI;
  const loadTransfer = lateralForce * Math.max(1e-3, config.cgHeight) / Math.max(1e-3, config.trackWidth);
  const designStatus: SuspensionResult["designStatus"] =
    rollAngleDegrees <= 2 ? "stable" : rollAngleDegrees <= 5 ? "moderate" : "high";

  return {
    lateralForce,
    rollMoment,
    rollAngleDegrees,
    loadTransfer,
    designStatus,
  };
}

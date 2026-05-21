import type { RotationConfig, RotationResult } from "./types";

export function solveRotationEngine(config: RotationConfig): RotationResult {
  const omega = (config.speedRPM * 2 * Math.PI) / 60;
  const inertia = config.mass * config.radius * config.radius;
  const kineticEnergy = 0.5 * inertia * omega * omega;
  const centripetalAcceleration = omega * omega * config.radius;
  const centripetalForce = config.mass * centripetalAcceleration;
  const torque = omega > 0 ? config.power / omega : 0;

  return {
    inertia,
    omega,
    kineticEnergy,
    centripetalAcceleration,
    centripetalForce,
    torque,
  };
}

import type { FlywheelConfig, FlywheelResult } from "./types";

export function solveFlywheelDesign(config: FlywheelConfig): FlywheelResult {
  const radius = config.outerDiameter / 2;
  const area = config.faceWidth * config.thickness;
  const volume = 2 * Math.PI * radius * area;
  const mass = volume * config.density;
  const inertia = mass * radius * radius;
  const omega = (config.rpm * 2 * Math.PI) / 60;
  const storedEnergy = 0.5 * inertia * omega * omega;
  const hoopStress = config.density * omega * omega * radius * radius;
  const specificSpeed = omega / Math.sqrt(radius);
  const safetyFactor = config.yieldStress / Math.max(hoopStress, 1e-12);

  return {
    outerDiameter: config.outerDiameter,
    thickness: config.thickness,
    faceWidth: config.faceWidth,
    mass,
    inertia,
    angularSpeed: omega,
    storedEnergy,
    hoopStress,
    specificSpeed,
    safetyFactor,
  };
}

import type { TimingBeltConfig, TimingBeltResult } from "./types";

export function solveTimingBeltDrive(config: TimingBeltConfig): TimingBeltResult {
  const z1 = Math.max(12, Math.round(config.teethDriver));
  const z2 = Math.max(12, Math.round(config.teethDriven));
  const p = Math.max(config.pitch, 1e-6);
  const ratio = z2 / z1;
  const drivenSpeed = config.speedDriver / ratio;

  const d1 = (p * z1) / Math.PI;
  const d2 = (p * z2) / Math.PI;
  const C = (d1 + d2) / 2 + 2 * p;
  const beltLength = 2 * C + (Math.PI * (d1 + d2)) / 2 + ((d2 - d1) ** 2) / (4 * C);
  const beltLengthTeeth = Math.round(beltLength / p);

  const torque = (60 * config.power) / (2 * Math.PI * Math.max(config.speedDriver, 1));
  const tangentialForce = (2 * torque) / Math.max(d1, 1e-9);
  const shaftLoadEstimate = tangentialForce * 1.1;
  const powerCapacity = config.beltWidth * 0.15 * config.serviceFactor * (config.speedDriver / 1000);
  const powerUtilization = config.power / Math.max(powerCapacity, 1e-9);

  return {
    ratio,
    drivenSpeed,
    pitchDiameterDriver: d1,
    pitchDiameterDriven: d2,
    centerDistance: C,
    beltLengthTeeth,
    beltLength,
    tangentialForce,
    shaftLoadEstimate,
    powerUtilization,
  };
}

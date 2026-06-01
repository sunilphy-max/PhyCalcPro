import type { RollerChainConfig, RollerChainResult } from "./types";

export function solveRollerChainDrive(config: RollerChainConfig): RollerChainResult {
  const z1 = Math.max(11, Math.round(config.teethDriver));
  const z2 = Math.max(11, Math.round(config.teethDriven));
  const pitch = Math.max(config.pitch, 1e-6);
  const ratio = z2 / z1;
  const drivenSpeed = config.speedDriver / ratio;

  const d1 = pitch * z1 / Math.PI;
  const d2 = pitch * z2 / Math.PI;
  const centerDistance = (d1 + d2) / 2 + pitch * 2;

  const chainSpeed = (Math.PI * d1 * config.speedDriver) / 60;
  const powerCapacity =
    config.strands * 0.025 * chainSpeed * config.serviceFactor * Math.pow(pitch * 1000, 0.4);
  const powerUtilization = config.power / Math.max(powerCapacity, 1e-9);

  const chainTension = (config.power * 1000) / Math.max(chainSpeed, 1e-6);
  const loadIndex = powerUtilization;
  const estimatedLifeHours = Math.max(100, 15000 / Math.pow(Math.max(loadIndex, 0.1), 3));

  return {
    ratio,
    drivenSpeed,
    chainSpeed,
    chainTension,
    powerCapacity,
    powerUtilization,
    estimatedLifeHours,
    centerDistance,
  };
}

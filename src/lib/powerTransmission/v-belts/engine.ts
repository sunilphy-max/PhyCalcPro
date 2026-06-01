import type { VBeltConfig, VBeltResult } from "./types";

/** Open belt length: L = 2C + π(D1+D2)/2 + (D2-D1)²/(4C) */
export function solveVBeltDrive(config: VBeltConfig): VBeltResult {
  const D1 = Math.max(config.diameterDriver, 1e-6);
  const D2 = Math.max(config.diameterDriven, 1e-6);
  const C = Math.max(config.centerDistance, (D1 + D2) / 2 + 1e-6);

  const beltLength = 2 * C + (Math.PI * (D1 + D2)) / 2 + ((D2 - D1) ** 2) / (4 * C);
  const ratio = D2 / D1;
  const drivenSpeed = config.speedDriver / ratio;

  const sinArg = Math.min(1, Math.abs(D2 - D1) / (2 * C));
  const wrapDriver = Math.PI - 2 * Math.asin(sinArg);
  const wrapDriven = Math.PI + 2 * Math.asin(sinArg);

  const beltSpeed = (Math.PI * D1 * config.speedDriver) / 60;
  const powerCapacity =
    config.beltFactor * beltSpeed * config.serviceFactor * (1 - Math.exp(-config.frictionCoeff * wrapDriver));
  const powerUtilization = config.power / Math.max(powerCapacity, 1e-9);

  const tightSide = (config.power * 1000) / Math.max(beltSpeed, 1e-6);
  const slackSide = tightSide * Math.exp(-config.frictionCoeff * wrapDriver);
  const pretensionEstimate = (tightSide + slackSide) / 2;

  return {
    beltLength,
    wrapAngleDriver: (wrapDriver * 180) / Math.PI,
    wrapAngleDriven: (wrapDriven * 180) / Math.PI,
    beltSpeed,
    powerCapacity,
    powerUtilization,
    pretensionEstimate,
    drivenSpeed,
    ratio,
  };
}

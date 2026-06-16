import { snapStandardBeltLengthMm } from "./catalog";
import type { VBeltConfig, VBeltResult } from "./types";

const MIN_CENTER_MARGIN = 1e-6;

/** Resultant belt tension load on a pulley shaft (N). */
export function pulleyShaftLoad(F1: number, F2: number, wrapAngleRad: number): number {
  return Math.sqrt(F1 * F1 + F2 * F2 - 2 * F1 * F2 * Math.cos(wrapAngleRad));
}

/** Open belt length: L = 2C + π(D1+D2)/2 + (D2-D1)²/(4C) */
export function solveVBeltDrive(config: VBeltConfig): VBeltResult {
  const D1 = Math.max(config.diameterDriver, 1e-6);
  const D2 = Math.max(config.diameterDriven, 1e-6);
  const C = Math.max(config.centerDistance, (D1 + D2) / 2 + MIN_CENTER_MARGIN);

  const beltLength = 2 * C + (Math.PI * (D1 + D2)) / 2 + ((D2 - D1) ** 2) / (4 * C);
  const ratio = D2 / D1;
  const drivenSpeed = config.speedDriver / ratio;

  const sinArg = Math.min(1, Math.abs(D2 - D1) / (2 * C));
  const wrapDriver = Math.PI - 2 * Math.asin(sinArg);
  const wrapDriven = Math.PI + 2 * Math.asin(sinArg);

  const beltSpeed = (Math.PI * D1 * config.speedDriver) / 60;
  const mu = config.frictionCoeff;
  const gripFactor = 1 - Math.exp(-mu * wrapDriver);

  const powerCapacityPerBelt = config.beltFactor * beltSpeed * gripFactor;
  const designPowerKw = config.power * config.serviceFactor;
  const numberOfBelts = Math.max(
    1,
    Math.ceil(designPowerKw / Math.max(powerCapacityPerBelt, 1e-9))
  );
  const powerUtilization = designPowerKw / (numberOfBelts * Math.max(powerCapacityPerBelt, 1e-9));

  const powerW = designPowerKw * 1000;
  const tightSide = powerW / Math.max(beltSpeed * gripFactor, 1e-6);
  const slackSide = tightSide * Math.exp(-mu * wrapDriver);
  const pretensionEstimate = (tightSide + slackSide) / 2;

  const radialLoadDriver = pulleyShaftLoad(tightSide, slackSide, wrapDriver);
  const radialLoadDriven = pulleyShaftLoad(tightSide, slackSide, wrapDriven);

  const driverTorque = powerW / Math.max((2 * Math.PI * config.speedDriver) / 60, 1e-6);

  const speedRatioFromRpm =
    config.speedDriven != null && config.speedDriven > 0
      ? config.speedDriver / config.speedDriven
      : null;

  return {
    beltSection: config.beltSection,
    ratio,
    diameterDriver: D1,
    diameterDriven: D2,
    centerDistance: C,
    beltLength,
    standardBeltLengthMm: snapStandardBeltLengthMm(beltLength),
    wrapAngleDriver: (wrapDriver * 180) / Math.PI,
    wrapAngleDriven: (wrapDriven * 180) / Math.PI,
    beltSpeed,
    designPowerKw,
    powerCapacityPerBelt,
    numberOfBelts,
    powerUtilization,
    tightSideTension: tightSide,
    slackSideTension: slackSide,
    pretensionEstimate,
    radialLoadDriver,
    radialLoadDriven,
    driverTorque,
    drivenSpeed,
    speedRatioFromRpm,
  };
}

import type { LoadCaseManagerConfig, LoadCaseManagerResult } from "./types";

export function solveLoadCaseManagerEngine(
  config: LoadCaseManagerConfig
): LoadCaseManagerResult {
  const envelopeAxial = Math.max(...config.cases.map((item) => Math.abs(item.axialForce)));
  const envelopeMoment = Math.max(...config.cases.map((item) => Math.abs(item.bendingMoment)));
  const envelopeShear = Math.max(...config.cases.map((item) => Math.abs(item.shearForce)));
  const width = Math.max(1e-6, config.width);
  const height = Math.max(1e-6, config.height);
  const area = width * height;
  const Ixx = (width * Math.pow(height, 3)) / 12;
  const axialStress = envelopeAxial / area;
  const bendingStress = envelopeMoment * (height / 2) / Ixx;
  const shearStress = envelopeShear / area;
  const combinedStress = Math.sqrt(Math.pow(axialStress + bendingStress, 2) + 3 * Math.pow(shearStress, 2));
  const safetyFactor = combinedStress > 0 ? config.yieldStrength / combinedStress : Number.POSITIVE_INFINITY;
  const designStatus: LoadCaseManagerResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.25 ? "warning" : "critical";

  return {
    envelopeAxial,
    envelopeMoment,
    envelopeShear,
    axialStress,
    bendingStress,
    shearStress,
    combinedStress,
    safetyFactor,
    designStatus,
  };
}

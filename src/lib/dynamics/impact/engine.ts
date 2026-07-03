import type { ImpactConfig, ImpactResult } from "./types";

export function solveImpactEngine(config: ImpactConfig): ImpactResult {
  const durationSeconds = Math.max(1e-4, config.impactDuration / 1000);
  const impulse = config.mass * config.velocityChange;
  const averageForce = impulse / durationSeconds;
  const area = Math.max(1e-6, config.crossSectionArea / 1e6);
  const dynamicStress = averageForce / area / 1e6;

  const kineticEnergy = 0.5 * config.mass * Math.pow(config.velocityChange, 2);
  const zeta = Math.min(Math.max(config.dampingRatio ?? 0.05, 0.001), 0.5);
  const stiffness =
    config.stiffness ??
    config.mass * Math.pow(Math.PI / durationSeconds, 2);
  const sdofPeakForce = Math.sqrt(Math.max(0, 2 * stiffness * kineticEnergy));
  const dynamicAmplification = sdofPeakForce / Math.max(averageForce, 1e-9);
  const peakDynamicStress = dynamicStress * dynamicAmplification;
  const energyAbsorbed = kineticEnergy * (1 - Math.exp(-2 * zeta * Math.PI));

  const governingStress = Math.max(dynamicStress, peakDynamicStress);
  const safetyFactor =
    governingStress > 0 ? config.yieldStrength / governingStress : Number.POSITIVE_INFINITY;
  const designStatus: ImpactResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.25 ? "warning" : "critical";

  return {
    impulse,
    averageForce,
    dynamicStress,
    kineticEnergy,
    sdofPeakForce,
    dynamicAmplification,
    peakDynamicStress,
    energyAbsorbed,
    safetyFactor,
    designStatus,
  };
}

import type { ImpactConfig, ImpactResult } from "./types";

export function solveImpactEngine(config: ImpactConfig): ImpactResult {
  const durationSeconds = Math.max(1e-4, config.impactDuration / 1000);
  const impulse = config.mass * config.velocityChange;
  const averageForce = impulse / durationSeconds;
  const area = Math.max(1e-6, config.crossSectionArea / 1e6);
  const dynamicStress = averageForce / area / 1e6;
  const safetyFactor = dynamicStress > 0 ? config.yieldStrength / dynamicStress : Number.POSITIVE_INFINITY;
  const designStatus: ImpactResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.25 ? "warning" : "critical";

  return {
    impulse,
    averageForce,
    dynamicStress,
    safetyFactor,
    designStatus,
  };
}

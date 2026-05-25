import type { FatigueConfig, FatigueResult } from "./types";

export function solveFatigueEngine(config: FatigueConfig): FatigueResult {
  const meanStressRatio = Math.min(0.95, Math.max(0, config.meanStress / config.ultimateStrength));
  const allowableStress = Math.max(0, config.enduranceLimit * (1 - meanStressRatio));
  const correctedEndurance = allowableStress;
  const predictedCycles = config.alternatingStress > 0 ? Math.round(Math.pow(config.enduranceLimit / config.alternatingStress, 3) * 1e3) : 0;
  const safetyFactor = config.alternatingStress > 0 ? allowableStress / config.alternatingStress : Number.POSITIVE_INFINITY;
  const designStatus: FatigueResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.2 ? "warning" : "critical";

  return {
    allowableStress,
    correctedEndurance,
    predictedCycles,
    safetyFactor,
    designStatus,
  };
}

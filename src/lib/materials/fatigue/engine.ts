import type { FatigueConfig, FatigueResult } from "./types";

export function solveFatigueEngine(config: FatigueConfig): FatigueResult {
  const method = config.meanStressMethod ?? "goodman";
  const Se = config.enduranceLimit;
  const Sa = config.alternatingStress;
  const Sm = config.meanStress;
  const Su = config.ultimateStrength;

  let allowableStress = Se;
  if (Sa > 0) {
    if (method === "gerber") {
      allowableStress = Se * (1 - (Sm / Su) ** 2);
    } else if (method === "morrow") {
      const sigmaF = Su * 0.9;
      allowableStress = Se * (1 - Sm / Math.max(sigmaF, 1e-9));
    } else {
      allowableStress = Se * (1 - Sm / Math.max(Su, 1e-9));
    }
  }
  allowableStress = Math.max(0, allowableStress);
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

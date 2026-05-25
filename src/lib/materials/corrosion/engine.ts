import type { CorrosionConfig, CorrosionResult } from "./types";

export function solveCorrosionEngine(config: CorrosionConfig): CorrosionResult {
  const corrosionAllowance = config.corrosionRate * config.designLife;
  const requiredThickness = config.initialThickness + corrosionAllowance * (1 + config.safetyMargin / 100);
  const remainingThickness = Math.max(0, config.initialThickness - corrosionAllowance);
  const designStatus: CorrosionResult["designStatus"] =
    corrosionAllowance <= config.initialThickness * 0.2 ? "nominal" : corrosionAllowance <= config.initialThickness * 0.5 ? "review" : "critical";

  return {
    corrosionAllowance,
    requiredThickness,
    remainingThickness,
    designStatus,
  };
}

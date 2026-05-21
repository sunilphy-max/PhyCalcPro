import type { FitConfig, FitResult, ToleranceConfig, ToleranceResult } from "./types";

export function solveFitsEngine(config: FitConfig): FitResult {
  const holeMin = config.nominalSize + config.holeLower;
  const holeMax = config.nominalSize + config.holeUpper;
  const shaftMin = config.nominalSize + config.shaftLower;
  const shaftMax = config.nominalSize + config.shaftUpper;
  const clearanceMin = holeMin - shaftMax;
  const clearanceMax = holeMax - shaftMin;

  let fitType: FitResult["fitType"] = "transition";
  if (clearanceMin >= 0) {
    fitType = "clearance";
  } else if (clearanceMax < 0) {
    fitType = "interference";
  }

  return {
    holeMin,
    holeMax,
    shaftMin,
    shaftMax,
    clearanceMin,
    clearanceMax,
    fitType,
  };
}

export function solveToleranceEngine(config: ToleranceConfig): ToleranceResult {
  const tolerances = config.tolerances.map((value) => Math.abs(value));
  const totalTolerance = tolerances.reduce((sum, value) => sum + value, 0);
  const worstCase = totalTolerance;
  const rss = Math.sqrt(tolerances.reduce((sum, value) => sum + value * value, 0));

  return {
    tolerances,
    count: tolerances.length,
    worstCase,
    rss,
    totalTolerance,
  };
}

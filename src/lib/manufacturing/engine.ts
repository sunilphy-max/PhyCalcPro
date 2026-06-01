import type { FitConfig, FitResult, ToleranceConfig, ToleranceResult } from "./types";

/** Simplified ISO 286 IT grade multiplier (µm) vs nominal diameter (mm). */
function iso286ToleranceUm(nominalMm: number, grade: number): number {
  const d = Math.max(nominalMm, 1);
  const i = 0.45 * Math.pow(d, 1 / 3) + 0.001 * d;
  return i * grade;
}

function iso286DeviationUm(nominalMm: number, letter: string, grade: number): { upper: number; lower: number } {
  const t = iso286ToleranceUm(nominalMm, grade);
  const upperLetter = letter.toUpperCase();
  if (upperLetter === "H") return { upper: 0, lower: -t };
  if (upperLetter === "G") return { upper: -t * 0.2, lower: -t * 1.2 };
  if (upperLetter === "K") return { upper: t * 0.3, lower: -t * 0.7 };
  return { upper: 0, lower: -t };
}

export function solveFitsEngine(config: FitConfig): FitResult {
  let holeUpper = config.holeUpper;
  let holeLower = config.holeLower;
  let shaftUpper = config.shaftUpper;
  let shaftLower = config.shaftLower;

  const nominalMm = config.nominalSize * 1000;
  if (config.isoHoleGrade && config.isoHoleLetter) {
    const dev = iso286DeviationUm(nominalMm, config.isoHoleLetter, config.isoHoleGrade);
    holeUpper = dev.upper / 1e6;
    holeLower = dev.lower / 1e6;
  }
  if (config.isoShaftGrade && config.isoShaftLetter) {
    const dev = iso286DeviationUm(nominalMm, config.isoShaftLetter, config.isoShaftGrade);
    shaftUpper = dev.upper / 1e6;
    shaftLower = dev.lower / 1e6;
  }

  const holeMin = config.nominalSize + holeLower;
  const holeMax = config.nominalSize + holeUpper;
  const shaftMin = config.nominalSize + shaftLower;
  const shaftMax = config.nominalSize + shaftUpper;
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

  let worstCaseY: number | undefined;
  let rssY: number | undefined;
  if (config.tolerancesY?.length) {
    const ty = config.tolerancesY.map((value) => Math.abs(value));
    worstCaseY = ty.reduce((sum, value) => sum + value, 0);
    rssY = Math.sqrt(ty.reduce((sum, value) => sum + value * value, 0));
  }

  let monteCarloMean: number | undefined;
  let monteCarloStdDev: number | undefined;
  const samples = config.monteCarloSamples ?? 0;
  if (samples > 0) {
    const draws: number[] = [];
    for (let i = 0; i < samples; i++) {
      let stack = 0;
      for (const t of tolerances) {
        stack += (Math.random() * 2 - 1) * t;
      }
      draws.push(stack);
    }
    monteCarloMean = draws.reduce((a, b) => a + b, 0) / draws.length;
    monteCarloStdDev = Math.sqrt(
      draws.reduce((sum, v) => sum + (v - monteCarloMean!) ** 2, 0) / draws.length
    );
  }

  return {
    tolerances,
    count: tolerances.length,
    worstCase,
    rss,
    totalTolerance,
    worstCaseY,
    rssY,
    monteCarloMean,
    monteCarloStdDev,
  };
}

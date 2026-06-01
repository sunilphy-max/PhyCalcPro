import type { VibrationConfig, VibrationResult } from "./types";
import { solveVibrationFEM } from "./solver";

export function solveVibrationEngine(config: VibrationConfig): VibrationResult {
  if (config.length <= 0) {
    throw new Error("Beam length must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Elastic modulus must be positive");
  }
  if (config.I <= 0) {
    throw new Error("Second moment of inertia must be positive");
  }
  if (config.A <= 0) {
    throw new Error("Cross-sectional area must be positive");
  }
  if (config.rho <= 0) {
    throw new Error("Density must be positive");
  }
  if (config.segments < 2) {
    throw new Error("Mesh must use at least two segments");
  }
  if (config.segments > 240) {
    throw new Error("Mesh is too fine for interactive solve. Use 240 segments or fewer.");
  }

  const result = solveVibrationFEM(config);
  const zeta = Math.min(Math.max(config.dampingRatio ?? 0, 0), 0.5);
  const dampFactor = Math.sqrt(Math.max(0, 1 - zeta * zeta));
  const dampedNaturalFrequencies = result.frequencies.map((f) => f * dampFactor);
  const resonanceNote =
    zeta < 0.02
      ? "Very light damping: forced response can amplify sharply at natural frequencies (ζ < 2%)."
      : zeta < 0.1
        ? "Light damping: use damped natural frequencies for separation checks near resonance."
        : "Moderate damping: peak response at resonance is reduced versus undamped estimate.";

  const warnings: string[] = [];
  if (config.segments < 8) {
    warnings.push("Low segment count may reduce modal accuracy.");
  }

  const positiveFrequencies = result.frequencies.every((f) => Number.isFinite(f) && f > 0);
  const monotonicFrequencyOrder = result.frequencies.every(
    (f, index, all) => index === 0 || f >= all[index - 1]
  );

  return {
    ...result,
    dampedNaturalFrequencies,
    dampingRatio: zeta,
    resonanceNote,
    physicsChecks: {
      positiveFrequencies,
      monotonicFrequencyOrder,
    },
    solverMeta: {
      meshSegments: config.segments,
      support: config.support,
      solver: "euler-bernoulli-fem",
      warnings,
    },
  };
}

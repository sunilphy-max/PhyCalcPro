import type { CompositeConfig, CompositeResult } from "./types";

function safeInverse(value: number) {
  return value === 0 ? 0 : 1 / value;
}

export function solveCompositeEngine(config: CompositeConfig): CompositeResult {
  const Vf = Math.min(Math.max(config.fiberVolumeFraction, 0), 1);
  const Vm = 1 - Vf;
  const E_longitudinal = config.fiberModulus * Vf + config.matrixModulus * Vm;
  const E_transverse = safeInverse(Vf / config.fiberModulus + Vm / config.matrixModulus);
  const strength_longitudinal = config.fiberStrength * Vf + config.matrixStrength * Vm;
  const strength_transverse = safeInverse(Vf / config.fiberStrength + Vm / config.matrixStrength);
  const density = config.fiberDensity * Vf + config.matrixDensity * Vm;
  const poissonRatio = config.fiberPoisson * Vf + config.matrixPoisson * Vm;
  const stiffnessRatio = config.matrixModulus > 0 ? E_longitudinal / config.matrixModulus : 0;

  return {
    fiberVolumeFraction: Vf,
    matrixVolumeFraction: Vm,
    E_longitudinal,
    E_transverse,
    strength_longitudinal,
    strength_transverse,
    density,
    poissonRatio,
    stiffnessRatio,
  };
}

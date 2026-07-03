import type { CompositeConfig, CompositeResult } from "./types";

function safeInverse(value: number) {
  return value === 0 ? 0 : 1 / value;
}

function tsaiHillUtilization(
  sigma1: number,
  sigma2: number,
  tau12: number,
  X1: number,
  X2: number,
  S12: number
): number {
  const term =
    Math.pow(sigma1 / Math.max(X1, 1e-9), 2) +
    Math.pow(sigma2 / Math.max(X2, 1e-9), 2) -
    (sigma1 * sigma2) / Math.pow(Math.max(X1, 1e-9), 2) +
    Math.pow(tau12 / Math.max(S12, 1e-9), 2);
  return Math.sqrt(Math.max(term, 0));
}

export function solveCompositeEngine(config: CompositeConfig): CompositeResult {
  const Vf = Math.min(Math.max(config.fiberVolumeFraction, 0), 1);
  const Vm = 1 - Vf;
  const E1 = config.fiberModulus * Vf + config.matrixModulus * Vm;
  const E2 = safeInverse(Vf / config.fiberModulus + Vm / config.matrixModulus);
  const G12 = safeInverse(Vf / (config.fiberModulus / 2) + Vm / (config.matrixModulus / 2));
  const nu12 = config.fiberPoisson * Vf + config.matrixPoisson * Vm;

  const theta = ((config.plyAngleDeg ?? 0) * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const E_eff =
    1 /
    (Math.pow(c, 4) / Math.max(E1, 1e-9) +
      Math.pow(s, 4) / Math.max(E2, 1e-9) +
      (Math.pow(c, 2) * Math.pow(s, 2) / Math.max(G12, 1e-9)) * (1 - 2 * nu12));

  const strength_longitudinal = config.fiberStrength * Vf + config.matrixStrength * Vm;
  const strength_transverse = safeInverse(
    Vf / config.fiberStrength + Vm / config.matrixStrength
  );
  const density = config.fiberDensity * Vf + config.matrixDensity * Vm;
  const poissonRatio = nu12;
  const stiffnessRatio = config.matrixModulus > 0 ? E1 / config.matrixModulus : 0;

  const appliedStress = config.appliedStress ?? strength_longitudinal * 0.5;
  const tsaiHill = tsaiHillUtilization(
    appliedStress * Math.pow(c, 2),
    appliedStress * Math.pow(s, 2),
    appliedStress * c * s,
    strength_longitudinal,
    strength_transverse,
    strength_transverse * 0.5
  );

  return {
    fiberVolumeFraction: Vf,
    matrixVolumeFraction: Vm,
    E_longitudinal: E1,
    E_transverse: E2,
    E_atPlyAngle: E_eff,
    strength_longitudinal,
    strength_transverse,
    density,
    poissonRatio,
    stiffnessRatio,
    tsaiHillUtilization: tsaiHill,
  };
}

/**
 * Buckling Solver
 * Implements Euler buckling formula and safety checks
 */

import type { BucklingConfig, BucklingResult, EndCondition } from "./types";

/**
 * Get effective length factor based on end conditions
 */
function getEffectiveLengthFactor(endCondition: EndCondition): number {
  switch (endCondition) {
    case "pinned":
      return 1.0;
    case "fixed":
      return 0.5;
    case "cantilever":
      return 2.0;
    case "guided":
      return 1.0;
    default:
      return 1.0;
  }
}

/**
 * Generate mode shape for visualization
 */
function generateModeShape(
  config: BucklingConfig,
  k: number
): { x: number[]; deflection: number[] } {
  const n = 200;
  const x: number[] = [];
  const deflection: number[] = [];

  const Le = k * config.length;
  const maxDeflection = config.length * 0.05; // 5% of length for display

  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * config.length;
    x.push(xi);

    let delta = 0;

    if (config.endCondition === "cantilever") {
      // Cantilever: w(x) ∝ (cos(β*x) - 1) where β*L = π/2
      const beta = Math.PI / (2 * config.length);
      delta = maxDeflection * (Math.cos(beta * xi) - 1);
    } else if (config.endCondition === "pinned") {
      // Pinned-pinned: w(x) ∝ sin(π*x/L)
      delta = maxDeflection * Math.sin((Math.PI * xi) / config.length);
    } else if (config.endCondition === "fixed") {
      // Fixed-fixed: w(x) ∝ sin(π*x/L) * (intermediate shape)
      delta =
        maxDeflection *
        Math.sin((Math.PI * xi) / config.length) *
        Math.sin((Math.PI * (config.length - xi)) / config.length);
    } else {
      // Guided (similar to pinned)
      delta = maxDeflection * Math.sin((Math.PI * xi) / config.length);
    }

    deflection.push(delta);
  }

  return { x, deflection };
}

/**
 * Solve column buckling problem using Euler formula
 */
export function solveBuckling(config: BucklingConfig): BucklingResult {
  const { length, E, I, A, P, endCondition } = config;

  // Effective length factor
  const k = getEffectiveLengthFactor(endCondition);
  const Le = k * length;

  // Radius of gyration
  const r = Math.sqrt(I / A);

  // Slenderness ratio
  const slenderness = Le / r;

  // Euler's critical buckling load: Pcr = π²EI / Le²
  const Pcr = (Math.PI * Math.PI * E * I) / (Le * Le);

  // Stresses
  const stress = P / A;
  const criticalStress = Pcr / A;

  // Safety factor
  const safetyFactor = slenderness > 100 ? Pcr / Math.max(P, 1) : 1.0;

  // Buckling mode classification
  let bucklingMode: "elastic" | "inelastic" | "critical" = "elastic";
  if (P > Pcr * 0.99) {
    bucklingMode = "critical";
  } else if (P > Pcr * 0.5) {
    bucklingMode = "inelastic";
  }

  // Generate mode shape
  const { x, deflection } = generateModeShape(config, k);

  return {
    Pcr,
    k,
    Le,
    stress,
    criticalStress,
    safetyFactor,
    slenderness,
    radius: r,
    x,
    deflection,
    isSafe: P < Pcr * 0.9,
    bucklingMode,
  };
}

import type { CircularPlateConfig, CircularPlateResult } from "./types";

function roarkSolution(c: CircularPlateConfig) {
  const a = Math.max(c.radius, 1e-9);
  const t = Math.max(c.thickness, 1e-9);
  const D = (c.modulus * t ** 3) / (12 * (1 - c.poisson ** 2));
  const alpha = c.boundary === "clamped" ? 0.0138 : 0.171;
  const beta = 0.75;
  const maxDeflection = (alpha * c.pressure * a ** 4) / D;
  const maxStress = (beta * c.pressure * a ** 2) / (t ** 2);
  return { maxDeflection, maxStress, rigidity: D };
}

/** Axisymmetric Kirchhoff plate FDM on radial line (mesh density control). */
function axisymmetricFdm(c: CircularPlateConfig, segments: number) {
  const a = Math.max(c.radius, 1e-9);
  const t = Math.max(c.thickness, 1e-9);
  const D = (c.modulus * t ** 3) / (12 * (1 - c.poisson ** 2));
  const dr = a / segments;
  const n = segments + 1;
  const w = Array(n).fill(0);
  const p = c.pressure;
  const clamped = c.boundary === "clamped";

  for (let iter = 0; iter < 800; iter++) {
    const next = [...w];
    for (let i = 1; i < n - 1; i++) {
      const r = i * dr;
      const d4 =
        (w[i + 2] - 4 * w[i + 1] + 6 * w[i] - 4 * w[i - 1] + (i > 1 ? w[i - 2] : 0)) /
        (dr ** 4);
      const d3 = (w[i + 2] - 2 * w[i + 1] + 2 * w[i - 1] - (i > 1 ? w[i - 2] : 0)) / (2 * dr ** 3);
      const lap = d4 + (d3 / Math.max(r, dr)) - w[i] / (r * r);
      next[i] = w[i] + 0.15 * (p / D - lap) * dr ** 4;
    }
    if (clamped) {
      next[0] = 0;
      next[n - 1] = 0;
    } else {
      next[0] = next[1];
      next[n - 1] = 0;
    }
    for (let i = 0; i < n; i++) w[i] = next[i];
  }

  const maxDeflection = Math.max(...w.map((v) => Math.abs(v)));
  const maxStress = (0.75 * c.pressure * a ** 2) / (t ** 2);
  return { maxDeflection, maxStress, rigidity: D };
}

export function solveCircularPlateEngine(c: CircularPlateConfig): CircularPlateResult {
  const roark = roarkSolution(c);
  const meshSegments = Math.min(64, Math.max(4, Math.round(c.meshSegments ?? 12)));
  const fem = axisymmetricFdm(c, meshSegments);
  const femDeflectionErrorPercent =
    roark.maxDeflection > 0
      ? (100 * Math.abs(fem.maxDeflection - roark.maxDeflection)) / roark.maxDeflection
      : 0;

  return {
    maxDeflection: fem.maxDeflection,
    maxStress: fem.maxStress,
    rigidity: fem.rigidity,
    roarkMaxDeflection: roark.maxDeflection,
    roarkMaxStress: roark.maxStress,
    meshSegments,
    femDeflectionErrorPercent,
  };
}

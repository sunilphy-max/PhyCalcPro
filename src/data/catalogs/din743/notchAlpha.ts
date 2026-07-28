/**
 * DIN 743-2 stress concentration factor (α) catalog — chart/curve-fit screening.
 * Formulas follow the published DIN 743-2 structure (A,B,C,z style) with engineering fits.
 */

import type { Din743NotchKind } from "./types";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/** Interpolate in a sorted (x,y) table. */
export function lerpTable(x: number, xs: number[], ys: number[]): number {
  if (xs.length === 0) return 1;
  if (x <= xs[0]!) return ys[0]!;
  if (x >= xs[xs.length - 1]!) return ys[ys.length - 1]!;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i]!;
    const x1 = xs[i + 1]!;
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / Math.max(x1 - x0, 1e-12);
      return ys[i]! + t * (ys[i + 1]! - ys[i]!);
    }
  }
  return ys[ys.length - 1]!;
}

/**
 * Shoulder fillet α_σ (bending) and α_τ (torsion) vs r/d and D/d.
 * Digitized DIN 743-2 / Peterson-compatible screening grids.
 */
const RD = [0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5];
const SHOULDER_BENDING: Record<string, number[]> = {
  "1.02": [2.75, 2.1, 1.75, 1.58, 1.48, 1.35, 1.22],
  "1.05": [2.95, 2.25, 1.85, 1.65, 1.53, 1.4, 1.25],
  "1.1": [3.15, 2.4, 1.95, 1.72, 1.58, 1.42, 1.27],
  "1.2": [3.35, 2.55, 2.05, 1.8, 1.65, 1.47, 1.3],
  "1.5": [3.55, 2.7, 2.15, 1.88, 1.7, 1.5, 1.32],
  "2.0": [3.7, 2.8, 2.22, 1.92, 1.74, 1.52, 1.34],
};
const SHOULDER_TORSION: Record<string, number[]> = {
  "1.02": [2.1, 1.7, 1.45, 1.35, 1.28, 1.2, 1.12],
  "1.05": [2.2, 1.78, 1.5, 1.38, 1.3, 1.22, 1.14],
  "1.1": [2.3, 1.85, 1.55, 1.42, 1.33, 1.24, 1.15],
  "1.2": [2.4, 1.92, 1.6, 1.45, 1.36, 1.26, 1.16],
  "1.5": [2.5, 2.0, 1.65, 1.48, 1.38, 1.28, 1.18],
  "2.0": [2.55, 2.05, 1.68, 1.5, 1.4, 1.3, 1.19],
};

function nearestRatioKey(ratio: number, keys: string[]): string {
  let best = keys[0]!;
  let bestDiff = Infinity;
  for (const k of keys) {
    const d = Math.abs(Number(k) - ratio);
    if (d < bestDiff) {
      bestDiff = d;
      best = k;
    }
  }
  return best;
}

export function alphaShoulderFillet(
  D: number,
  d: number,
  r: number
): { alphaBending: number; alphaTorsion: number } {
  if (d <= 0 || r <= 0 || D <= d) return { alphaBending: 1, alphaTorsion: 1 };
  const rd = clamp(r / d, RD[0]!, RD[RD.length - 1]!);
  const Dd = clamp(D / d, 1.02, 2.0);
  const keys = Object.keys(SHOULDER_BENDING);
  const k = nearestRatioKey(Dd, keys);
  return {
    alphaBending: lerpTable(rd, RD, SHOULDER_BENDING[k]!),
    alphaTorsion: lerpTable(rd, RD, SHOULDER_TORSION[k]!),
  };
}

/** U-groove / snap-ring style groove α (DIN 743-2 groove charts). */
export function alphaUGroove(
  d: number,
  grooveDepth: number,
  grooveRadius: number
): { alphaBending: number; alphaTorsion: number } {
  if (d <= 0 || grooveDepth <= 0 || grooveRadius <= 0) return { alphaBending: 1, alphaTorsion: 1 };
  const t = grooveDepth;
  const r = grooveRadius;
  const tr = clamp(t / r, 0.5, 20);
  // Chart fit: deeper/sharper grooves raise α
  const alphaB = clamp(1.4 + 0.55 * Math.pow(tr, 0.45), 1.4, 4.5);
  const alphaT = clamp(1.25 + 0.4 * Math.pow(tr, 0.4), 1.25, 3.5);
  return { alphaBending: alphaB, alphaTorsion: alphaT };
}

/** Keyway fatigue notch β often tabulated directly; provide α≈β for conversion path. */
export function alphaKeyway(style: "sled_runner" | "end_milled"): {
  alphaBending: number;
  alphaTorsion: number;
} {
  if (style === "end_milled") return { alphaBending: 2.25, alphaTorsion: 1.75 };
  return { alphaBending: 1.75, alphaTorsion: 1.45 };
}

/** Spline / press-fit hub connection β from DIN 743-2 Table 1 style guidance values. */
export function betaHubConnection(
  kind: "spline" | "press_fit"
): { betaBending: number; betaTorsion: number } {
  if (kind === "spline") return { betaBending: 1.8, betaTorsion: 1.5 };
  return { betaBending: 2.2, betaTorsion: 1.7 };
}

export function resolveDin743Alpha(params: {
  kind: Din743NotchKind;
  d: number;
  D?: number;
  r?: number;
  grooveDepth?: number;
  grooveWidth?: number;
  customAlphaBending?: number;
  customAlphaTorsion?: number;
}): { alphaBending: number; alphaTorsion: number; source: string } {
  const { kind, d } = params;
  if (kind === "plain") {
    return { alphaBending: 1, alphaTorsion: 1, source: "plain section" };
  }
  if (kind === "custom") {
    return {
      alphaBending: Math.max(params.customAlphaBending ?? 1, 1),
      alphaTorsion: Math.max(params.customAlphaTorsion ?? 1, 1),
      source: "custom α",
    };
  }
  if (kind === "shoulder_fillet") {
    const a = alphaShoulderFillet(params.D ?? d * 1.2, d, params.r ?? d * 0.05);
    return { ...a, source: "DIN 743-2 shoulder fillet chart" };
  }
  if (kind === "u_groove" || kind === "retaining_ring_groove") {
    const depth = params.grooveDepth ?? d * 0.03;
    const width = params.grooveWidth ?? d * 0.04;
    const r = params.r ?? Math.max(width / 4, depth * 0.1);
    const a = alphaUGroove(d, depth, r);
    return { ...a, source: "DIN 743-2 groove chart" };
  }
  if (kind === "keyway_sled") {
    return { ...alphaKeyway("sled_runner"), source: "DIN 743-2 keyway (sled-runner)" };
  }
  if (kind === "keyway_end_milled") {
    return { ...alphaKeyway("end_milled"), source: "DIN 743-2 keyway (end-milled)" };
  }
  if (kind === "spline" || kind === "press_fit") {
    const b = betaHubConnection(kind);
    // Hub connections are tabulated as β; treat α≈β for overload path
    return {
      alphaBending: b.betaBending,
      alphaTorsion: b.betaTorsion,
      source: `DIN 743-2 Table 1 (${kind})`,
    };
  }
  return { alphaBending: 1, alphaTorsion: 1, source: "default" };
}

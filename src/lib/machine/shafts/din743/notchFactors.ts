/**
 * DIN 743-2 fatigue notch factor β from theoretical α via relative stress gradient.
 */

import type { Din743NotchKind } from "@/data/catalogs/din743/types";
import { betaHubConnection, resolveDin743Alpha } from "@/data/catalogs/din743/notchAlpha";

/**
 * Material length parameter ρ* (mm) for support-number conversion (DIN/FKM style).
 * ρ* decreases as σB increases.
 */
export function materialLengthRhoStar_mm(sigmaB_MPa: number): number {
  const su = Math.max(sigmaB_MPa, 200);
  // FKM-like: ρ* ≈ 0.1·(350/σB)^1.5 … 0.2 mm range
  return Math.min(0.5, Math.max(0.05, 0.12 * Math.pow(350 / su, 1.5)));
}

/**
 * Relative stress gradient G' (1/mm) screening values (DIN 743-2 Table 2 orientation).
 */
export function relativeStressGradient(
  kind: Din743NotchKind,
  d_mm: number,
  r_mm: number
): { Gprime_sigma: number; Gprime_tau: number } {
  const r = Math.max(r_mm, 0.05);
  const d = Math.max(d_mm, 1);
  if (kind === "plain") {
    return { Gprime_sigma: 2 / d, Gprime_tau: 2 / d };
  }
  // Notch: G' ≈ 2/r + 2/d style
  const G = 2 / r + 2 / d;
  return { Gprime_sigma: G, Gprime_tau: 0.75 * G };
}

/** Support number n = 1 + √(G'·ρ*) */
export function supportNumber(Gprime: number, rhoStar_mm: number): number {
  return 1 + Math.sqrt(Math.max(Gprime, 0) * Math.max(rhoStar_mm, 0));
}

export function alphaToBeta(
  alpha: number,
  Gprime: number,
  rhoStar_mm: number
): number {
  const n = supportNumber(Gprime, rhoStar_mm);
  return Math.max(1, alpha / Math.max(n, 1));
}

export type Din743NotchResult = {
  kind: Din743NotchKind;
  alphaBending: number;
  alphaTorsion: number;
  betaBending: number;
  betaTorsion: number;
  Gprime_sigma: number;
  Gprime_tau: number;
  source: string;
};

export function resolveDin743NotchFactors(params: {
  kind: Din743NotchKind;
  d_m: number;
  D_m?: number;
  r_m?: number;
  grooveDepth_m?: number;
  grooveWidth_m?: number;
  sigmaB_MPa: number;
  customAlphaBending?: number;
  customAlphaTorsion?: number;
}): Din743NotchResult {
  const d_mm = params.d_m * 1000;
  const r_m =
    params.r_m ??
    (params.grooveWidth_m != null ? params.grooveWidth_m / 4 : undefined) ??
    params.d_m * 0.02;
  const r_mm = r_m * 1000;

  // Hub connections: β from Table 1 directly
  if (params.kind === "spline" || params.kind === "press_fit") {
    const b = betaHubConnection(params.kind);
    return {
      kind: params.kind,
      alphaBending: b.betaBending,
      alphaTorsion: b.betaTorsion,
      betaBending: b.betaBending,
      betaTorsion: b.betaTorsion,
      Gprime_sigma: 2 / Math.max(r_mm, 0.2),
      Gprime_tau: 1.5 / Math.max(r_mm, 0.2),
      source: `DIN 743-2 Table 1 (${params.kind})`,
    };
  }

  const alpha = resolveDin743Alpha({
    kind: params.kind,
    d: params.d_m,
    D: params.D_m,
    r: params.r_m,
    grooveDepth: params.grooveDepth_m,
    grooveWidth: params.grooveWidth_m,
    customAlphaBending: params.customAlphaBending,
    customAlphaTorsion: params.customAlphaTorsion,
  });

  const G = relativeStressGradient(params.kind, d_mm, r_mm);
  const rho = materialLengthRhoStar_mm(params.sigmaB_MPa);
  const betaBending = alphaToBeta(alpha.alphaBending, G.Gprime_sigma, rho);
  const betaTorsion = alphaToBeta(alpha.alphaTorsion, G.Gprime_tau, rho);

  return {
    kind: params.kind,
    alphaBending: alpha.alphaBending,
    alphaTorsion: alpha.alphaTorsion,
    betaBending,
    betaTorsion,
    Gprime_sigma: G.Gprime_sigma,
    Gprime_tau: G.Gprime_tau,
    source: alpha.source,
  };
}

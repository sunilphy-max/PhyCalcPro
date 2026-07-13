/**
 * Adjusted reference speed n_θ (SKF-style screening).
 * Starts from catalog n_ref (or 0.8·n_lim) and applies load / lubricant / sealing factors.
 */

import type { LubricantType } from "./types";

export type AdjustedReferenceSpeedInput = {
  speedRpm: number;
  referenceSpeedRpm?: number | null;
  limitingSpeedRpm?: number | null;
  /** P/C dynamic utilization. */
  dynamicUtilization: number;
  /** Viscosity ratio κ when known. */
  kappa?: number;
  lubricantType?: LubricantType;
  sealed?: boolean;
  isoVgGrade?: number;
};

export type AdjustedReferenceSpeedResult = {
  nRefBaseRpm: number;
  nAdjRpm: number;
  nAdjMargin: number;
  loadFactor: number;
  viscosityFactor: number;
  lubricantFactor: number;
  sealFactor: number;
  note: string;
};

function loadSpeedFactor(pOverC: number): number {
  // Light load → can exceed n_ref; heavy load → reduce
  if (pOverC <= 0.05) return 1.15;
  if (pOverC <= 0.1) return 1;
  if (pOverC <= 0.15) return 0.85;
  if (pOverC <= 0.25) return 0.7;
  return 0.55;
}

function viscositySpeedFactor(kappa?: number, isoVg?: number): number {
  if (kappa != null && kappa > 0) {
    if (kappa >= 2) return 1.05;
    if (kappa >= 1) return 1;
    if (kappa >= 0.5) return 0.9;
    return 0.75;
  }
  if (isoVg != null) {
    if (isoVg <= 32) return 1.05;
    if (isoVg <= 68) return 1;
    if (isoVg <= 150) return 0.9;
    return 0.8;
  }
  return 1;
}

function lubricantSpeedFactor(type?: LubricantType): number {
  if (type === "oil") return 1.1;
  if (type === "grease") return 0.95;
  if (type === "none") return 0.7;
  return 1;
}

/**
 * n_adj = n_ref · f_load · f_ν · f_lube · f_seal
 */
export function calculateAdjustedReferenceSpeed(
  input: AdjustedReferenceSpeedInput
): AdjustedReferenceSpeedResult {
  const nRefBase =
    input.referenceSpeedRpm != null && input.referenceSpeedRpm > 0
      ? input.referenceSpeedRpm
      : input.limitingSpeedRpm != null && input.limitingSpeedRpm > 0
        ? 0.8 * input.limitingSpeedRpm
        : 0;

  const fLoad = loadSpeedFactor(input.dynamicUtilization);
  const fVisc = viscositySpeedFactor(input.kappa, input.isoVgGrade);
  const fLube = lubricantSpeedFactor(input.lubricantType);
  const fSeal = input.sealed ? 0.85 : 1;

  const nAdj = nRefBase > 0 ? nRefBase * fLoad * fVisc * fLube * fSeal : 0;
  const n = Math.max(input.speedRpm, 1e-9);
  const margin = nAdj > 0 ? nAdj / n : 0;

  const note =
    nRefBase <= 0
      ? "No catalog reference/limiting speed — adjusted n_θ unavailable."
      : `Adjusted reference speed n_θ ≈ ${Math.round(nAdj).toLocaleString()} rpm (screening from n_ref, P/C, κ/VG, grease/oil, seal). Not a full SKF Product Select thermal model.`;

  return {
    nRefBaseRpm: nRefBase,
    nAdjRpm: nAdj,
    nAdjMargin: margin,
    loadFactor: fLoad,
    viscosityFactor: fVisc,
    lubricantFactor: fLube,
    sealFactor: fSeal,
    note,
  };
}

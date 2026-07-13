/**
 * ISO 16281-inspired screening — adjusts equivalent load P for clearance,
 * misalignment, and crude load-distribution effects.
 *
 * NOT a full ISO 16281:2025 contact / internal load-distribution analysis.
 */

import type { BearingClearance } from "@/data/catalogs/bearingCatalog";
import type { BearingType } from "./types";
import { calculateMisalignmentFactors } from "./misalignmentFactors";
import { recommendBearingFits } from "./fitsClearance";

export type Iso16281ScreenInput = {
  bearingType: BearingType;
  equivalentLoadN: number;
  radialLoadN: number;
  axialLoadN: number;
  boreMm: number;
  speedRpm: number;
  clearance?: BearingClearance;
  operatingClearanceUm?: number;
  misalignmentAngleMrad?: number;
  stationSlopesMrad?: number[];
  fitOperatingClearanceUm?: number;
};

export type Iso16281ScreenResult = {
  PbaseN: number;
  PadjN: number;
  fClearance: number;
  fMisalign: number;
  fDistrib: number;
  operatingClearanceUm: number | null;
  misalignmentUsedMrad: number;
  note: string;
};

/** Nominal mid clearance (μm) when fits not available. */
const CLEARANCE_MID_UM: Record<BearingClearance, number> = {
  C2: 8,
  CN: 15,
  C3: 28,
  C4: 42,
};

/**
 * Clearance factor: tight operating clearance raises edge-load risk (f > 1);
 * generous clearance ≈ 1.
 */
export function clearanceLoadFactor(operatingClearanceUm: number, boreMm: number): number {
  // Reference clearance ~0.001·d (μm ≈ d_mm)
  const refUm = Math.max(boreMm * 0.4, 5);
  const ratio = operatingClearanceUm / refUm;
  if (ratio >= 1) return 1;
  if (ratio <= 0) return 1.35;
  // Tighter than ref → up to +35% on P
  return 1 + 0.35 * Math.pow(1 - ratio, 1.25);
}

/**
 * Mild load-distribution penalty when Fa/Fr is high on roller families
 * (edge loading proxy without roller-count FEA).
 */
export function distributionLoadFactor(
  bearingType: BearingType,
  radialLoadN: number,
  axialLoadN: number
): number {
  const Fr = Math.abs(radialLoadN);
  const Fa = Math.abs(axialLoadN);
  const ratio = Fr > 1e-9 ? Fa / Fr : Fa > 0 ? 10 : 0;

  switch (bearingType) {
    case "cylindrical_roller":
    case "needle_roller":
    case "toroidal_roller":
      // Pure radial — axial should be near zero; if Fa present, penalize
      return Fa > 0.05 * Math.max(Fr, 1) ? 1.15 : 1;
    case "tapered_roller":
    case "angular_contact":
      return ratio > 1.2 ? 1 + 0.08 * Math.min(ratio - 1.2, 2) : 1;
    case "spherical_roller":
    case "self_aligning_ball":
      return ratio > 0.8 ? 1 + 0.05 * Math.min(ratio - 0.8, 2) : 1;
    default:
      return ratio > 0.6 ? 1 + 0.06 * Math.min(ratio - 0.6, 2) : 1;
  }
}

function resolveOperatingClearanceUm(input: Iso16281ScreenInput): number | null {
  if (input.operatingClearanceUm != null) return input.operatingClearanceUm;
  if (input.fitOperatingClearanceUm != null) return input.fitOperatingClearanceUm;
  if (input.clearance) {
    const fits = recommendBearingFits({
      boreMm: input.boreMm,
      radialLoadN: Math.abs(input.radialLoadN),
      speedRpm: input.speedRpm,
      mountingRole: "either",
      clearance: input.clearance,
    });
    return fits.estimatedOperatingClearanceUm;
  }
  return null;
}

export function calculateIso16281Screen(input: Iso16281ScreenInput): Iso16281ScreenResult {
  const PbaseN = Math.max(input.equivalentLoadN, 1e-9);
  const mis = calculateMisalignmentFactors({
    bearingType: input.bearingType,
    misalignmentAngleMrad: input.misalignmentAngleMrad,
    stationSlopesMrad: input.stationSlopesMrad,
  });

  const opClearance = resolveOperatingClearanceUm(input);
  const fClearance =
    opClearance != null ? clearanceLoadFactor(opClearance, input.boreMm) : 1;
  const fMisalign = mis.fMisalign;
  const fDistrib = distributionLoadFactor(
    input.bearingType,
    input.radialLoadN,
    input.axialLoadN
  );

  const PadjN = PbaseN * fClearance * fMisalign * fDistrib;

  const parts: string[] = [
    "ISO 16281-inspired screening (not full ISO 16281:2025 contact analysis).",
  ];
  if (opClearance != null) {
    parts.push(`Operating clearance ≈ ${opClearance.toFixed(1)} μm → f_c=${fClearance.toFixed(3)}.`);
  }
  if (mis.angleMrad > 0) {
    parts.push(mis.note);
  }
  if (fDistrib > 1.001) {
    parts.push(`Load-distribution factor f_d=${fDistrib.toFixed(3)}.`);
  }

  return {
    PbaseN,
    PadjN,
    fClearance,
    fMisalign,
    fDistrib,
    operatingClearanceUm: opClearance,
    misalignmentUsedMrad: mis.angleMrad,
    note: parts.join(" "),
  };
}

export function clearanceMidUm(clearance: BearingClearance): number {
  return CLEARANCE_MID_UM[clearance];
}

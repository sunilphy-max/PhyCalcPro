/**
 * Misalignment angle → life / load factors (screening).
 * Self-aligning families tolerate larger angles; rigid families derate sooner.
 */

import type { BearingType } from "./types";

export type MisalignmentFactorResult = {
  angleMrad: number;
  capacityMrad: number;
  utilization: number;
  /**
   * Multiplier on equivalent dynamic load P when folding misalignment into
   * ISO 16281-style universal load (typically ≥ 1).
   */
  fMisalign: number;
  /**
   * Life derate factor (≤ 1) when keeping P as ISO 281 and applying a_mis separately.
   */
  aMis: number;
  /** Scale applied to catalog Y when Fa/Fr coupling is used (screening). */
  Yscale: number;
  note: string;
};

/** Typical allowable misalignment (mrad) by family — screening mid-values. */
export function misalignmentCapacityMrad(bearingType: BearingType): number {
  switch (bearingType) {
    case "self_aligning_ball":
      return 40;
    case "spherical_roller":
    case "thrust_spherical_roller":
      return 30;
    case "toroidal_roller":
      return 50;
    case "deep_groove":
      return 2.5;
    case "angular_contact":
      return 1.5;
    case "tapered_roller":
      return 2;
    case "cylindrical_roller":
    case "cylindrical_nj":
    case "cylindrical_nup":
    case "needle_roller":
    case "thrust_cylindrical_roller":
      return 1;
    case "thrust_ball":
      return 1.5;
    default:
      return 2;
  }
}

export function resolveEffectiveMisalignmentMrad(params: {
  misalignmentAngleMrad?: number;
  stationSlopesMrad?: number[];
}): number {
  const manual = Math.abs(params.misalignmentAngleMrad ?? 0);
  const fromStations = (params.stationSlopesMrad ?? []).reduce(
    (max, s) => Math.max(max, Math.abs(s)),
    0
  );
  return Math.max(manual, fromStations);
}

/**
 * Screening misalignment factors.
 * Past capacity: fMisalign rises and aMis falls; mild effect below ~50% capacity.
 */
export function calculateMisalignmentFactors(params: {
  bearingType: BearingType;
  misalignmentAngleMrad?: number;
  stationSlopesMrad?: number[];
}): MisalignmentFactorResult {
  const angleMrad = resolveEffectiveMisalignmentMrad(params);
  const capacityMrad = misalignmentCapacityMrad(params.bearingType);
  const utilization = angleMrad / Math.max(capacityMrad, 1e-9);

  if (angleMrad < 1e-6) {
    return {
      angleMrad: 0,
      capacityMrad,
      utilization: 0,
      fMisalign: 1,
      aMis: 1,
      Yscale: 1,
      note: "No misalignment applied.",
    };
  }

  // Soft zone to capacity; then progressive penalty.
  const excess = Math.max(0, utilization - 0.5);
  const fMisalign = 1 + 0.35 * Math.pow(Math.min(utilization, 3), 1.4);
  const aMis = Math.min(1, Math.max(0.15, 1 / (1 + 1.2 * Math.pow(excess, 1.6))));
  const Yscale = 1 + 0.25 * Math.min(utilization, 2);

  let note: string;
  if (utilization <= 0.5) {
    note = `Misalignment ${angleMrad.toFixed(2)} mrad within ~50% of family capacity (${capacityMrad} mrad).`;
  } else if (utilization <= 1) {
    note = `Misalignment ${angleMrad.toFixed(2)} mrad approaching capacity (${capacityMrad} mrad) — screening derate applied.`;
  } else {
    note = `Misalignment ${angleMrad.toFixed(2)} mrad exceeds capacity (${capacityMrad} mrad) — strong screening derate; consider self-aligning / spherical / toroidal.`;
  }

  return {
    angleMrad,
    capacityMrad,
    utilization,
    fMisalign,
    aMis,
    Yscale,
    note,
  };
}

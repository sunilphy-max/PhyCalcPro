/**
 * Duplex angular-contact / tapered preload and stiffness screening (MITCalc / SKF style).
 *
 * O (back-to-back): high moment stiffness, good for overhanging loads / spindles.
 * X (face-to-face): lower moment stiffness, better misalignment tolerance.
 * Tandem: axial capacity in one direction; low moment stiffness.
 */

import type { BearingArrangement } from "./types";

export type DuplexPreloadClass = "none" | "light" | "medium" | "heavy";

/** Preload as fraction of dynamic rating C (screening). */
export const PRELOAD_FRACTION_OF_C: Record<DuplexPreloadClass, number> = {
  none: 0,
  light: 0.02,
  medium: 0.05,
  heavy: 0.1,
};

export type DuplexStiffnessInput = {
  arrangement: BearingArrangement;
  /** Dynamic rating C of one bearing (N). */
  dynamicRatingN: number;
  /** Mean diameter dm = (d+D)/2 (mm). */
  meanDiameterMm: number;
  /** Contact angle (deg). Default 40° angular / 15° tapered screening. */
  contactAngleDeg?: number;
  preloadClass?: DuplexPreloadClass;
  /** Override preload force (N) — takes precedence over class. */
  preloadForceN?: number;
  bearingType?: "angular_contact" | "tapered_roller" | string;
};

export type DuplexStiffnessResult = {
  preloadForceN: number;
  preloadClass: DuplexPreloadClass;
  /** Axial stiffness of the pair (N/µm). */
  axialStiffnessNPerUm: number;
  /** Radial stiffness of the pair (N/µm). */
  radialStiffnessNPerUm: number;
  /** Moment stiffness (N·m/mrad) — O ≫ X ≫ tandem. */
  momentStiffnessNmPerMrad: number;
  arrangementLabel: string;
  comparisonNote: string;
};

function arrangementLabel(a: BearingArrangement): string {
  if (a === "back_to_back") return "Back-to-back (O)";
  if (a === "face_to_face") return "Face-to-face (X)";
  if (a === "tandem") return "Tandem (T)";
  return "Single";
}

/**
 * Screening stiffness model:
 * Base Ka ∝ √(C · dm) · sin(α); arrangement multipliers differentiate O / X / T.
 */
export function calculateDuplexStiffness(input: DuplexStiffnessInput): DuplexStiffnessResult {
  const arrangement = input.arrangement;
  const preloadClass = input.preloadClass ?? "none";
  const preloadForceN =
    input.preloadForceN != null
      ? input.preloadForceN
      : PRELOAD_FRACTION_OF_C[preloadClass] * input.dynamicRatingN;

  const alphaDeg =
    input.contactAngleDeg ??
    (input.bearingType === "tapered_roller" ? 15 : 40);
  const alpha = (alphaDeg * Math.PI) / 180;
  const dm = Math.max(input.meanDiameterMm, 10);
  const C = Math.max(input.dynamicRatingN, 1);

  // Base single-row axial stiffness screening (N/µm)
  const preloadBoost = 1 + Math.sqrt(preloadForceN / Math.max(C * 0.02, 1));
  const kaSingle = 0.08 * Math.sqrt(C * dm) * Math.sin(alpha) * preloadBoost;

  let kaMul = 1;
  let krMul = 1;
  let kmMul = 0.05;
  let comparisonNote = "Single bearing — no duplex stiffness gain.";

  if (arrangement === "back_to_back") {
    kaMul = 1.8;
    krMul = 1.9;
    kmMul = 1.0;
    comparisonNote =
      "O arrangement: highest moment stiffness — preferred for spindles, ball screws, and overhanging gears.";
  } else if (arrangement === "face_to_face") {
    kaMul = 1.6;
    krMul = 1.7;
    kmMul = 0.35;
    comparisonNote =
      "X arrangement: lower moment stiffness than O — better for misalignment; use when shaft tilt is expected.";
  } else if (arrangement === "tandem") {
    kaMul = 1.9;
    krMul = 1.5;
    kmMul = 0.08;
    comparisonNote =
      "Tandem: axial capacity in one direction only — pair with a reverse-thrust bearing or second duplex set.";
  }

  const axialStiffnessNPerUm = kaSingle * kaMul;
  const radialStiffnessNPerUm = kaSingle * 1.2 * krMul;
  // Moment stiffness scales with axial stiffness × dm²
  const momentStiffnessNmPerMrad =
    axialStiffnessNPerUm * Math.pow(dm / 1000, 2) * 1000 * kmMul;

  return {
    preloadForceN,
    preloadClass,
    axialStiffnessNPerUm,
    radialStiffnessNPerUm,
    momentStiffnessNmPerMrad,
    arrangementLabel: arrangementLabel(arrangement),
    comparisonNote,
  };
}

/** Effective axial load for life when preload is present (external Fa + preload share). */
export function effectiveAxialWithPreload(
  externalFa: number,
  preloadForceN: number,
  arrangement: BearingArrangement
): number {
  if (arrangement === "single" || preloadForceN <= 0) return Math.abs(externalFa);
  // Screening: each row sees preload; external Fa adds to the loaded row.
  return Math.abs(externalFa) + preloadForceN;
}

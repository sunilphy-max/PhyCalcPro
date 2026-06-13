import type { BearingConfig, BearingResult, BearingType, BearingReliability } from "./types";

/**
 * ISO 281 X/Y factors. Ball bearing values are the classic single-row
 * table entries (deep groove at moderate Fa/C0; angular contact 40°).
 * Cylindrical rollers carry no axial load in this model.
 */
const bearingCoefficients: Record<BearingType, { X: number; Y: number; e: number }> = {
  deep_groove: { X: 0.56, Y: 1.6, e: 0.3 },
  angular_contact: { X: 0.35, Y: 0.57, e: 1.14 },
  cylindrical_roller: { X: 1.0, Y: 0.0, e: Infinity },
};

/** ISO 281 life exponent: 3 for ball bearings, 10/3 for roller bearings */
export function lifeExponentFor(type: BearingType): number {
  return type === "cylindrical_roller" ? 10 / 3 : 3;
}

/** ISO 281 a1 life adjustment factor for reliability */
const A1_FACTORS: Record<BearingReliability, number> = {
  90: 1.0,
  95: 0.64,
  96: 0.55,
  97: 0.47,
  98: 0.37,
  99: 0.25,
};

export function calculateBearingEquivalentLoad(config: BearingConfig): number {
  const Fr = Math.abs(config.radialLoad);
  const Fa = Math.abs(config.axialLoad);
  const { X, Y, e } = bearingCoefficients[config.bearingType];
  const FaOverFr = Fr > 0 ? Fa / Fr : Number.POSITIVE_INFINITY;

  // ISO 281: P = Fr when Fa/Fr ≤ e, else P = X·Fr + Y·Fa
  if (!(FaOverFr > e)) return Fr;
  return Math.max(X * Fr + Y * Fa, Fr);
}

export function solveBearingDesign(config: BearingConfig): BearingResult {
  const equivalentLoad = calculateBearingEquivalentLoad(config);
  const p = lifeExponentFor(config.bearingType);
  const reliability = config.reliabilityPercent ?? 90;
  const a1 = A1_FACTORS[reliability] ?? 1.0;
  const speed = Math.max(config.speed, 1e-9);

  // Required revolutions for the requested life, corrected for reliability:
  // L_nm = a1·(C/P)^p·10⁶ rev  →  C_req = P·(L_req/(a1·10⁶))^(1/p)
  const requiredRevolutions = config.lifeHours * speed * 60;
  const requiredDynamicRating =
    equivalentLoad *
    Math.pow(requiredRevolutions / (a1 * 1e6), 1 / p) *
    config.safetyFactor;

  // Expected life with the selected/supplied rating:
  // L10h = a1·(C/P)^p·10⁶/(60·n)
  const dynamicLoadRatingN =
    config.dynamicLoadRatingN ?? config.material.dynamicRatingFactor;
  const expectedLife =
    equivalentLoad > 0 && dynamicLoadRatingN > 0
      ? (a1 * Math.pow(dynamicLoadRatingN / equivalentLoad, p) * 1e6) / (60 * speed)
      : 0;

  return {
    radialLoad: config.radialLoad,
    axialLoad: config.axialLoad,
    equivalentLoad,
    requiredDynamicRating,
    expectedLife,
    dynamicLoadRatingN,
    lifeExponent: p,
    a1,
    lifeUtilization: expectedLife > 0 ? config.lifeHours / expectedLife : Infinity,
    safetyFactor: config.safetyFactor,
    bearingType: config.bearingType,
    designation: config.designation,
    material: config.material,
  };
}

import type { DesignCodeId } from "../types";

/** US mechanical allowable-stress factors (simplified Phase 1). */
export const AISC_ASD = {
  omegaFlexure: 1.67,
  omegaShear: 1.67,
  omegaCompression: 1.67,
} as const;

/** EU/ISO industrial screening partial factors (defaults for Phase 1). */
export const EN_PARTIAL = {
  gammaM0: 1.0,
  gammaM1: 1.0,
} as const;

/** AGMA / ISO-style minimum safety factors for rating checks (Phase 1). */
export const GEAR_MIN_SF = {
  US: 1.5,
  EU: 1.4,
  ISO: 1.4,
  INDICATIVE: 1.2,
} as const;

export function flexureAllowableStressPa(fyPa: number, designCode: DesignCodeId): number {
  if (designCode === "US") return fyPa / AISC_ASD.omegaFlexure;
  if (designCode === "EU" || designCode === "ISO") return fyPa / EN_PARTIAL.gammaM0;
  return fyPa;
}

export function shearAllowableStressPa(fyPa: number, designCode: DesignCodeId): number {
  const root3 = Math.sqrt(3);
  if (designCode === "US") return fyPa / (root3 * AISC_ASD.omegaShear);
  if (designCode === "EU" || designCode === "ISO") return fyPa / (root3 * EN_PARTIAL.gammaM0);
  return fyPa / root3;
}

export function compressionAllowableLoadN(pcrN: number, designCode: DesignCodeId): number {
  if (designCode === "US") return pcrN / AISC_ASD.omegaCompression;
  if (designCode === "EU" || designCode === "ISO") return pcrN / EN_PARTIAL.gammaM0;
  return pcrN;
}

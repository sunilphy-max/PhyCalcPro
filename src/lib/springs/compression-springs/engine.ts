import type { CompressionSpringConfig, CompressionSpringResult, SpringWireType } from "./types";

/**
 * Wire strength size-effect fit Sut = A/d^m (d in mm), Shigley Table 10-4
 * (ASTM A228/A227/A229/A232/A401 cold-drawn spring wire).
 */
const WIRE_STRENGTH_FIT: Record<Exclude<SpringWireType, "custom">, { A: number; m: number }> = {
  music: { A: 2211e6, m: 0.145 },
  "hard-drawn": { A: 1783e6, m: 0.19 },
  "oil-tempered": { A: 1855e6, m: 0.187 },
  "chrome-vanadium": { A: 2005e6, m: 0.168 },
  "chrome-silicon": { A: 1974e6, m: 0.108 },
};

export function wireUltimateStrengthPa(
  wireType: SpringWireType | undefined,
  wireDiameterM: number,
  fallbackPa: number
): number {
  if (!wireType || wireType === "custom") return fallbackPa;
  const { A, m } = WIRE_STRENGTH_FIT[wireType];
  const dMm = Math.max(wireDiameterM * 1000, 0.1);
  return A / Math.pow(dMm, m);
}

/**
 * Helical compression spring per EN 13906-1 / Shigley Ch. 10:
 *   k = G·d⁴/(8·D³·n), τ = K_w·8·F·D/(π·d³),
 *   static allowable τ_zul = 0.56·Rm (EN 13906-1 cold-coiled),
 *   buckle-proof when L0/D ≤ 2.63/ν (ν = 0.5, guided ends),
 *   surge frequency f = ½·√(k/m_active) for fixed-fixed ends.
 */
export function solveCompressionSpringEngine(c: CompressionSpringConfig): CompressionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const G = c.modulus; // shear modulus supplied directly
  const rho = c.density ?? 7850;

  const springRate = (G * d ** 4) / (8 * D ** 3 * n);
  const solidHeight = n * d + 2 * d; // closed and ground ends
  const maxLoad = springRate * c.deflection;

  const C = D / d; // spring index
  const wahlFactor = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
  const shearStress = (8 * maxLoad * D * wahlFactor) / (Math.PI * d ** 3);

  const wireUltimate = wireUltimateStrengthPa(c.wireType, d, c.ultimateStrength);
  const allowableShearStress = 0.56 * wireUltimate;
  const safetyFactor = allowableShearStress / Math.max(shearStress, 1e-9);

  // Surge frequency: f = ½·√(k/m) with the active-coil wire mass
  const activeMass = ((Math.PI * d ** 2) / 4) * (Math.PI * D * n) * rho;
  const naturalFrequency = 0.5 * Math.sqrt(springRate / Math.max(activeMass, 1e-12));

  // EN 13906-1 buckling screen, seating coefficient ν = 0.5 (both ends guided)
  const freeLength = c.freeLength > 0 ? c.freeLength : solidHeight + c.deflection;
  const slenderness = freeLength / D;
  const bucklingRisk = slenderness > 2.63 / 0.5;

  return {
    springRate,
    solidHeight,
    maxLoad,
    shearStress,
    allowableShearStress,
    wireUltimateStrength: wireUltimate,
    safetyFactor,
    naturalFrequency,
    springIndex: C,
    wahlFactor,
    slenderness,
    bucklingRisk,
  };
}

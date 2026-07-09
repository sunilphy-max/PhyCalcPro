/**
 * ISO 7902 journal bearing screening with Raimondi–Boyd ε vs Sommerfeld S (l/d = 1).
 */

/** Sommerfeld S → eccentricity ratio ε (Raimondi–Boyd, full journal, l/d ≈ 1). */
const RAIMONDI_BOYD: [number, number][] = [
  [0.01, 0.19],
  [0.02, 0.26],
  [0.04, 0.34],
  [0.1, 0.45],
  [0.2, 0.55],
  [0.4, 0.64],
  [0.6, 0.69],
  [1.0, 0.75],
  [2.0, 0.83],
  [4.0, 0.89],
  [8.0, 0.93],
  [15.0, 0.96],
  [30.0, 0.98],
];

export function eccentricityFromSommerfeld(S: number): number {
  if (S <= 0) return 0;
  const maxS = RAIMONDI_BOYD[RAIMONDI_BOYD.length - 1]![0];
  if (S >= maxS) return 0.99;
  for (let i = 0; i < RAIMONDI_BOYD.length - 1; i++) {
    const [s0, e0] = RAIMONDI_BOYD[i]!;
    const [s1, e1] = RAIMONDI_BOYD[i + 1]!;
    if (S >= s0 && S <= s1) {
      const t = (S - s0) / (s1 - s0);
      return e0 + t * (e1 - e0);
    }
  }
  return 0.5;
}

/** ISO 7902 Sommerfeld number for full journal (metric SI). */
export function sommerfeldNumber(params: {
  viscosityPas: number;
  speedRpm: number;
  radialLoadN: number;
  diameterM: number;
  lengthM: number;
  radialClearanceM: number;
}): number {
  const r = params.diameterM / 2;
  const omega = (2 * Math.PI * params.speedRpm) / 60;
  const p = params.radialLoadN / (params.lengthM * params.diameterM);
  const c = params.radialClearanceM;
  if (p <= 0 || c <= 0) return 0;
  return (params.viscosityPas * omega * r) / (p * c);
}

/** Temperature rise screening (°C) from power loss. */
export function bearingTemperatureRiseC(powerLossW: number, diameterM: number, lengthM: number): number {
  const area = Math.PI * diameterM * lengthM;
  return powerLossW / Math.max(800 * area, 1);
}

/** Recommended shaft/housing tolerances for plain journal (ISO 3547 screening). */
export function recommendPlainJournalFits(diameterM: number, speedRpm: number): {
  shaftFit: string;
  housingFit: string;
  minClearanceUm: number;
} {
  const dMm = diameterM * 1000;
  if (speedRpm > 3000) {
    return { shaftFit: "h6", housingFit: "H7", minClearanceUm: 0.08 * Math.pow(dMm, 0.5) };
  }
  return { shaftFit: "h7", housingFit: "H8", minClearanceUm: 0.12 * Math.pow(dMm, 0.5) };
}

/** Specific load W/A (Pa) — ISO 7902 screening limit ~3 MPa for general duty. */
export function specificLoadPa(loadN: number, diameterM: number, lengthM: number): number {
  return loadN / Math.max(Math.PI * diameterM * lengthM, 1e-12);
}

/**
 * ISO 7902 journal bearing screening with Raimondi–Boyd ε vs Sommerfeld S.
 * Tables for L/D ∈ {0.25, 0.5, 0.75, 1.0, 1.5} with linear interpolation in L/D.
 */

/** Sommerfeld S → eccentricity ratio ε (full journal screening). */
type Curve = readonly [number, number][];

const RB_LD_1: Curve = [
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

/** Scale ε toward 1 for shorter bearings at the same S (screening). */
function scaleCurve(base: Curve, towardOne: number): Curve {
  return base.map(([s, e]) => [s, Math.min(0.99, e + (1 - e) * towardOne)] as [number, number]);
}

const RB_BY_LD: { ld: number; curve: Curve }[] = [
  { ld: 0.25, curve: scaleCurve(RB_LD_1, 0.35) },
  { ld: 0.5, curve: scaleCurve(RB_LD_1, 0.2) },
  { ld: 0.75, curve: scaleCurve(RB_LD_1, 0.08) },
  { ld: 1.0, curve: RB_LD_1 },
  { ld: 1.5, curve: scaleCurve(RB_LD_1, -0.12) },
];

function interpolateCurve(curve: Curve, S: number): number {
  if (S <= 0) return 0;
  const maxS = curve[curve.length - 1]![0];
  if (S >= maxS) return 0.99;
  for (let i = 0; i < curve.length - 1; i++) {
    const [s0, e0] = curve[i]!;
    const [s1, e1] = curve[i + 1]!;
    if (S >= s0 && S <= s1) {
      const t = (S - s0) / (s1 - s0);
      return e0 + t * (e1 - e0);
    }
  }
  return 0.5;
}

/**
 * Eccentricity from Sommerfeld with optional L/D (default 1.0 for backward compatibility).
 */
export function eccentricityFromSommerfeld(S: number, lengthOverDiameter = 1): number {
  const ld = Math.min(Math.max(lengthOverDiameter, 0.25), 1.5);
  let lo = RB_BY_LD[0]!;
  let hi = RB_BY_LD[RB_BY_LD.length - 1]!;
  for (let i = 0; i < RB_BY_LD.length - 1; i++) {
    if (ld >= RB_BY_LD[i]!.ld && ld <= RB_BY_LD[i + 1]!.ld) {
      lo = RB_BY_LD[i]!;
      hi = RB_BY_LD[i + 1]!;
      break;
    }
  }
  const e0 = interpolateCurve(lo.curve, S);
  const e1 = interpolateCurve(hi.curve, S);
  if (hi.ld === lo.ld) return e0;
  const t = (ld - lo.ld) / (hi.ld - lo.ld);
  return Math.min(0.99, Math.max(0, e0 + t * (e1 - e0)));
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

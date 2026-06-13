import type { FatigueConfig, FatigueResult, FatigueLoadType, SurfaceFinish } from "./types";

const INFINITE_LIFE_CYCLES = 1e6;

/** Marin surface factor ka = a·Su^b with Su in MPa (Shigley Table 6-2) */
function surfaceFactor(finish: SurfaceFinish, ultimatePa: number): number {
  const suMpa = ultimatePa / 1e6;
  const coefficients: Record<SurfaceFinish, { a: number; b: number }> = {
    ground: { a: 1.58, b: -0.085 },
    machined: { a: 4.51, b: -0.265 },
    "hot-rolled": { a: 57.7, b: -0.718 },
    "as-forged": { a: 272, b: -0.995 },
  };
  const { a, b } = coefficients[finish];
  return Math.min(1, a * Math.pow(Math.max(suMpa, 1), b));
}

/** Marin size factor kb for rotating bending/torsion (Shigley Eq. 6-20); kb = 1 for axial */
function sizeFactor(loadType: FatigueLoadType, diameterM?: number): number {
  if (loadType === "axial" || !diameterM || diameterM <= 0) return 1;
  const dMm = diameterM * 1000;
  if (dMm <= 7.62) return 1;
  if (dMm <= 51) return Math.pow(dMm / 7.62, -0.107);
  return 1.51 * Math.pow(dMm, -0.157);
}

/** Marin load factor kc (Shigley Eq. 6-26) */
function loadFactorFor(loadType: FatigueLoadType): number {
  switch (loadType) {
    case "axial":
      return 0.85;
    case "torsion":
      return 0.59;
    default:
      return 1.0;
  }
}

export function solveFatigueEngine(config: FatigueConfig): FatigueResult {
  const method = config.meanStressMethod ?? "goodman";
  const finish = config.surfaceFinish ?? "machined";
  const loadType = config.loadType ?? "bending";

  const Sa = config.alternatingStress;
  const Sm = config.meanStress;
  const Su = config.ultimateStrength;

  const ka = surfaceFactor(finish, Su);
  const kb = sizeFactor(loadType, config.characteristicDiameter);
  const kc = loadFactorFor(loadType);
  const Se = config.enduranceLimit * ka * kb * kc;

  // Mean-stress correction: allowable alternating stress at the endurance limit
  let allowableStress = Se;
  // Equivalent fully-reversed amplitude for life prediction
  let equivalentAmplitude = Sa;
  if (method === "gerber") {
    const ratio = Math.min(Math.abs(Sm) / Math.max(Su, 1e-9), 0.999);
    allowableStress = Se * (1 - ratio * ratio);
    equivalentAmplitude = Sa / Math.max(1 - ratio * ratio, 1e-9);
  } else if (method === "morrow") {
    // Morrow true fracture strength approximation: σf' ≈ Su + 345 MPa (steels)
    const sigmaF = Su + 345e6;
    const ratio = Math.min(Sm / Math.max(sigmaF, 1e-9), 0.999);
    allowableStress = Se * (1 - ratio);
    equivalentAmplitude = Sa / Math.max(1 - ratio, 1e-9);
  } else {
    const ratio = Math.min(Sm / Math.max(Su, 1e-9), 0.999);
    allowableStress = Se * (1 - ratio);
    equivalentAmplitude = Sa / Math.max(1 - ratio, 1e-9);
  }
  allowableStress = Math.max(0, allowableStress);

  // Basquin S-N between 10³ and 10⁶ cycles (Shigley Eqs. 6-14/6-15/6-16):
  // S_f = a·N^b with a = (f·Su)²/Se, b = -log10(f·Su/Se)/3, f ≈ 0.9
  const f = 0.9;
  let predictedCycles = 0;
  let infiniteLife = false;
  if (equivalentAmplitude > 0 && Se > 0) {
    if (equivalentAmplitude <= Se) {
      infiniteLife = true;
      predictedCycles = INFINITE_LIFE_CYCLES;
    } else {
      const aCoeff = Math.pow(f * Su, 2) / Se;
      const bCoeff = -Math.log10((f * Su) / Se) / 3;
      const cycles = Math.pow(equivalentAmplitude / aCoeff, 1 / bCoeff);
      predictedCycles = Math.round(Math.min(Math.max(cycles, 1), INFINITE_LIFE_CYCLES));
    }
  }

  const safetyFactor = Sa > 0 ? allowableStress / Sa : Number.POSITIVE_INFINITY;
  const designStatus: FatigueResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.2 ? "warning" : "critical";

  return {
    allowableStress,
    correctedEndurance: Se,
    predictedCycles,
    infiniteLife,
    safetyFactor,
    surfaceFactor: ka,
    sizeFactor: kb,
    loadFactor: kc,
    designStatus,
  };
}

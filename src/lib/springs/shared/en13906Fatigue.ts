/**
 * EN 13906 fatigue screening — characteristic shear/bending fatigue strength
 * and life-class reduction (Parts 1–3 simplified worksheet model).
 *
 * Full EN nomographs are not embedded; verify critical designs against code worksheets.
 */

export type En13906LifeClass = "VL" | "LH" | "MH" | "HH";

/** Wire quality grade per EN 13906 (1 = highest, cold-formed premium). */
export type En13906WireQuality = 1 | 2 | 3;

export const EN13906_LIFE_CYCLES: Record<En13906LifeClass, number> = {
  VL: 1e7,
  LH: 1e6,
  MH: 1e5,
  HH: 1e4,
};

const QUALITY_TAU_K0_FACTOR: Record<En13906WireQuality, number> = {
  1: 0.45,
  2: 0.4,
  3: 0.35,
};

const QUALITY_SIGMA_K0_FACTOR: Record<En13906WireQuality, number> = {
  1: 0.65,
  2: 0.58,
  3: 0.52,
};

/** Size factor for characteristic fatigue strength (EN 13906-1 Table B.1 trend). */
export function en13906SizeFactorFatigue(wireDiameterM: number): number {
  const dMm = Math.max(wireDiameterM * 1000, 0.1);
  if (dMm <= 10) return 1;
  return Math.pow(10 / dMm, 0.15);
}

/** Characteristic infinite-life shear fatigue strength τk0 [Pa]. */
export function en13906CharacteristicShearFatigue(
  ultimateStrength: number,
  wireDiameterM: number,
  wireQuality: En13906WireQuality = 1
): number {
  return (
    QUALITY_TAU_K0_FACTOR[wireQuality] *
    ultimateStrength *
    en13906SizeFactorFatigue(wireDiameterM)
  );
}

/** Characteristic infinite-life bending fatigue strength σk0 [Pa] (torsion springs). */
export function en13906CharacteristicBendingFatigue(
  ultimateStrength: number,
  wireDiameterM: number,
  wireQuality: En13906WireQuality = 1
): number {
  return (
    QUALITY_SIGMA_K0_FACTOR[wireQuality] *
    ultimateStrength *
    en13906SizeFactorFatigue(wireDiameterM)
  );
}

/** Life reduction factor kN for N cycles (simplified EN 13906-1 nomograph). */
export function en13906LifeFactor(cycles: number): number {
  const N = Math.max(cycles, 1);
  if (N >= 1e7) return 1;
  if (N >= 1e6) return 0.92;
  if (N >= 1e5) return 0.85;
  if (N >= 1e4) return 0.75;
  return 0.65;
}

export type FatigueStressState = {
  amplitude: number;
  mean: number;
  max: number;
  min: number;
};

export type En13906FatigueResult = {
  enabled: boolean;
  lifeClass: En13906LifeClass;
  loadCycles: number;
  wireQuality: En13906WireQuality;
  stressAmplitude: number;
  stressMean: number;
  characteristicFatigueStrength: number;
  lifeFactor: number;
  allowableAmplitude: number;
  fatigueSafetyFactor: number;
  fatigueUtilization: number;
  fatiguePass: boolean;
};

function allowableAmplitudeGoodman(
  characteristicStrength: number,
  lifeFactor: number,
  meanStress: number,
  staticAllowable: number
): number {
  const tauK = characteristicStrength * lifeFactor;
  if (staticAllowable <= 0) return 0;
  const goodman = tauK * (1 - Math.abs(meanStress) / staticAllowable);
  return Math.max(goodman, 0);
}

/** Shear fatigue check for compression / extension coil body. */
export function en13906ShearFatigueCheck(params: {
  tauMax: number;
  tauMin: number;
  ultimateStrength: number;
  wireDiameterM: number;
  staticAllowableShear: number;
  lifeClass?: En13906LifeClass;
  loadCycles?: number;
  wireQuality?: En13906WireQuality;
  enabled?: boolean;
}): En13906FatigueResult {
  const enabled = params.enabled ?? params.tauMin !== params.tauMax;
  const lifeClass = params.lifeClass ?? "VL";
  const loadCycles = params.loadCycles ?? EN13906_LIFE_CYCLES[lifeClass];
  const wireQuality = params.wireQuality ?? 1;

  const amplitude = Math.abs(params.tauMax - params.tauMin) / 2;
  const mean = (params.tauMax + params.tauMin) / 2;
  const tauK0 = en13906CharacteristicShearFatigue(
    params.ultimateStrength,
    params.wireDiameterM,
    wireQuality
  );
  const lifeFactor = en13906LifeFactor(loadCycles);
  const allowableAmplitude = allowableAmplitudeGoodman(
    tauK0,
    lifeFactor,
    mean,
    params.staticAllowableShear
  );
  const fatigueSafetyFactor = allowableAmplitude / Math.max(amplitude, 1e-9);
  const fatigueUtilization = amplitude / Math.max(allowableAmplitude, 1e-9);

  return {
    enabled,
    lifeClass,
    loadCycles,
    wireQuality,
    stressAmplitude: amplitude,
    stressMean: mean,
    characteristicFatigueStrength: tauK0,
    lifeFactor,
    allowableAmplitude,
    fatigueSafetyFactor,
    fatigueUtilization,
    fatiguePass: !enabled || fatigueSafetyFactor >= 1,
  };
}

/** Bending fatigue check for torsion springs. */
export function en13906BendingFatigueCheck(params: {
  sigmaMax: number;
  sigmaMin: number;
  ultimateStrength: number;
  wireDiameterM: number;
  staticAllowableBending: number;
  lifeClass?: En13906LifeClass;
  loadCycles?: number;
  wireQuality?: En13906WireQuality;
  enabled?: boolean;
}): En13906FatigueResult {
  const enabled = params.enabled ?? params.sigmaMin !== params.sigmaMax;
  const lifeClass = params.lifeClass ?? "VL";
  const loadCycles = params.loadCycles ?? EN13906_LIFE_CYCLES[lifeClass];
  const wireQuality = params.wireQuality ?? 1;

  const amplitude = Math.abs(params.sigmaMax - params.sigmaMin) / 2;
  const mean = (params.sigmaMax + params.sigmaMin) / 2;
  const sigmaK0 = en13906CharacteristicBendingFatigue(
    params.ultimateStrength,
    params.wireDiameterM,
    wireQuality
  );
  const lifeFactor = en13906LifeFactor(loadCycles);
  const allowableAmplitude = allowableAmplitudeGoodman(
    sigmaK0,
    lifeFactor,
    mean,
    params.staticAllowableBending
  );
  const fatigueSafetyFactor = allowableAmplitude / Math.max(amplitude, 1e-9);
  const fatigueUtilization = amplitude / Math.max(allowableAmplitude, 1e-9);

  return {
    enabled,
    lifeClass,
    loadCycles,
    wireQuality,
    stressAmplitude: amplitude,
    stressMean: mean,
    characteristicFatigueStrength: sigmaK0,
    lifeFactor,
    allowableAmplitude,
    fatigueSafetyFactor,
    fatigueUtilization,
    fatiguePass: !enabled || fatigueSafetyFactor >= 1,
  };
}

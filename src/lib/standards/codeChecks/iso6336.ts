/**
 * ISO 6336 (Method B/C level) cylindrical gear rating for spur gears.
 *
 * Implements the surface durability (ISO 6336-2) and tooth bending
 * (ISO 6336-3) ratings with the standard documented approximations:
 *  - Z_H zone factor for 20° pressure angle spur gears
 *  - Z_E elastic factor from material elasticity
 *  - Z_ε contact ratio factor with the Niemann ε_α approximation
 *  - Y_FS combined form/stress-correction fit (Linke / Roloff-Matek)
 *  - Y_ε helix-free contact ratio factor (ISO 6336-3 Method C)
 *  - K_V dynamic factor (AGMA 2101 transmission accuracy curve, Qv default 7)
 *  - Allowable stress numbers via ISO 6336-5 through-hardened steel fits
 */

export type Iso6336Input = {
  /** Nominal tangential force at the reference circle (N) */
  tangentialForceN: number;
  /** Face width (m) */
  faceWidthM: number;
  /** Normal module (m) */
  moduleM: number;
  /** Pinion teeth */
  z1: number;
  /** Gear teeth */
  z2: number;
  /** Pinion reference diameter (m) */
  pinionDiameterM: number;
  /** Pitch line velocity (m/s) */
  pitchVelocityMs: number;
  /** Young's modulus, both gears assumed same material (Pa) */
  ePa: number;
  /** Poisson's ratio */
  poisson: number;
  /** Estimated ultimate strength for allowable-stress fits (Pa) */
  ultimatePa: number;
  /** Application factor K_A (default 1.25) */
  applicationFactor?: number;
  /** Face load factor K_Hβ (default 1.3) */
  faceLoadFactor?: number;
  /** Transmission accuracy grade Qv for the dynamic factor (default 7) */
  qualityGrade?: number;
};

export type Iso6336Rating = {
  contactStressPa: number;
  allowableContactStressPa: number;
  contactSafetyFactor: number;
  bendingStressPa: number;
  allowableBendingStressPa: number;
  bendingSafetyFactor: number;
  factors: {
    KA: number;
    KV: number;
    KHbeta: number;
    ZH: number;
    ZE: number;
    Zeps: number;
    YFS: number;
    Yeps: number;
    contactRatio: number;
    brinellHardness: number;
  };
};

const PRESSURE_ANGLE_RAD = (20 * Math.PI) / 180;

/** Zone factor Z_H for spur gears (β = 0): √(2/(cos²αt·tanαt)) ≈ 2.495 at 20° */
export function zoneFactorZH(): number {
  const alpha = PRESSURE_ANGLE_RAD;
  return Math.sqrt(2 / (Math.cos(alpha) * Math.sin(alpha)));
}

/** Elastic factor Z_E = √(1/(π·((1−ν₁²)/E₁ + (1−ν₂²)/E₂))) in √Pa */
export function elasticFactorZE(ePa: number, poisson: number): number {
  const compliance = (2 * (1 - poisson * poisson)) / ePa;
  return Math.sqrt(1 / (Math.PI * compliance));
}

/** Niemann approximation for spur transverse contact ratio */
export function approxContactRatio(z1: number, z2: number): number {
  const eps = 1.88 - 3.2 * (1 / z1 + 1 / z2);
  return Math.min(Math.max(eps, 1.1), 1.98);
}

/** Contact ratio factor Z_ε = √((4 − ε_α)/3) for spur gears */
export function contactRatioFactorZeps(contactRatio: number): number {
  return Math.sqrt(Math.max(4 - contactRatio, 0.1) / 3);
}

/** Combined form + stress correction factor fit (x = 0): Y_FS ≈ 3.47 + 13.2/z */
export function formFactorYFS(z: number): number {
  return 3.47 + 13.2 / Math.max(z, 12);
}

/** Contact ratio factor for bending, ISO 6336-3 Method C: Y_ε = 0.25 + 0.75/ε_α */
export function bendingContactRatioFactorYeps(contactRatio: number): number {
  return 0.25 + 0.75 / Math.max(contactRatio, 1);
}

/**
 * Dynamic factor K_V per the AGMA 2101 transmission accuracy curves:
 *   B = 0.25·(A_v − 5)^(2/3), A = 50 + 56·(1 − B), K_V = ((A + √(200·v))/A)^B
 */
export function dynamicFactorKV(pitchVelocityMs: number, qualityGrade = 7): number {
  const qv = Math.min(Math.max(qualityGrade, 5), 11);
  const B = 0.25 * Math.pow(qv - 5, 2 / 3);
  const A = 50 + 56 * (1 - B);
  const v = Math.max(pitchVelocityMs, 0);
  return Math.pow((A + Math.sqrt(200 * v)) / A, B);
}

export function runIso6336Rating(input: Iso6336Input): Iso6336Rating {
  const KA = input.applicationFactor ?? 1.25;
  const KHbeta = input.faceLoadFactor ?? 1.3;
  const KV = dynamicFactorKV(input.pitchVelocityMs, input.qualityGrade);

  const Ft = Math.max(input.tangentialForceN, 0);
  const b = Math.max(input.faceWidthM, 1e-9);
  const m = Math.max(input.moduleM, 1e-9);
  const d1 = Math.max(input.pinionDiameterM, 1e-9);
  const u = Math.max(input.z2 / Math.max(input.z1, 1), 1);

  const contactRatio = approxContactRatio(input.z1, input.z2);
  const ZH = zoneFactorZH();
  const ZE = elasticFactorZE(input.ePa, input.poisson);
  const Zeps = contactRatioFactorZeps(contactRatio);

  // ISO 6336-2: σ_H = Z_H·Z_E·Z_ε·√(Ft/(b·d1)·(u+1)/u·K_A·K_V·K_Hβ)
  const loadIntensity = (Ft / (b * d1)) * ((u + 1) / u) * KA * KV * KHbeta;
  const contactStressPa = ZH * ZE * Zeps * Math.sqrt(loadIntensity);

  // ISO 6336-3: σ_F = Ft/(b·m)·Y_FS·Y_ε·K_A·K_V·K_Fβ (K_Fβ ≈ K_Hβ here)
  const YFS = formFactorYFS(input.z1);
  const Yeps = bendingContactRatioFactorYeps(contactRatio);
  const bendingStressPa = (Ft / (b * m)) * YFS * Yeps * KA * KV * KHbeta;

  // Allowable stress numbers: ISO 6336-5 through-hardened wrought steel (MQ)
  // fits from hardness, HB ≈ Su/3.45 MPa:
  //   σ_H,lim ≈ (2.0·HB + 200) MPa
  //   σ_FE = σ_F,lim·Y_ST ≈ (0.84·HB + 340) MPa  (with Y_ST = 2)
  const brinellHardness = input.ultimatePa / 3.45e6;
  const allowableContactStressPa = (2.0 * brinellHardness + 200) * 1e6;
  const allowableBendingStressPa = (0.84 * brinellHardness + 340) * 1e6;

  return {
    contactStressPa,
    allowableContactStressPa,
    contactSafetyFactor:
      contactStressPa > 0 ? allowableContactStressPa / contactStressPa : 999,
    bendingStressPa,
    allowableBendingStressPa,
    bendingSafetyFactor:
      bendingStressPa > 0 ? allowableBendingStressPa / bendingStressPa : 999,
    factors: {
      KA,
      KV,
      KHbeta,
      ZH,
      ZE,
      Zeps,
      YFS,
      Yeps,
      contactRatio,
      brinellHardness,
    },
  };
}

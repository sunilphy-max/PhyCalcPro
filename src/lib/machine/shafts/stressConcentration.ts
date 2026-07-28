/**
 * Stress concentration factors — Peterson / Shigley approximations for shaft features.
 * Includes theoretical Kt and fatigue Kf via notch sensitivity.
 */

import type { ShaftMaterial, StressFeature, StressFeatureType } from "./types";

/** Bending Kt for round bar shoulder fillet (Shigley Fig. 7-8 curve fit, D/d ≤ 3). */
export function shoulderFilletKtBending(D: number, d: number, r: number): number {
  if (d <= 0 || r <= 0 || D <= d) return 1;
  const tOverR = (D - d) / (2 * r);
  const ratio = D / d;
  const base = 1 + 0.18 * tOverR * Math.pow(ratio, 0.45);
  return Math.min(Math.max(base, 1), 4);
}

/** Torsion Kt for shoulder fillet. */
export function shoulderFilletKtTorsion(D: number, d: number, r: number): number {
  if (d <= 0 || r <= 0 || D <= d) return 1;
  const tOverR = (D - d) / (2 * r);
  const ratio = D / d;
  const base = 1 + 0.12 * tOverR * Math.pow(ratio, 0.35);
  return Math.min(Math.max(base, 1), 3);
}

/** Sled-runner keyway Kt (Shigley Table 7-1). */
export function keywayKtBending(style: "sled_runner" | "end_milled" = "sled_runner"): number {
  return style === "end_milled" ? 2.14 : 1.6;
}

/** Keyway Kt for torsion. */
export function keywayKtTorsion(style: "sled_runner" | "end_milled" = "sled_runner"): number {
  return style === "end_milled" ? 1.62 : 1.3;
}

/**
 * Retaining-ring / snap-ring groove Kt (bending).
 * Shigley-style groove charts: deeper grooves raise Kt.
 */
export function retainingRingGrooveKtBending(d: number, grooveDepth: number, grooveWidth: number): number {
  if (d <= 0 || grooveDepth <= 0) return 1;
  const t = grooveDepth;
  const r = Math.max(grooveWidth / 4, t * 0.1, 1e-6);
  const tOverR = t / r;
  const base = 1.5 + 0.35 * Math.sqrt(tOverR) * Math.pow(d / Math.max(d - 2 * t, 1e-6), 0.4);
  return Math.min(Math.max(base, 1.5), 4);
}

export function retainingRingGrooveKtTorsion(d: number, grooveDepth: number, grooveWidth: number): number {
  const kb = retainingRingGrooveKtBending(d, grooveDepth, grooveWidth);
  return Math.min(Math.max(1 + 0.65 * (kb - 1), 1.2), 3.2);
}

/** Combined von Mises Kt from bending and torsion components. */
export function combinedKt(ktBending: number, ktTorsion: number, bendingStress: number, shearStress: number): number {
  const sigma = Math.max(bendingStress, 1e-12);
  const tau = Math.max(shearStress, 0);
  const vm = Math.sqrt(sigma * sigma + 3 * tau * tau);
  if (vm < 1e-9) return Math.max(ktBending, ktTorsion);
  const kb = ktBending * sigma;
  const kt = ktTorsion * tau;
  const combined = Math.sqrt(kb * kb + 3 * kt * kt);
  return combined / vm;
}

/**
 * Neuber notch sensitivity parameter √a (m) for steel (Shigley / Peterson SI fit).
 * Su in Pa.
 */
export function neuberRootA(ultimateStrengthPa: number): number {
  const suMpa = Math.max(ultimateStrengthPa / 1e6, 200);
  // √a ≈ 0.0254·((2070 MPa)/Su)^1.8  with √a in mm → convert to m
  const sqrtAMm = 0.0254 * Math.pow(2070 / suMpa, 1.8);
  return Math.max(sqrtAMm, 0.05) / 1000;
}

/** Notch sensitivity q = 1 / (1 + √(a/r)). */
export function notchSensitivity(filletRadiusM: number, ultimateStrengthPa: number): number {
  const r = Math.max(filletRadiusM, 1e-6);
  const sqrtA = neuberRootA(ultimateStrengthPa);
  return 1 / (1 + sqrtA / Math.sqrt(r));
}

/** Fatigue stress concentration Kf = 1 + q(Kt − 1). */
export function fatigueConcentrationFactor(kt: number, q: number): number {
  return 1 + Math.min(Math.max(q, 0), 1) * (Math.max(kt, 1) - 1);
}

function featureNotchRadius(feature: StressFeature): number {
  if (feature.type === "shoulder_fillet") {
    return Math.max(feature.filletRadius ?? 0, 1e-6);
  }
  if (feature.type === "retaining_ring") {
    const w = feature.grooveWidth ?? 0;
    const t = feature.grooveDepth ?? 0;
    return Math.max(w / 4, t * 0.1, 0.0002);
  }
  if (feature.type === "keyway") {
    // Typical keyway fillet / corner radius ≈ 0.02·d or 0.25 mm floor
    const d = feature.smallerDiameter ?? feature.largerDiameter ?? 0.05;
    return Math.max(0.02 * d, 0.00025);
  }
  return 0.001;
}

export function resolveFeatureKt(
  feature: StressFeature,
  bendingStress: number,
  shearStress: number,
  shaftDiameter = 0
): number {
  if (feature.type === "custom" && feature.customKt != null) {
    return Math.max(feature.customKt, 1);
  }
  if (feature.type === "shoulder_fillet") {
    const D = feature.largerDiameter ?? 0;
    const d = feature.smallerDiameter ?? 0;
    const r = feature.filletRadius ?? 0;
    const kb = shoulderFilletKtBending(D, d, r);
    const kt = shoulderFilletKtTorsion(D, d, r);
    return combinedKt(kb, kt, bendingStress, shearStress);
  }
  if (feature.type === "keyway") {
    const style = feature.keywayStyle ?? "sled_runner";
    return combinedKt(keywayKtBending(style), keywayKtTorsion(style), bendingStress, shearStress);
  }
  if (feature.type === "retaining_ring") {
    const d = feature.smallerDiameter ?? shaftDiameter;
    const depth = feature.grooveDepth ?? d * 0.03;
    const width = feature.grooveWidth ?? d * 0.04;
    const kb = retainingRingGrooveKtBending(d, depth, width);
    const kt = retainingRingGrooveKtTorsion(d, depth, width);
    return combinedKt(kb, kt, bendingStress, shearStress);
  }
  return 1;
}

export function resolveFeatureKf(
  feature: StressFeature,
  kt: number,
  material: ShaftMaterial,
  useNotchSensitivity: boolean
): number {
  if (!useNotchSensitivity) return Math.max(kt, 1);
  const q = notchSensitivity(featureNotchRadius(feature), material.ultimateStrength);
  return fatigueConcentrationFactor(kt, q);
}

export function buildKtProfile(
  x: number[],
  bendingStress: number[],
  shearStress: number[],
  features: StressFeature[],
  globalKt: number,
  shaftDiameter = 0
): number[] {
  const ktAt = x.map(() => Math.max(globalKt, 1));

  for (const feature of features) {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < x.length; i++) {
      const d = Math.abs(x[i]! - feature.position);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    const localKt = resolveFeatureKt(
      feature,
      bendingStress[nearest] ?? 0,
      shearStress[nearest] ?? 0,
      shaftDiameter
    );
    ktAt[nearest] = Math.max(ktAt[nearest]!, localKt);
  }

  return ktAt;
}

/** Per-node fatigue Kf — features apply notch sensitivity; global Kt uses q≈1 (conservative). */
export function buildKfProfile(
  x: number[],
  ktProfile: number[],
  features: StressFeature[],
  material: ShaftMaterial,
  useNotchSensitivity: boolean,
  globalKt: number
): number[] {
  const kfAt = ktProfile.map((kt) => {
    if (!useNotchSensitivity) return Math.max(kt, 1);
    // Global / unfeatured nodes: mild sensitivity assuming fine fillet
    const q = notchSensitivity(0.001, material.ultimateStrength);
    return fatigueConcentrationFactor(Math.max(kt, globalKt, 1), q);
  });

  for (const feature of features) {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < x.length; i++) {
      const d = Math.abs(x[i]! - feature.position);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    const kt = ktProfile[nearest] ?? 1;
    kfAt[nearest] = Math.max(kfAt[nearest]!, resolveFeatureKf(feature, kt, material, useNotchSensitivity));
  }

  return kfAt;
}

export function featureTypeLabel(type: StressFeatureType): string {
  switch (type) {
    case "shoulder_fillet":
      return "Shoulder fillet";
    case "keyway":
      return "Keyway";
    case "retaining_ring":
      return "Retaining ring groove";
    default:
      return "Custom Kt";
  }
}

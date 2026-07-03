/**
 * Stress concentration factors — Peterson / Shigley approximations for shaft features.
 */

import type { StressFeature, StressFeatureType } from "./types";

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

/** Simplified keyway Kt for bending (Shigley Table 7-1, sled-runner keyway). */
export function keywayKtBending(): number {
  return 1.6;
}

/** Simplified keyway Kt for torsion. */
export function keywayKtTorsion(): number {
  return 1.3;
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

export function resolveFeatureKt(
  feature: StressFeature,
  bendingStress: number,
  shearStress: number
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
    return combinedKt(keywayKtBending(), keywayKtTorsion(), bendingStress, shearStress);
  }
  return 1;
}

export function buildKtProfile(
  x: number[],
  bendingStress: number[],
  shearStress: number[],
  features: StressFeature[],
  globalKt: number
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
    const localKt = resolveFeatureKt(feature, bendingStress[nearest] ?? 0, shearStress[nearest] ?? 0);
    ktAt[nearest] = Math.max(ktAt[nearest]!, localKt);
  }

  return ktAt;
}

export function featureTypeLabel(type: StressFeatureType): string {
  switch (type) {
    case "shoulder_fillet":
      return "Shoulder fillet";
    case "keyway":
      return "Keyway";
    default:
      return "Custom Kt";
  }
}

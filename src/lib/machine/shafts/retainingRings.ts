/**
 * Retaining-ring / circlip groove checks for shaft worksheets.
 * Axial capacity is a screening estimate (ring shear + groove bearing).
 */

import {
  fatigueConcentrationFactor,
  notchSensitivity,
  retainingRingGrooveKtBending,
} from "./stressConcentration";
import type { ShaftMaterial, ShaftRetainingRingCheck, StressFeature } from "./types";

/** Approximate axial retention capacity for an external circlip (N). */
export function retainingRingAxialCapacity(params: {
  shaftDiameter: number;
  grooveDepth: number;
  grooveWidth: number;
  yieldStress: number;
}): number {
  const { shaftDiameter: d, grooveDepth: t, grooveWidth: w, yieldStress } = params;
  if (d <= 0 || t <= 0 || w <= 0) return 0;
  // Bearing on groove shoulder: σ = F / (π d t)  → F = σ_allow · π d t
  const bearingAllow = 1.5 * yieldStress;
  const bearingCap = bearingAllow * Math.PI * d * t;
  // Ring shear (approx rectangular section πd · (0.6 w) · τ_allow)
  const ringThickness = Math.max(w * 0.6, t);
  const shearAllow = 0.5 * yieldStress;
  const shearCap = shearAllow * Math.PI * d * ringThickness * 0.35;
  return Math.min(bearingCap, shearCap);
}

export function evaluateRetainingRingFeatures(
  features: StressFeature[],
  shaftDiameter: number,
  material: ShaftMaterial,
  useNotchSensitivity = true
): ShaftRetainingRingCheck[] {
  return features
    .filter((f) => f.type === "retaining_ring")
    .map((f) => {
      const d = f.smallerDiameter ?? shaftDiameter;
      const grooveDepth = f.grooveDepth ?? d * 0.03;
      const grooveWidth = f.grooveWidth ?? Math.max(d * 0.04, 0.001);
      const kt = retainingRingGrooveKtBending(d, grooveDepth, grooveWidth);
      const q = notchSensitivity(Math.max(grooveWidth / 4, grooveDepth * 0.1, 0.0002), material.ultimateStrength);
      const kf = useNotchSensitivity ? fatigueConcentrationFactor(kt, q) : kt;
      const axialLoad = Math.max(f.axialRetentionLoad ?? 0, 0);
      const axialCapacity = retainingRingAxialCapacity({
        shaftDiameter: d,
        grooveDepth,
        grooveWidth,
        yieldStress: material.yieldStress,
      });
      const safetyFactor = axialLoad > 0 ? axialCapacity / axialLoad : Number.POSITIVE_INFINITY;
      let status: ShaftRetainingRingCheck["status"] = "n/a";
      if (axialLoad > 0) {
        status = safetyFactor >= 2 ? "safe" : safetyFactor >= 1.25 ? "warning" : "critical";
      }
      return {
        position: f.position,
        grooveDepth,
        grooveWidth,
        kt,
        kf,
        axialCapacity,
        axialLoad,
        safetyFactor: Number.isFinite(safetyFactor) ? safetyFactor : 0,
        status,
      };
    });
}

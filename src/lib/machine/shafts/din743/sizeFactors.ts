/**
 * DIN 743-2 size influence factors K1(d), K2(d), K3(d).
 */

import type { Din743HeatTreatment } from "@/data/catalogs/din743/types";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/**
 * Technological size factor K1(deff) for ultimate / fatigue strength.
 * Curve families follow DIN 743-2 / Mesys published forms.
 */
export function technologicalSizeFactorK1(
  deff_mm: number,
  heatTreatment: Din743HeatTreatment,
  forYield = false
): number {
  const d = Math.max(deff_mm, 1);

  if (heatTreatment === "nitrided" || heatTreatment === "normalized") {
    if (forYield) {
      if (d <= 32) return 1;
      if (d <= 300) return clamp(1 - 0.26 * Math.log10((2 * d) / 16), 0.75, 1);
      return 0.75;
    }
    if (d <= 100) return 1;
    if (d <= 300) return clamp(1 - 0.23 * Math.log10(d / 100), 0.89, 1);
    return 0.89;
  }

  if (heatTreatment === "case_hardened") {
    // Cr-Ni-Mo case-hardening family (conservative blank/case-hardened curve)
    if (d <= 16) return 1;
    if (d <= 150) return clamp(1 - 0.41 * Math.log10(d / 16), 0.6, 1);
    return 0.6;
  }

  // quenched_tempered / induction_hardened
  if (forYield) {
    if (d <= 16) return 1;
    if (d <= 300) return clamp(1 - 0.34 * Math.log10(d / 16), 0.57, 1);
    return 0.57;
  }
  if (d <= 16) return 1;
  if (d <= 300) return clamp(1 - 0.26 * Math.log10(d / 16), 0.67, 1);
  return 0.67;
}

/** Geometrical size factor K2(d) — tension/compression = 1; bending/torsion decreases with d. */
export function geometricalSizeFactorK2(d_mm: number, load: "axial" | "bending" | "torsion"): number {
  if (load === "axial") return 1;
  const d = Math.max(d_mm, 7.5);
  if (d <= 7.5) return 1;
  if (d >= 150) return 0.8;
  return 1 - 0.2 * (Math.log10(d / 7.5) / Math.log10(20));
}

/**
 * Geometrical size factor K3 for experimentally determined β scaled to another diameter.
 * K3(d) = 1 − 0.2·log10(α)·log10(d/7.5)/log10(20) for 7.5≤d≤150
 */
export function geometricalSizeFactorK3(d_mm: number, alpha: number, load: "bending" | "torsion"): number {
  const d = Math.max(d_mm, 7.5);
  const a = Math.max(alpha, 1);
  if (d >= 150) {
    return load === "torsion" ? 1 - 0.2 * Math.log10(a) : 0.8;
  }
  return 1 - 0.2 * Math.log10(a) * (Math.log10(d / 7.5) / Math.log10(20));
}

/** Static support enlargement K2F (bending/torsion local plasticity); axial = 1. */
export function staticSupportFactorK2F(d_mm: number, load: "axial" | "bending" | "torsion"): number {
  if (load === "axial") return 1;
  // Mild support for small diameters; approaches 1 for large shafts
  const d = Math.max(d_mm, 1);
  return clamp(1 + 0.15 * Math.exp(-d / 40), 1, 1.2);
}

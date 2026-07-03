/** Preferred solid shaft diameters (mm) — ISO 286 h9 / common stock sizes. */
export const ISO_PREFERRED_SHAFT_DIAMETERS_MM = [
  6, 8, 10, 12, 15, 16, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55, 60, 65, 70, 75,
  80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
];

export function nearestPreferredDiameterMm(requiredMm: number): number {
  for (const d of ISO_PREFERRED_SHAFT_DIAMETERS_MM) {
    if (d >= requiredMm) return d;
  }
  return ISO_PREFERRED_SHAFT_DIAMETERS_MM[ISO_PREFERRED_SHAFT_DIAMETERS_MM.length - 1]!;
}

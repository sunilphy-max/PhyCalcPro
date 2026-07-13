/**
 * Datasheet fatigue load limit Pu helpers.
 * Prefer explicit catalog Pu; fall back to C₀-based SKF-style screening ratios.
 */

import type { CatalogBearingType } from "./types";
import { isRollerBearingType } from "./types";

/**
 * Typical SKF-catalog Pu screening when datasheet Pu is not listed.
 * Uses static rating C₀ (preferred) or dynamic C as fallback.
 * Ball: ≈ 0.04·C₀ · Roller radial: ≈ 0.10·C₀ · Spherical/toroidal: ≈ 0.12·C₀
 */
export function estimateDatasheetFatigueLoadLimitN(params: {
  type: CatalogBearingType;
  dynamicRatingN: number;
  staticRatingN: number;
}): number {
  const { type, dynamicRatingN, staticRatingN } = params;
  const C0 = Math.max(staticRatingN, 1);
  const C = Math.max(dynamicRatingN, 1);

  if (type === "spherical_roller" || type === "toroidal_roller" || type === "thrust_spherical_roller") {
    return Math.round(0.12 * C0);
  }
  if (isRollerBearingType(type)) {
    return Math.round(0.1 * C0);
  }
  // Ball families (incl. thrust ball)
  const fromC0 = 0.04 * C0;
  const fromC = 0.025 * C;
  return Math.round(Math.max(fromC0, fromC * 0.5));
}

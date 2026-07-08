/**
 * Catalog search and ranking for bearing auto-selection.
 */

import type {
  BearingCatalogEntry,
  BearingManufacturer,
  CatalogBearingType,
} from "@/data/catalogs/bearingCatalog";
import { bearingCatalog } from "@/data/catalogs/bearingCatalog";

export type BearingSelectionCriteria = {
  bearingType: CatalogBearingType;
  requiredDynamicRatingN: number;
  requiredStaticRatingN?: number;
  speedRpm: number;
  /** Limit search to one manufacturer (e.g. SKF, NSK) */
  manufacturer?: BearingManufacturer;
  /** Maximum bore (mm) from shaft diameter */
  boreMaxMm?: number;
  /** Maximum outside diameter (mm) */
  outerMaxMm?: number;
  /** Minimum bore (mm) */
  boreMinMm?: number;
};

export type RankedBearing = {
  entry: BearingCatalogEntry;
  dynamicUtilization: number;
  staticUtilization: number;
  speedMargin: number;
  passes: boolean;
};

export function rankCatalogBearings(criteria: BearingSelectionCriteria): RankedBearing[] {
  const {
    bearingType,
    requiredDynamicRatingN,
    requiredStaticRatingN = 0,
    speedRpm,
    manufacturer,
    boreMaxMm,
    outerMaxMm,
    boreMinMm,
  } = criteria;

  return bearingCatalog
    .filter((b) => b.type === bearingType)
    .filter((b) => manufacturer == null || b.manufacturer === manufacturer)
    .filter((b) => (boreMaxMm == null || b.boreMm <= boreMaxMm + 0.01))
    .filter((b) => (boreMinMm == null || b.boreMm >= boreMinMm - 0.01))
    .filter((b) => (outerMaxMm == null || b.outerDiameterMm <= outerMaxMm + 0.01))
    .map((entry) => {
      const dynamicUtilization = requiredDynamicRatingN / Math.max(entry.dynamicRatingN, 1);
      const staticUtilization =
        requiredStaticRatingN > 0
          ? requiredStaticRatingN / Math.max(entry.staticRatingN, 1)
          : 0;
      const speedMargin = entry.limitingSpeedRpm / Math.max(speedRpm, 1);
      const passes =
        dynamicUtilization <= 1 &&
        (requiredStaticRatingN <= 0 || staticUtilization <= 1) &&
        speedMargin >= 1;

      return { entry, dynamicUtilization, staticUtilization, speedMargin, passes };
    })
    .sort((a, b) => a.dynamicUtilization - b.dynamicUtilization);
}

export function bestCatalogBearing(criteria: BearingSelectionCriteria): RankedBearing | null {
  const ranked = rankCatalogBearings(criteria);
  return ranked.find((r) => r.passes) ?? ranked[0] ?? null;
}

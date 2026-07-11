/**
 * Catalog search and ranking for bearing auto-selection.
 */

import type {
  BearingCatalogEntry,
  BearingManufacturer,
  CatalogBearingType,
  BearingApplicationProfile,
  BearingSealType,
  BearingMountingRole,
} from "@/data/catalogs/bearingCatalog";
import { bearingCatalog, filterCatalog } from "@/data/catalogs/bearingCatalog";

export type BearingSelectionCriteria = {
  bearingType: CatalogBearingType;
  requiredDynamicRatingN: number;
  requiredStaticRatingN?: number;
  speedRpm: number;
  manufacturer?: BearingManufacturer;
  applicationProfile?: BearingApplicationProfile | "all";
  series?: string | "all";
  sealType?: BearingSealType | "all";
  mountingRole?: BearingMountingRole | "all";
  boreMaxMm?: number;
  outerMaxMm?: number;
  widthMaxMm?: number;
  boreMinMm?: number;
};

export type RankedBearing = {
  entry: BearingCatalogEntry;
  dynamicUtilization: number;
  staticUtilization: number;
  speedMargin: number;
  passes: boolean;
};

function catalogPool(criteria: BearingSelectionCriteria): BearingCatalogEntry[] {
  return filterCatalog(bearingCatalog, {
    manufacturer: criteria.manufacturer,
    type: criteria.bearingType,
    applicationProfile: criteria.applicationProfile,
    series: criteria.series,
    sealType: criteria.sealType,
    mountingRole: criteria.mountingRole,
  });
}

export function rankCatalogBearings(criteria: BearingSelectionCriteria): RankedBearing[] {
  const {
    requiredDynamicRatingN,
    requiredStaticRatingN = 0,
    speedRpm,
    boreMaxMm,
    outerMaxMm,
    widthMaxMm,
    boreMinMm,
  } = criteria;

  return catalogPool(criteria)
    .filter((b) => (boreMaxMm == null || b.boreMm <= boreMaxMm + 0.01))
    .filter((b) => (boreMinMm == null || b.boreMm >= boreMinMm - 0.01))
    .filter((b) => (outerMaxMm == null || b.outerDiameterMm <= outerMaxMm + 0.01))
    .filter((b) => (widthMaxMm == null || b.widthMm <= widthMaxMm + 0.01))
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
    .sort((a, b) => {
      if (a.passes !== b.passes) return a.passes ? -1 : 1;
      const util = a.dynamicUtilization - b.dynamicUtilization;
      if (Math.abs(util) > 1e-6) return util;
      return (a.entry.costIndex ?? 1) - (b.entry.costIndex ?? 1);
    });
}

export function bestCatalogBearing(criteria: BearingSelectionCriteria): RankedBearing | null {
  const ranked = rankCatalogBearings(criteria);
  return ranked.find((r) => r.passes) ?? ranked[0] ?? null;
}

/**
 * Cross-manufacturer catalog equivalence and ranking.
 */

import type { BearingCatalogEntry, BearingManufacturer, BearingSealType } from "@/data/catalogs/bearingCatalog";
import { bearingCatalog } from "@/data/catalogs/bearingCatalog";
import {
  rankCatalogBearings,
  type BearingSelectionCriteria,
  type RankedBearing,
} from "@/lib/machine/bearings/catalogSelection";
import type { ContaminationLevel } from "./iso281Life";
import type { BearingResult } from "./types";
import {
  explainBearingRecommendation,
  type RecommendationAdvisor,
} from "./recommendationAdvisor";

export type CrossManufacturerRecommendation = {
  primary: RankedBearing | null;
  alternatives: RankedBearing[];
  equivalents: BearingCatalogEntry[];
  /** Engineering Advisor — why this pick (deterministic). */
  advisor?: RecommendationAdvisor;
};

export type RecommendationDutyContext = {
  result: BearingResult;
  radialLoadN: number;
  axialLoadN: number;
  requiredLifeHours: number;
  contamination?: ContaminationLevel;
  sealFilter?: BearingSealType | "all";
  preferredManufacturer?: BearingManufacturer;
};


/** All catalog entries matching the same ISO size, type, and seal. */
export function equivalentCatalogEntries(entry: BearingCatalogEntry): BearingCatalogEntry[] {
  const key = entry.isoSize ?? entry.designation;
  return bearingCatalog
    .filter(
      (b) =>
        b.type === entry.type &&
        b.boreMm === entry.boreMm &&
        b.outerDiameterMm === entry.outerDiameterMm &&
        b.sealType === entry.sealType &&
        (b.isoSize === key || b.series === entry.series)
    )
    .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
}

/** Best passing option per OEM for the same duty criteria. */
export function rankCrossManufacturerAlternatives(
  criteria: BearingSelectionCriteria
): RankedBearing[] {
  const manufacturers: BearingManufacturer[] = ["SKF", "FAG", "NSK", "NTN", "TIMKEN"];
  const preferred = criteria.manufacturer;
  const ordered = preferred
    ? [preferred, ...manufacturers.filter((m) => m !== preferred)]
    : manufacturers;
  const bestPerMfr: RankedBearing[] = [];

  for (const mfr of ordered) {
    const ranked = rankCatalogBearings({ ...criteria, manufacturer: mfr });
    const best = ranked.find((r) => r.passes) ?? ranked[0];
    if (best) bestPerMfr.push(best);
  }

  // Prefer the user's manufacturer as primary when it passes; otherwise best utilization.
  const preferredRow = preferred
    ? bestPerMfr.find((r) => r.entry.manufacturer === preferred && r.passes)
    : undefined;
  if (preferredRow) {
    return [preferredRow, ...bestPerMfr.filter((r) => r !== preferredRow)];
  }

  return bestPerMfr.sort((a, b) => a.dynamicUtilization - b.dynamicUtilization);
}

export function buildCrossManufacturerRecommendation(
  criteria: BearingSelectionCriteria,
  selectedDesignation?: string,
  duty?: RecommendationDutyContext
): CrossManufacturerRecommendation {
  const ranked = rankCrossManufacturerAlternatives(criteria);
  let primary = ranked[0] ?? null;

  let equivalents: BearingCatalogEntry[] = [];
  if (selectedDesignation) {
    const current =
      bearingCatalog.find((b) => b.designation === selectedDesignation) ??
      bearingCatalog.find(
        (b) =>
          b.isoSize != null &&
          selectedDesignation.replace(/[\s\-]/g, "").toUpperCase() ===
            b.isoSize.replace(/[\s\-]/g, "").toUpperCase()
      );
    if (current) {
      equivalents = equivalentCatalogEntries(current);
      // Keep selected designation as primary when it is in the ranked set.
      const selectedRanked = ranked.find((r) => r.entry.designation === current.designation);
      if (selectedRanked) primary = selectedRanked;
    }
  } else if (primary) {
    equivalents = equivalentCatalogEntries(primary.entry);
  }

  const alternatives = ranked.filter((r) => r.entry.designation !== primary?.entry.designation);

  let advisor: RecommendationAdvisor | undefined;
  if (primary && duty) {
    advisor = explainBearingRecommendation({
      primary,
      alternatives,
      result: duty.result,
      radialLoadN: duty.radialLoadN,
      axialLoadN: duty.axialLoadN,
      requiredLifeHours: duty.requiredLifeHours,
      contamination: duty.contamination,
      sealFilter: duty.sealFilter,
      preferredManufacturer: duty.preferredManufacturer,
    });
  }

  return { primary, alternatives, equivalents, advisor };
}

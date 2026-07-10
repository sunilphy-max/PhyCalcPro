/**
 * Cross-manufacturer catalog equivalence and ranking.
 */

import type { BearingCatalogEntry, BearingManufacturer } from "@/data/catalogs/bearingCatalog";
import { bearingCatalog } from "@/data/catalogs/bearingCatalog";
import {
  rankCatalogBearings,
  type BearingSelectionCriteria,
  type RankedBearing,
} from "@/lib/machine/bearings/catalogSelection";

export type CrossManufacturerRecommendation = {
  primary: RankedBearing | null;
  alternatives: RankedBearing[];
  equivalents: BearingCatalogEntry[];
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
  const bestPerMfr: RankedBearing[] = [];

  for (const mfr of manufacturers) {
    const ranked = rankCatalogBearings({ ...criteria, manufacturer: mfr });
    const best = ranked.find((r) => r.passes) ?? ranked[0];
    if (best) bestPerMfr.push(best);
  }

  return bestPerMfr.sort((a, b) => a.dynamicUtilization - b.dynamicUtilization);
}

export function buildCrossManufacturerRecommendation(
  criteria: BearingSelectionCriteria,
  selectedDesignation?: string
): CrossManufacturerRecommendation {
  const ranked = rankCrossManufacturerAlternatives(criteria);
  const primary = ranked[0] ?? null;

  let equivalents: BearingCatalogEntry[] = [];
  if (selectedDesignation) {
    const current = bearingCatalog.find((b) => b.designation === selectedDesignation);
    if (current) equivalents = equivalentCatalogEntries(current);
  } else if (primary) {
    equivalents = equivalentCatalogEntries(primary.entry);
  }

  const alternatives = ranked.slice(1);

  return { primary, alternatives, equivalents };
}

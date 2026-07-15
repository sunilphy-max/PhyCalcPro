/**
 * Cross-OEM interchange screening — same bore/type/C-class neighbors.
 */

import type { BearingCatalogEntry } from "@/data/catalogs/bearingCatalog";
import { bearingCatalog } from "@/data/catalogs/bearingCatalog";

export type InterchangeCandidate = {
  entry: BearingCatalogEntry;
  deltaCPercent: number;
  deltaC0Percent: number;
  sameSeal: boolean;
  sameClearance: boolean;
  notes: string[];
};

/**
 * Candidates sharing bore + type with comparable dynamic capacity (within ±25%).
 * Excludes the source designation.
 */
export function buildInterchangeCandidates(
  source: BearingCatalogEntry,
  opts?: { maxDeltaCPercent?: number; limit?: number }
): InterchangeCandidate[] {
  const maxDelta = opts?.maxDeltaCPercent ?? 25;
  const limit = opts?.limit ?? 12;
  const C = Math.max(source.dynamicRatingN, 1);
  const C0 = Math.max(source.staticRatingN, 1);

  const rows: InterchangeCandidate[] = [];
  for (const b of bearingCatalog) {
    if (b.designation === source.designation) continue;
    if (b.type !== source.type) continue;
    if (b.boreMm !== source.boreMm) continue;
    const deltaC = ((b.dynamicRatingN - C) / C) * 100;
    if (Math.abs(deltaC) > maxDelta) continue;
    const deltaC0 = ((b.staticRatingN - C0) / C0) * 100;
    const notes: string[] = [];
    if (b.manufacturer !== source.manufacturer) {
      notes.push(`OEM ${b.manufacturer}`);
    }
    if (b.sealType !== source.sealType) notes.push(`Seal ${b.sealType} vs ${source.sealType}`);
    if (b.clearance !== source.clearance) {
      notes.push(`Clearance ${b.clearance} vs ${source.clearance}`);
    }
    if (Math.abs(b.outerDiameterMm - source.outerDiameterMm) > 0.05) {
      notes.push(`OD ${b.outerDiameterMm} vs ${source.outerDiameterMm} mm`);
    }
    rows.push({
      entry: b,
      deltaCPercent: deltaC,
      deltaC0Percent: deltaC0,
      sameSeal: b.sealType === source.sealType,
      sameClearance: b.clearance === source.clearance,
      notes,
    });
  }

  return rows
    .sort((a, b) => Math.abs(a.deltaCPercent) - Math.abs(b.deltaCPercent))
    .slice(0, limit);
}

/**
 * Catalog bearing selection + ISO 281 basic L10 for shaft worksheet in-flow.
 */

import type { BearingCatalogEntry, CatalogBearingType } from "@/data/catalogs/bearingCatalog";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import {
  bestCatalogBearing,
  rankCatalogBearings,
  type RankedBearing,
} from "@/lib/machine/bearings/catalogSelection";
import { lifeExponentFor } from "@/lib/machine/bearings/equivalentLoad";
import type { ShaftBearingLifeScreen } from "./types";
import { basicL10Hours } from "./bearingLifeScreen";

export type ShaftCatalogBearingPick = {
  /** Support position in SI meters (matches FEM reactions) */
  positionM: number;
  designation: string;
};

export type ShaftCatalogLifeRow = ShaftBearingLifeScreen & {
  designation: string | null;
  catalogC: number | null;
  catalogC0: number | null;
  boreMm: number | null;
  limitingSpeedRpm: number | null;
  catalogL10Hours: number | null;
  ranked: RankedBearing[];
  recommended: RankedBearing | null;
};

const BORE_TOLERANCE_MM = 2;

export function suggestCatalogForScreen(params: {
  screen: ShaftBearingLifeScreen;
  shaftDiameterM: number;
  operatingRpm: number;
  bearingType?: CatalogBearingType;
  limit?: number;
}): { ranked: RankedBearing[]; recommended: RankedBearing | null } {
  const boreMm = params.shaftDiameterM * 1000;
  const ranked = rankCatalogBearings({
    bearingType: params.bearingType ?? "deep_groove",
    requiredDynamicRatingN: Math.max(params.screen.requiredDynamicRating, 1),
    speedRpm: Math.max(params.operatingRpm, 1),
    boreMinMm: boreMm - BORE_TOLERANCE_MM,
    boreMaxMm: boreMm + BORE_TOLERANCE_MM,
  }).slice(0, params.limit ?? 12);

  // If nothing in tight bore band, widen search
  const pool =
    ranked.length > 0
      ? ranked
      : rankCatalogBearings({
          bearingType: params.bearingType ?? "deep_groove",
          requiredDynamicRatingN: Math.max(params.screen.requiredDynamicRating, 1),
          speedRpm: Math.max(params.operatingRpm, 1),
          boreMinMm: boreMm * 0.85,
          boreMaxMm: boreMm * 1.25,
        }).slice(0, params.limit ?? 12);

  const recommended =
    bestCatalogBearing({
      bearingType: params.bearingType ?? "deep_groove",
      requiredDynamicRatingN: Math.max(params.screen.requiredDynamicRating, 1),
      speedRpm: Math.max(params.operatingRpm, 1),
      boreMinMm: boreMm - BORE_TOLERANCE_MM,
      boreMaxMm: boreMm + BORE_TOLERANCE_MM,
    }) ??
    pool.find((r) => r.passes) ??
    pool[0] ??
    null;

  return { ranked: pool, recommended };
}

export function catalogL10FromEntry(params: {
  entry: BearingCatalogEntry;
  radialForceN: number;
  operatingRpm: number;
}): number {
  return basicL10Hours({
    dynamicRatingN: params.entry.dynamicRatingN,
    radialForceN: params.radialForceN,
    speedRpm: params.operatingRpm,
    lifeExponent: lifeExponentFor(params.entry.type),
  });
}

export function buildShaftCatalogLifeRows(params: {
  screens: ShaftBearingLifeScreen[];
  picks: ShaftCatalogBearingPick[];
  shaftDiameterM: number;
  operatingRpm: number;
  bearingType?: CatalogBearingType;
}): ShaftCatalogLifeRow[] {
  return params.screens.map((screen) => {
    const { ranked, recommended } = suggestCatalogForScreen({
      screen,
      shaftDiameterM: params.shaftDiameterM,
      operatingRpm: params.operatingRpm,
      bearingType: params.bearingType,
    });

    const pick = params.picks.find(
      (p) => Math.abs(p.positionM - screen.position) < 1e-6
    );
    const entry = pick?.designation
      ? findBearing(pick.designation) ??
        ranked.find((r) => r.entry.designation === pick.designation)?.entry ??
        null
      : null;

    const active = entry ?? null;
    const catalogL10Hours =
      active && params.operatingRpm > 0 && screen.radialForce > 0
        ? catalogL10FromEntry({
            entry: active,
            radialForceN: screen.radialForce,
            operatingRpm: params.operatingRpm,
          })
        : null;

    const target = screen.targetLifeHours;
    let status = screen.status;
    if (catalogL10Hours != null) {
      status =
        catalogL10Hours >= target
          ? "safe"
          : catalogL10Hours >= target * 0.5
            ? "warning"
            : "critical";
    }

    return {
      ...screen,
      status,
      designation: active?.designation ?? null,
      catalogC: active?.dynamicRatingN ?? null,
      catalogC0: active?.staticRatingN ?? null,
      boreMm: active?.boreMm ?? null,
      limitingSpeedRpm: active?.limitingSpeedRpm ?? null,
      catalogL10Hours,
      estimatedL10Hours: catalogL10Hours ?? screen.estimatedL10Hours,
      estimatedDynamicRating: active?.dynamicRatingN ?? screen.estimatedDynamicRating,
      ranked,
      recommended,
    };
  });
}

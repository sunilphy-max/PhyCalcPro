/**
 * Build expanded multi-manufacturer bearing catalog from series templates.
 */

import { ALL_SERIES_TEMPLATES } from "./seriesData";
import {
  cageTypeForFamily,
  estimateBearingMassKg,
  formatOemDesignation,
} from "./manufacturerDesignations";
import type {
  BearingCatalogEntry,
  BearingManufacturer,
  SeriesTemplate,
} from "./types";
import { BEARING_MANUFACTURERS } from "./types";

const MANUFACTURER_FACTORS: Record<
  BearingManufacturer,
  { dynamic: number; static: number; speed: number }
> = {
  SKF: { dynamic: 1, static: 1, speed: 1 },
  FAG: { dynamic: 0.98, static: 0.98, speed: 0.98 },
  NSK: { dynamic: 1, static: 1, speed: 1 },
  TIMKEN: { dynamic: 0.97, static: 0.97, speed: 0.96 },
  NTN: { dynamic: 0.99, static: 0.99, speed: 1 },
};

function formatDesignation(manufacturer: BearingManufacturer, template: SeriesTemplate): string {
  return formatOemDesignation(manufacturer, template);
}

function isoSizeKey(template: SeriesTemplate): string {
  return template.seriesDesignation.replace(/\s+B$/i, "").replace(/-2RS$/i, "").trim();
}

function scaleRating(value: number, factor: number): number {
  return Math.round(value * factor);
}

function templateToEntry(
  template: SeriesTemplate,
  manufacturer: BearingManufacturer
): BearingCatalogEntry {
  const factors = MANUFACTURER_FACTORS[manufacturer];
  return {
    designation: formatDesignation(manufacturer, template),
    type: template.type,
    family: template.family,
    manufacturer,
    series: template.series,
    dimensionSeries: template.dimensionSeries,
    sealType: template.sealType ?? "open",
    clearance: template.clearance ?? "CN",
    mountingRole: template.mountingRole ?? "either",
    applicationTags: template.applicationTags ?? ["general_radial"],
    boreMm: template.boreMm,
    outerDiameterMm: template.outerDiameterMm,
    widthMm: template.widthMm,
    dynamicRatingN: scaleRating(template.dynamicRatingN, factors.dynamic),
    staticRatingN: scaleRating(template.staticRatingN, factors.static),
    limitingSpeedRpm: scaleRating(template.limitingSpeedRpm, factors.speed),
    referenceSpeedRpm: template.referenceSpeedRpm
      ? scaleRating(template.referenceSpeedRpm, factors.speed)
      : undefined,
    isoSize: isoSizeKey(template),
    massKg: estimateBearingMassKg(template.boreMm, template.outerDiameterMm, template.widthMm),
    cageType: cageTypeForFamily(template.family),
    catalogFactors: template.catalogFactors,
  };
}

function expandTemplate(template: SeriesTemplate): BearingCatalogEntry[] {
  const manufacturers = template.manufacturers ?? BEARING_MANUFACTURERS;
  return manufacturers.map((mfr) => templateToEntry(template, mfr));
}

export const bearingCatalog: BearingCatalogEntry[] = ALL_SERIES_TEMPLATES.flatMap(expandTemplate);

/** Normalize OEM strings for fuzzy lookup (spaces, hyphens, case). */
export function normalizeDesignationKey(designation: string): string {
  return designation
    .toUpperCase()
    .replace(/[\s\-_/]/g, "")
    .replace(/2RS1$/i, "2RS")
    .replace(/2RSR$/i, "2RS")
    .replace(/DDU$/i, "2RS")
    .replace(/LLU$/i, "2RS");
}

/**
 * Find a catalog entry by exact designation, then normalized OEM variants
 * (e.g. "6205", "6205-2RS1", "7205 B" / "7205B").
 */
export function findBearing(designation: string): BearingCatalogEntry | undefined {
  if (!designation.trim()) return undefined;
  const exact = bearingCatalog.find((b) => b.designation === designation);
  if (exact) return exact;

  const key = normalizeDesignationKey(designation);
  const byNorm = bearingCatalog.find((b) => normalizeDesignationKey(b.designation) === key);
  if (byNorm) return byNorm;

  const byIso = bearingCatalog.find(
    (b) => b.isoSize != null && normalizeDesignationKey(b.isoSize) === key
  );
  if (byIso) return byIso;

  // Prefix match for short ISO sizes like "6205" → first open SKF 6205
  if (key.length >= 4) {
    const prefix = bearingCatalog.find(
      (b) =>
        normalizeDesignationKey(b.designation).startsWith(key) ||
        (b.isoSize != null && normalizeDesignationKey(b.isoSize) === key)
    );
    if (prefix) return prefix;
  }

  return undefined;
}

export function catalogTierToManufacturer(
  tier: import("./types").BearingCatalogTier
): BearingManufacturer {
  const map = {
    skf_metric: "SKF" as const,
    inch: "TIMKEN" as const,
    ina_fag: "FAG" as const,
  };
  return map[tier];
}

export function bearingsOfManufacturer(manufacturer: BearingManufacturer): BearingCatalogEntry[] {
  return bearingCatalog.filter((b) => b.manufacturer === manufacturer);
}

export function bearingsOfType(
  type: import("./types").CatalogBearingType,
  manufacturer?: BearingManufacturer
): BearingCatalogEntry[] {
  const pool = manufacturer ? bearingsOfManufacturer(manufacturer) : bearingCatalog;
  return pool.filter((b) => b.type === type);
}

export function equivalentDesignation(
  designation: string,
  targetManufacturer: BearingManufacturer
): string | undefined {
  const current = findBearing(designation);
  if (!current) return undefined;

  const sameSpec = bearingsOfManufacturer(targetManufacturer).filter(
    (b) =>
      b.type === current.type &&
      b.series === current.series &&
      Math.abs(b.boreMm - current.boreMm) < 0.01 &&
      b.sealType === current.sealType
  );
  if (sameSpec.length) return sameSpec[0]!.designation;

  const sameBore = bearingsOfType(current.type, targetManufacturer).filter(
    (b) => Math.abs(b.boreMm - current.boreMm) < 0.01
  );
  if (sameBore.length) return sameBore[0]!.designation;

  const candidates = bearingsOfType(current.type, targetManufacturer);
  return candidates[0]?.designation;
}

/** @deprecated Use entry.manufacturer */
export function catalogSource(entry: BearingCatalogEntry): BearingManufacturer {
  return entry.manufacturer;
}

/** @deprecated Use bearingsOfManufacturer */
export function bearingsOfTier(tier: import("./types").BearingCatalogTier): BearingCatalogEntry[] {
  return bearingsOfManufacturer(catalogTierToManufacturer(tier));
}

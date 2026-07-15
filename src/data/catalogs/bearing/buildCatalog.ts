/**
 * Build expanded multi-manufacturer bearing catalog from series templates.
 */

import { ALL_SERIES_TEMPLATES } from "./seriesData";
import { estimateDatasheetFatigueLoadLimitN } from "./fatigueLoadLimit";
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

function resolveFatigueLoadLimit(
  template: SeriesTemplate,
  scaledDynamicN: number,
  scaledStaticN: number,
  factors: { dynamic: number; static: number }
): {
  pu: number;
  fromDatasheet: boolean;
  puSource: "datasheet" | "c0_ratio" | "c_ratio";
} {
  const source = template.puSource ?? (template.fatigueLoadLimitN != null ? "datasheet" : "c0_ratio");
  if (template.fatigueLoadLimitN != null && template.fatigueLoadLimitN > 0) {
    const fromDatasheet = source === "datasheet";
    return {
      // Scale authored Pu with OEM static factor (tracks material capacity).
      pu: scaleRating(template.fatigueLoadLimitN, factors.static),
      fromDatasheet,
      puSource: source,
    };
  }
  return {
    pu: estimateDatasheetFatigueLoadLimitN({
      type: template.type,
      dynamicRatingN: scaledDynamicN,
      staticRatingN: scaledStaticN,
    }),
    fromDatasheet: false,
    puSource: "c0_ratio",
  };
}

function templateToEntry(
  template: SeriesTemplate,
  manufacturer: BearingManufacturer
): BearingCatalogEntry {
  const factors = MANUFACTURER_FACTORS[manufacturer];
  const dynamicRatingN = scaleRating(template.dynamicRatingN, factors.dynamic);
  const staticRatingN = scaleRating(template.staticRatingN, factors.static);
  const { pu, fromDatasheet, puSource } = resolveFatigueLoadLimit(
    template,
    dynamicRatingN,
    staticRatingN,
    factors
  );
  const unitSystem = template.unitSystem ?? (template.dimensionSeries === "inch" ? "inch" : "metric");
  const mmToIn = 1 / 25.4;

  return {
    designation: formatDesignation(manufacturer, template),
    type: template.type,
    family: template.family,
    manufacturer,
    series: template.series,
    dimensionSeries: template.dimensionSeries,
    unitSystem,
    sealType: template.sealType ?? "open",
    clearance: template.clearance ?? "CN",
    mountingRole: template.mountingRole ?? "either",
    applicationTags: template.applicationTags ?? ["general_radial"],
    boreMm: template.boreMm,
    outerDiameterMm: template.outerDiameterMm,
    widthMm: template.widthMm,
    boreIn: unitSystem === "inch" ? Math.round(template.boreMm * mmToIn * 1000) / 1000 : undefined,
    outerDiameterIn:
      unitSystem === "inch" ? Math.round(template.outerDiameterMm * mmToIn * 1000) / 1000 : undefined,
    widthIn: unitSystem === "inch" ? Math.round(template.widthMm * mmToIn * 1000) / 1000 : undefined,
    dynamicRatingN,
    staticRatingN,
    limitingSpeedRpm: scaleRating(template.limitingSpeedRpm, factors.speed),
    referenceSpeedRpm: template.referenceSpeedRpm
      ? scaleRating(template.referenceSpeedRpm, factors.speed)
      : undefined,
    isoSize: isoSizeKey(template),
    massKg: estimateBearingMassKg(template.boreMm, template.outerDiameterMm, template.widthMm),
    cageType: cageTypeForFamily(template.family),
    costIndex: estimateCostIndex(template, manufacturer),
    fatigueLoadLimitN: pu,
    fatigueLoadLimitFromDatasheet: fromDatasheet,
    puSource,
    contactAngleDeg: template.contactAngleDeg,
    catalogFactors: template.catalogFactors,
  };
}

function estimateCostIndex(
  template: SeriesTemplate,
  manufacturer: BearingManufacturer
): number {
  let cost = 1;
  if (template.sealType === "sealed" || template.sealType === "contact_sealed") cost *= 1.25;
  if (template.sealType === "shielded") cost *= 1.1;
  if (template.type === "angular_contact") cost *= 1.35;
  if (template.type === "tapered_roller") cost *= 1.2;
  if (template.type === "spherical_roller") cost *= 1.8;
  if (template.type === "toroidal_roller") cost *= 1.9;
  if (template.type === "needle_roller") cost *= 0.85;
  if (template.type === "thrust_cylindrical_roller") cost *= 1.3;
  if (template.type === "thrust_spherical_roller") cost *= 1.7;
  if (template.unitSystem === "inch" || template.dimensionSeries === "inch") cost *= 1.05;
  if (manufacturer === "TIMKEN") cost *= 1.05;
  if (manufacturer === "SKF") cost *= 1.08;
  return Math.round(cost * 100) / 100;
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

export function bearingsOfUnitSystem(
  unitSystem: import("./types").BearingUnitSystem,
  manufacturer?: BearingManufacturer
): BearingCatalogEntry[] {
  const pool = manufacturer ? bearingsOfManufacturer(manufacturer) : bearingCatalog;
  return pool.filter((b) => b.unitSystem === unitSystem);
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

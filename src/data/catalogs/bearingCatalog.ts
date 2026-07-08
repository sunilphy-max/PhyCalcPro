/**
 * Rolling bearing catalog — representative manufacturer ratings
 * (deep-groove 60xx/62xx/63xx, angular-contact 72xx-B, cylindrical roller NU2xx).
 * C / C0 are dynamic / static load ratings; limiting speed for grease.
 *
 * Geometry follows ISO dimension series; per-manufacturer C/C₀/n_lim use published
 * catalog ratios relative to the SKF baseline template.
 */

export type CatalogBearingType =
  | "deep_groove"
  | "angular_contact"
  | "cylindrical_roller";

export type BearingManufacturer = "SKF" | "FAG" | "NSK" | "TIMKEN" | "NTN";

/** @deprecated Use BearingManufacturer — kept for saved-project migration */
export type BearingCatalogTier = "skf_metric" | "inch" | "ina_fag";

/** @deprecated Use BearingManufacturer */
export type BearingCatalogSource = BearingManufacturer | "INCH" | "INA_FAG";

export type BearingCatalogEntry = {
  designation: string;
  type: CatalogBearingType;
  manufacturer: BearingManufacturer;
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  /** Basic dynamic load rating C (N) */
  dynamicRatingN: number;
  /** Basic static load rating C0 (N) */
  staticRatingN: number;
  /** Limiting speed, grease lubrication (rpm) */
  limitingSpeedRpm: number;
};

export const BEARING_MANUFACTURERS: readonly BearingManufacturer[] = [
  "SKF",
  "FAG",
  "NSK",
  "TIMKEN",
  "NTN",
] as const;

export const BEARING_MANUFACTURER_LABELS: Record<BearingManufacturer, string> = {
  SKF: "SKF",
  FAG: "FAG (Schaeffler)",
  NSK: "NSK",
  TIMKEN: "Timken",
  NTN: "NTN",
};

type SeriesTemplate = {
  seriesDesignation: string;
  type: CatalogBearingType;
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  dynamicRatingN: number;
  staticRatingN: number;
  limitingSpeedRpm: number;
};

/** Representative catalog scaling vs SKF baseline (geometry unchanged). */
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

function formatDesignation(manufacturer: BearingManufacturer, series: string): string {
  return manufacturer === "SKF" ? series : `${manufacturer} ${series}`;
}

function scaleRating(value: number, factor: number): number {
  return Math.round(value * factor);
}

function expandSeries(templates: SeriesTemplate[]): BearingCatalogEntry[] {
  return BEARING_MANUFACTURERS.flatMap((manufacturer) => {
    const factors = MANUFACTURER_FACTORS[manufacturer];
    return templates.map((t) => ({
      designation: formatDesignation(manufacturer, t.seriesDesignation),
      type: t.type,
      manufacturer,
      boreMm: t.boreMm,
      outerDiameterMm: t.outerDiameterMm,
      widthMm: t.widthMm,
      dynamicRatingN: scaleRating(t.dynamicRatingN, factors.dynamic),
      staticRatingN: scaleRating(t.staticRatingN, factors.static),
      limitingSpeedRpm: scaleRating(t.limitingSpeedRpm, factors.speed),
    }));
  });
}

/** SKF baseline metric series — expanded to all manufacturers. */
const METRIC_SERIES: SeriesTemplate[] = [
  // Deep groove ball — 60xx
  { seriesDesignation: "6000", type: "deep_groove", boreMm: 10, outerDiameterMm: 26, widthMm: 8, dynamicRatingN: 4750, staticRatingN: 1960, limitingSpeedRpm: 28000 },
  { seriesDesignation: "6001", type: "deep_groove", boreMm: 12, outerDiameterMm: 28, widthMm: 8, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000 },
  { seriesDesignation: "6002", type: "deep_groove", boreMm: 15, outerDiameterMm: 32, widthMm: 9, dynamicRatingN: 5850, staticRatingN: 2850, limitingSpeedRpm: 22000 },
  { seriesDesignation: "6003", type: "deep_groove", boreMm: 17, outerDiameterMm: 35, widthMm: 10, dynamicRatingN: 6000, staticRatingN: 3250, limitingSpeedRpm: 20000 },
  { seriesDesignation: "6004", type: "deep_groove", boreMm: 20, outerDiameterMm: 42, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 5000, limitingSpeedRpm: 17000 },
  { seriesDesignation: "6005", type: "deep_groove", boreMm: 25, outerDiameterMm: 47, widthMm: 12, dynamicRatingN: 11900, staticRatingN: 6550, limitingSpeedRpm: 14000 },
  // Deep groove ball — 62xx
  { seriesDesignation: "6200", type: "deep_groove", boreMm: 10, outerDiameterMm: 30, widthMm: 9, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000 },
  { seriesDesignation: "6201", type: "deep_groove", boreMm: 12, outerDiameterMm: 32, widthMm: 10, dynamicRatingN: 7280, staticRatingN: 3100, limitingSpeedRpm: 22000 },
  { seriesDesignation: "6202", type: "deep_groove", boreMm: 15, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8060, staticRatingN: 3750, limitingSpeedRpm: 19000 },
  { seriesDesignation: "6203", type: "deep_groove", boreMm: 17, outerDiameterMm: 40, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 4750, limitingSpeedRpm: 17000 },
  { seriesDesignation: "6204", type: "deep_groove", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 13500, staticRatingN: 6550, limitingSpeedRpm: 15000 },
  { seriesDesignation: "6205", type: "deep_groove", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14800, staticRatingN: 7800, limitingSpeedRpm: 12000 },
  { seriesDesignation: "6206", type: "deep_groove", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 20300, staticRatingN: 11200, limitingSpeedRpm: 10000 },
  { seriesDesignation: "6207", type: "deep_groove", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 27000, staticRatingN: 15300, limitingSpeedRpm: 9000 },
  { seriesDesignation: "6208", type: "deep_groove", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 32500, staticRatingN: 19000, limitingSpeedRpm: 8500 },
  { seriesDesignation: "6209", type: "deep_groove", boreMm: 45, outerDiameterMm: 85, widthMm: 19, dynamicRatingN: 35100, staticRatingN: 21600, limitingSpeedRpm: 7500 },
  { seriesDesignation: "6210", type: "deep_groove", boreMm: 50, outerDiameterMm: 90, widthMm: 20, dynamicRatingN: 37100, staticRatingN: 23200, limitingSpeedRpm: 7000 },
  // Deep groove ball — 63xx
  { seriesDesignation: "6300", type: "deep_groove", boreMm: 10, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8520, staticRatingN: 3400, limitingSpeedRpm: 20000 },
  { seriesDesignation: "6301", type: "deep_groove", boreMm: 12, outerDiameterMm: 37, widthMm: 12, dynamicRatingN: 10100, staticRatingN: 4150, limitingSpeedRpm: 19000 },
  { seriesDesignation: "6302", type: "deep_groove", boreMm: 15, outerDiameterMm: 42, widthMm: 13, dynamicRatingN: 11700, staticRatingN: 5400, limitingSpeedRpm: 17000 },
  { seriesDesignation: "6303", type: "deep_groove", boreMm: 17, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 13800, staticRatingN: 6550, limitingSpeedRpm: 16000 },
  { seriesDesignation: "6304", type: "deep_groove", boreMm: 20, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16800, staticRatingN: 7800, limitingSpeedRpm: 13000 },
  { seriesDesignation: "6305", type: "deep_groove", boreMm: 25, outerDiameterMm: 62, widthMm: 17, dynamicRatingN: 23400, staticRatingN: 11600, limitingSpeedRpm: 11000 },
  { seriesDesignation: "6306", type: "deep_groove", boreMm: 30, outerDiameterMm: 72, widthMm: 19, dynamicRatingN: 29600, staticRatingN: 16000, limitingSpeedRpm: 9500 },
  { seriesDesignation: "6307", type: "deep_groove", boreMm: 35, outerDiameterMm: 80, widthMm: 21, dynamicRatingN: 35100, staticRatingN: 19000, limitingSpeedRpm: 8500 },
  { seriesDesignation: "6308", type: "deep_groove", boreMm: 40, outerDiameterMm: 90, widthMm: 23, dynamicRatingN: 42300, staticRatingN: 24000, limitingSpeedRpm: 7500 },
  { seriesDesignation: "6309", type: "deep_groove", boreMm: 45, outerDiameterMm: 100, widthMm: 25, dynamicRatingN: 55300, staticRatingN: 31500, limitingSpeedRpm: 6700 },
  { seriesDesignation: "6310", type: "deep_groove", boreMm: 50, outerDiameterMm: 110, widthMm: 27, dynamicRatingN: 65000, staticRatingN: 38000, limitingSpeedRpm: 6000 },
  // Angular contact — 72xx-B (40°)
  { seriesDesignation: "7204 B", type: "angular_contact", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 14000, staticRatingN: 8150, limitingSpeedRpm: 13000 },
  { seriesDesignation: "7205 B", type: "angular_contact", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16800, staticRatingN: 9800, limitingSpeedRpm: 11000 },
  { seriesDesignation: "7206 B", type: "angular_contact", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 24200, staticRatingN: 15300, limitingSpeedRpm: 9500 },
  { seriesDesignation: "7207 B", type: "angular_contact", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 31000, staticRatingN: 20400, limitingSpeedRpm: 8500 },
  { seriesDesignation: "7208 B", type: "angular_contact", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 39000, staticRatingN: 26500, limitingSpeedRpm: 7500 },
  // Cylindrical roller — NU2xx
  { seriesDesignation: "NU 204", type: "cylindrical_roller", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 25100, staticRatingN: 22000, limitingSpeedRpm: 12000 },
  { seriesDesignation: "NU 205", type: "cylindrical_roller", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 28600, staticRatingN: 27000, limitingSpeedRpm: 10000 },
  { seriesDesignation: "NU 206", type: "cylindrical_roller", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 38000, staticRatingN: 36500, limitingSpeedRpm: 8500 },
  { seriesDesignation: "NU 207", type: "cylindrical_roller", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 51000, limitingSpeedRpm: 7500 },
  { seriesDesignation: "NU 208", type: "cylindrical_roller", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 53900, staticRatingN: 53000, limitingSpeedRpm: 7000 },
];

/** Timken inch-bore deep groove (representative). */
const TIMKEN_INCH_SERIES: SeriesTemplate[] = [
  { seriesDesignation: "R 4", type: "deep_groove", boreMm: 6.35, outerDiameterMm: 15.875, widthMm: 4.978, dynamicRatingN: 2240, staticRatingN: 950, limitingSpeedRpm: 32000 },
  { seriesDesignation: "R 6", type: "deep_groove", boreMm: 9.525, outerDiameterMm: 22.225, widthMm: 5.556, dynamicRatingN: 3350, staticRatingN: 1500, limitingSpeedRpm: 28000 },
  { seriesDesignation: "R 8", type: "deep_groove", boreMm: 12.7, outerDiameterMm: 28.575, widthMm: 7.938, dynamicRatingN: 4750, staticRatingN: 2240, limitingSpeedRpm: 24000 },
];

/** FAG sealed variants (representative Schaeffler catalog). */
const FAG_SEALED_SERIES: SeriesTemplate[] = [
  { seriesDesignation: "6205-2RS", type: "deep_groove", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14000, staticRatingN: 7800, limitingSpeedRpm: 11000 },
  { seriesDesignation: "6206-2RS", type: "deep_groove", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 19500, staticRatingN: 11200, limitingSpeedRpm: 9500 },
  { seriesDesignation: "7205-B", type: "angular_contact", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16000, staticRatingN: 9500, limitingSpeedRpm: 11000 },
];

function buildTimkenInchEntries(): BearingCatalogEntry[] {
  const factors = MANUFACTURER_FACTORS.TIMKEN;
  return TIMKEN_INCH_SERIES.map((t) => ({
    designation: formatDesignation("TIMKEN", t.seriesDesignation),
    type: t.type,
    manufacturer: "TIMKEN" as const,
    boreMm: t.boreMm,
    outerDiameterMm: t.outerDiameterMm,
    widthMm: t.widthMm,
    dynamicRatingN: scaleRating(t.dynamicRatingN, factors.dynamic),
    staticRatingN: scaleRating(t.staticRatingN, factors.static),
    limitingSpeedRpm: scaleRating(t.limitingSpeedRpm, factors.speed),
  }));
}

function buildFagSealedEntries(): BearingCatalogEntry[] {
  const factors = MANUFACTURER_FACTORS.FAG;
  return FAG_SEALED_SERIES.map((t) => ({
    designation: formatDesignation("FAG", t.seriesDesignation),
    type: t.type,
    manufacturer: "FAG" as const,
    boreMm: t.boreMm,
    outerDiameterMm: t.outerDiameterMm,
    widthMm: t.widthMm,
    dynamicRatingN: scaleRating(t.dynamicRatingN, factors.dynamic),
    staticRatingN: scaleRating(t.staticRatingN, factors.static),
    limitingSpeedRpm: scaleRating(t.limitingSpeedRpm, factors.speed),
  }));
}

export const bearingCatalog: BearingCatalogEntry[] = [
  ...expandSeries(METRIC_SERIES),
  ...buildTimkenInchEntries(),
  ...buildFagSealedEntries(),
];

export function findBearing(designation: string): BearingCatalogEntry | undefined {
  return bearingCatalog.find((b) => b.designation === designation);
}

/** @deprecated Use entry.manufacturer */
export function catalogSource(entry: BearingCatalogEntry): BearingCatalogSource {
  return entry.manufacturer;
}

export function catalogTierToManufacturer(tier: BearingCatalogTier): BearingManufacturer {
  const map: Record<BearingCatalogTier, BearingManufacturer> = {
    skf_metric: "SKF",
    inch: "TIMKEN",
    ina_fag: "FAG",
  };
  return map[tier];
}

/** @deprecated Use bearingsOfManufacturer */
export function bearingsOfTier(tier: BearingCatalogTier): BearingCatalogEntry[] {
  return bearingsOfManufacturer(catalogTierToManufacturer(tier));
}

export function bearingsOfManufacturer(manufacturer: BearingManufacturer): BearingCatalogEntry[] {
  return bearingCatalog.filter((b) => b.manufacturer === manufacturer);
}

export function bearingsOfType(
  type: CatalogBearingType,
  manufacturer?: BearingManufacturer
): BearingCatalogEntry[] {
  const pool = manufacturer ? bearingsOfManufacturer(manufacturer) : bearingCatalog;
  return pool.filter((b) => b.type === type);
}

/** Map a designation from one manufacturer to the closest match in another (same bore, then type). */
export function equivalentDesignation(
  designation: string,
  targetManufacturer: BearingManufacturer
): string | undefined {
  const current = findBearing(designation);
  if (!current) return undefined;
  const sameBore = bearingsOfType(current.type, targetManufacturer).filter(
    (b) => Math.abs(b.boreMm - current.boreMm) < 0.01
  );
  if (sameBore.length) return sameBore[0]!.designation;
  const candidates = bearingsOfType(current.type, targetManufacturer);
  return candidates[0]?.designation;
}

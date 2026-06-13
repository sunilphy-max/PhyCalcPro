/**
 * Rolling bearing catalog — representative manufacturer ratings
 * (deep-groove 62xx/63xx, angular-contact 72xx-B, cylindrical roller NU2xx).
 * C / C0 are dynamic / static load ratings; limiting speed for grease.
 */

export type CatalogBearingType =
  | "deep_groove"
  | "angular_contact"
  | "cylindrical_roller";

export type BearingCatalogEntry = {
  designation: string;
  type: CatalogBearingType;
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

export const bearingCatalog: BearingCatalogEntry[] = [
  // Deep groove ball — 60xx series
  { designation: "6000", type: "deep_groove", boreMm: 10, outerDiameterMm: 26, widthMm: 8, dynamicRatingN: 4750, staticRatingN: 1960, limitingSpeedRpm: 28000 },
  { designation: "6001", type: "deep_groove", boreMm: 12, outerDiameterMm: 28, widthMm: 8, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000 },
  { designation: "6002", type: "deep_groove", boreMm: 15, outerDiameterMm: 32, widthMm: 9, dynamicRatingN: 5850, staticRatingN: 2850, limitingSpeedRpm: 22000 },
  { designation: "6003", type: "deep_groove", boreMm: 17, outerDiameterMm: 35, widthMm: 10, dynamicRatingN: 6000, staticRatingN: 3250, limitingSpeedRpm: 20000 },
  { designation: "6004", type: "deep_groove", boreMm: 20, outerDiameterMm: 42, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 5000, limitingSpeedRpm: 17000 },
  { designation: "6005", type: "deep_groove", boreMm: 25, outerDiameterMm: 47, widthMm: 12, dynamicRatingN: 11900, staticRatingN: 6550, limitingSpeedRpm: 14000 },
  // Deep groove ball — 62xx series
  { designation: "6200", type: "deep_groove", boreMm: 10, outerDiameterMm: 30, widthMm: 9, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000 },
  { designation: "6201", type: "deep_groove", boreMm: 12, outerDiameterMm: 32, widthMm: 10, dynamicRatingN: 7280, staticRatingN: 3100, limitingSpeedRpm: 22000 },
  { designation: "6202", type: "deep_groove", boreMm: 15, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8060, staticRatingN: 3750, limitingSpeedRpm: 19000 },
  { designation: "6203", type: "deep_groove", boreMm: 17, outerDiameterMm: 40, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 4750, limitingSpeedRpm: 17000 },
  { designation: "6204", type: "deep_groove", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 13500, staticRatingN: 6550, limitingSpeedRpm: 15000 },
  { designation: "6205", type: "deep_groove", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14800, staticRatingN: 7800, limitingSpeedRpm: 12000 },
  { designation: "6206", type: "deep_groove", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 20300, staticRatingN: 11200, limitingSpeedRpm: 10000 },
  { designation: "6207", type: "deep_groove", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 27000, staticRatingN: 15300, limitingSpeedRpm: 9000 },
  { designation: "6208", type: "deep_groove", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 32500, staticRatingN: 19000, limitingSpeedRpm: 8500 },
  { designation: "6209", type: "deep_groove", boreMm: 45, outerDiameterMm: 85, widthMm: 19, dynamicRatingN: 35100, staticRatingN: 21600, limitingSpeedRpm: 7500 },
  { designation: "6210", type: "deep_groove", boreMm: 50, outerDiameterMm: 90, widthMm: 20, dynamicRatingN: 37100, staticRatingN: 23200, limitingSpeedRpm: 7000 },
  // Deep groove ball — 63xx series
  { designation: "6300", type: "deep_groove", boreMm: 10, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8520, staticRatingN: 3400, limitingSpeedRpm: 20000 },
  { designation: "6301", type: "deep_groove", boreMm: 12, outerDiameterMm: 37, widthMm: 12, dynamicRatingN: 10100, staticRatingN: 4150, limitingSpeedRpm: 19000 },
  { designation: "6302", type: "deep_groove", boreMm: 15, outerDiameterMm: 42, widthMm: 13, dynamicRatingN: 11700, staticRatingN: 5400, limitingSpeedRpm: 17000 },
  { designation: "6303", type: "deep_groove", boreMm: 17, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 13800, staticRatingN: 6550, limitingSpeedRpm: 16000 },
  { designation: "6304", type: "deep_groove", boreMm: 20, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16800, staticRatingN: 7800, limitingSpeedRpm: 13000 },
  { designation: "6305", type: "deep_groove", boreMm: 25, outerDiameterMm: 62, widthMm: 17, dynamicRatingN: 23400, staticRatingN: 11600, limitingSpeedRpm: 11000 },
  { designation: "6306", type: "deep_groove", boreMm: 30, outerDiameterMm: 72, widthMm: 19, dynamicRatingN: 29600, staticRatingN: 16000, limitingSpeedRpm: 9500 },
  { designation: "6307", type: "deep_groove", boreMm: 35, outerDiameterMm: 80, widthMm: 21, dynamicRatingN: 35100, staticRatingN: 19000, limitingSpeedRpm: 8500 },
  { designation: "6308", type: "deep_groove", boreMm: 40, outerDiameterMm: 90, widthMm: 23, dynamicRatingN: 42300, staticRatingN: 24000, limitingSpeedRpm: 7500 },
  { designation: "6309", type: "deep_groove", boreMm: 45, outerDiameterMm: 100, widthMm: 25, dynamicRatingN: 55300, staticRatingN: 31500, limitingSpeedRpm: 6700 },
  { designation: "6310", type: "deep_groove", boreMm: 50, outerDiameterMm: 110, widthMm: 27, dynamicRatingN: 65000, staticRatingN: 38000, limitingSpeedRpm: 6000 },
  // Angular contact — 72xx-B series (40° contact angle)
  { designation: "7204 B", type: "angular_contact", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 14000, staticRatingN: 8150, limitingSpeedRpm: 13000 },
  { designation: "7205 B", type: "angular_contact", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16800, staticRatingN: 9800, limitingSpeedRpm: 11000 },
  { designation: "7206 B", type: "angular_contact", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 24200, staticRatingN: 15300, limitingSpeedRpm: 9500 },
  { designation: "7207 B", type: "angular_contact", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 31000, staticRatingN: 20400, limitingSpeedRpm: 8500 },
  { designation: "7208 B", type: "angular_contact", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 39000, staticRatingN: 26500, limitingSpeedRpm: 7500 },
  // Cylindrical roller — NU2xx series
  { designation: "NU 204", type: "cylindrical_roller", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 25100, staticRatingN: 22000, limitingSpeedRpm: 12000 },
  { designation: "NU 205", type: "cylindrical_roller", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 28600, staticRatingN: 27000, limitingSpeedRpm: 10000 },
  { designation: "NU 206", type: "cylindrical_roller", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 38000, staticRatingN: 36500, limitingSpeedRpm: 8500 },
  { designation: "NU 207", type: "cylindrical_roller", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 51000, limitingSpeedRpm: 7500 },
  { designation: "NU 208", type: "cylindrical_roller", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 53900, staticRatingN: 53000, limitingSpeedRpm: 7000 },
];

export function findBearing(designation: string): BearingCatalogEntry | undefined {
  return bearingCatalog.find((b) => b.designation === designation);
}

export function bearingsOfType(type: CatalogBearingType): BearingCatalogEntry[] {
  return bearingCatalog.filter((b) => b.type === type);
}

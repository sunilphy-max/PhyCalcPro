/**
 * Bearing series templates — SKF-baseline geometry and ratings expanded per manufacturer.
 */

import type { BearingApplicationProfile, SeriesTemplate } from "./types";

const RADIAL: BearingApplicationProfile[] = ["general_radial", "floating_bearing", "high_speed"];
const COMBINED: BearingApplicationProfile[] = ["combined_loads", "locating_bearing"];
const SHOCK: BearingApplicationProfile[] = ["heavy_shock", "combined_loads"];
const COMPACT: BearingApplicationProfile[] = ["space_limited", "general_radial"];
const THRUST: BearingApplicationProfile[] = ["pure_thrust", "locating_bearing"];

export const METRIC_DEEP_GROOVE: SeriesTemplate[] = [
  { seriesDesignation: "6000", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 10, outerDiameterMm: 26, widthMm: 8, dynamicRatingN: 4750, staticRatingN: 1960, limitingSpeedRpm: 28000, applicationTags: RADIAL },
  { seriesDesignation: "6001", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 12, outerDiameterMm: 28, widthMm: 8, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000, applicationTags: RADIAL },
  { seriesDesignation: "6002", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 15, outerDiameterMm: 32, widthMm: 9, dynamicRatingN: 5850, staticRatingN: 2850, limitingSpeedRpm: 22000, applicationTags: RADIAL },
  { seriesDesignation: "6003", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 17, outerDiameterMm: 35, widthMm: 10, dynamicRatingN: 6000, staticRatingN: 3250, limitingSpeedRpm: 20000, applicationTags: RADIAL },
  { seriesDesignation: "6004", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 20, outerDiameterMm: 42, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 5000, limitingSpeedRpm: 17000, applicationTags: RADIAL },
  { seriesDesignation: "6005", type: "deep_groove", family: "deep_groove_ball", series: "60xx", dimensionSeries: "extra_light", boreMm: 25, outerDiameterMm: 47, widthMm: 12, dynamicRatingN: 11900, staticRatingN: 6550, limitingSpeedRpm: 14000, applicationTags: RADIAL },
  { seriesDesignation: "6200", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 10, outerDiameterMm: 30, widthMm: 9, dynamicRatingN: 5400, staticRatingN: 2360, limitingSpeedRpm: 26000, applicationTags: RADIAL },
  { seriesDesignation: "6201", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 12, outerDiameterMm: 32, widthMm: 10, dynamicRatingN: 7280, staticRatingN: 3100, limitingSpeedRpm: 22000, applicationTags: RADIAL },
  { seriesDesignation: "6202", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 15, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8060, staticRatingN: 3750, limitingSpeedRpm: 19000, applicationTags: RADIAL },
  { seriesDesignation: "6203", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 17, outerDiameterMm: 40, widthMm: 12, dynamicRatingN: 9950, staticRatingN: 4750, limitingSpeedRpm: 17000, applicationTags: RADIAL },
  { seriesDesignation: "6204", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 13500, staticRatingN: 6550, limitingSpeedRpm: 15000, applicationTags: RADIAL },
  { seriesDesignation: "6205", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14800, staticRatingN: 7800, limitingSpeedRpm: 12000, applicationTags: RADIAL },
  { seriesDesignation: "6206", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 20300, staticRatingN: 11200, limitingSpeedRpm: 10000, applicationTags: RADIAL },
  { seriesDesignation: "6207", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 27000, staticRatingN: 15300, limitingSpeedRpm: 9000, applicationTags: RADIAL },
  { seriesDesignation: "6208", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 32500, staticRatingN: 19000, limitingSpeedRpm: 8500, applicationTags: RADIAL },
  { seriesDesignation: "6209", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 45, outerDiameterMm: 85, widthMm: 19, dynamicRatingN: 35100, staticRatingN: 21600, limitingSpeedRpm: 7500, applicationTags: RADIAL },
  { seriesDesignation: "6210", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 50, outerDiameterMm: 90, widthMm: 20, dynamicRatingN: 37100, staticRatingN: 23200, limitingSpeedRpm: 7000, applicationTags: RADIAL },
  { seriesDesignation: "6211", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 55, outerDiameterMm: 100, widthMm: 21, dynamicRatingN: 43600, staticRatingN: 29000, limitingSpeedRpm: 6300, applicationTags: RADIAL },
  { seriesDesignation: "6212", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", boreMm: 60, outerDiameterMm: 110, widthMm: 22, dynamicRatingN: 52700, staticRatingN: 36000, limitingSpeedRpm: 5600, applicationTags: RADIAL },
  { seriesDesignation: "6300", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 10, outerDiameterMm: 35, widthMm: 11, dynamicRatingN: 8520, staticRatingN: 3400, limitingSpeedRpm: 20000, applicationTags: RADIAL },
  { seriesDesignation: "6305", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 25, outerDiameterMm: 62, widthMm: 17, dynamicRatingN: 23400, staticRatingN: 11600, limitingSpeedRpm: 11000, applicationTags: RADIAL },
  { seriesDesignation: "6306", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 30, outerDiameterMm: 72, widthMm: 19, dynamicRatingN: 29600, staticRatingN: 16000, limitingSpeedRpm: 9500, applicationTags: RADIAL },
  { seriesDesignation: "6307", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 35, outerDiameterMm: 80, widthMm: 21, dynamicRatingN: 35100, staticRatingN: 19000, limitingSpeedRpm: 8500, applicationTags: RADIAL },
  { seriesDesignation: "6308", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 40, outerDiameterMm: 90, widthMm: 23, dynamicRatingN: 42300, staticRatingN: 24000, limitingSpeedRpm: 7500, applicationTags: RADIAL },
  { seriesDesignation: "6309", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 45, outerDiameterMm: 100, widthMm: 25, dynamicRatingN: 55300, staticRatingN: 31500, limitingSpeedRpm: 6700, applicationTags: RADIAL },
  { seriesDesignation: "6310", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 50, outerDiameterMm: 110, widthMm: 27, dynamicRatingN: 65000, staticRatingN: 38000, limitingSpeedRpm: 6000, applicationTags: RADIAL },
  { seriesDesignation: "6311", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 55, outerDiameterMm: 120, widthMm: 29, dynamicRatingN: 78100, staticRatingN: 45500, limitingSpeedRpm: 5600, applicationTags: RADIAL },
  { seriesDesignation: "6312", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", boreMm: 60, outerDiameterMm: 130, widthMm: 31, dynamicRatingN: 89100, staticRatingN: 52000, limitingSpeedRpm: 5000, applicationTags: RADIAL },
  { seriesDesignation: "6805", type: "deep_groove", family: "deep_groove_ball", series: "68xx", dimensionSeries: "thin_section", boreMm: 25, outerDiameterMm: 37, widthMm: 7, dynamicRatingN: 4300, staticRatingN: 2200, limitingSpeedRpm: 18000, applicationTags: [...COMPACT, "high_speed"] },
  { seriesDesignation: "6806", type: "deep_groove", family: "deep_groove_ball", series: "68xx", dimensionSeries: "thin_section", boreMm: 30, outerDiameterMm: 42, widthMm: 7, dynamicRatingN: 4700, staticRatingN: 2600, limitingSpeedRpm: 16000, applicationTags: [...COMPACT, "high_speed"] },
  { seriesDesignation: "6905", type: "deep_groove", family: "deep_groove_ball", series: "69xx", dimensionSeries: "thin_section", boreMm: 25, outerDiameterMm: 42, widthMm: 9, dynamicRatingN: 7800, staticRatingN: 3900, limitingSpeedRpm: 15000, applicationTags: [...COMPACT, "high_speed"] },
];

export const SEALED_DEEP_GROOVE: SeriesTemplate[] = [
  { seriesDesignation: "6205-2RS", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", sealType: "sealed", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14000, staticRatingN: 7800, limitingSpeedRpm: 10000, referenceSpeedRpm: 12000, applicationTags: RADIAL },
  { seriesDesignation: "6206-2RS", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", sealType: "sealed", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 19500, staticRatingN: 11200, limitingSpeedRpm: 8500, referenceSpeedRpm: 10000, applicationTags: RADIAL },
  { seriesDesignation: "6207-2RS", type: "deep_groove", family: "deep_groove_ball", series: "62xx", dimensionSeries: "light", sealType: "sealed", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 25500, staticRatingN: 15300, limitingSpeedRpm: 7500, referenceSpeedRpm: 9000, applicationTags: RADIAL },
  { seriesDesignation: "6305-2RS", type: "deep_groove", family: "deep_groove_ball", series: "63xx", dimensionSeries: "medium", sealType: "sealed", boreMm: 25, outerDiameterMm: 62, widthMm: 17, dynamicRatingN: 22400, staticRatingN: 11600, limitingSpeedRpm: 9500, referenceSpeedRpm: 11000, applicationTags: RADIAL },
];

export const ANGULAR_CONTACT: SeriesTemplate[] = [
  { seriesDesignation: "7204 B", type: "angular_contact", family: "angular_contact_ball", series: "72xx-B", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 14000, staticRatingN: 8150, limitingSpeedRpm: 13000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7205 B", type: "angular_contact", family: "angular_contact_ball", series: "72xx-B", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 16800, staticRatingN: 9800, limitingSpeedRpm: 11000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7206 B", type: "angular_contact", family: "angular_contact_ball", series: "72xx-B", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 24200, staticRatingN: 15300, limitingSpeedRpm: 9500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7207 B", type: "angular_contact", family: "angular_contact_ball", series: "72xx-B", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 31000, staticRatingN: 20400, limitingSpeedRpm: 8500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7208 B", type: "angular_contact", family: "angular_contact_ball", series: "72xx-B", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 39000, staticRatingN: 26500, limitingSpeedRpm: 7500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7305 B", type: "angular_contact", family: "angular_contact_ball", series: "73xx-B", dimensionSeries: "medium", boreMm: 25, outerDiameterMm: 62, widthMm: 17, dynamicRatingN: 26000, staticRatingN: 16000, limitingSpeedRpm: 9000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
  { seriesDesignation: "7306 B", type: "angular_contact", family: "angular_contact_ball", series: "73xx-B", dimensionSeries: "medium", boreMm: 30, outerDiameterMm: 72, widthMm: 19, dynamicRatingN: 33500, staticRatingN: 22000, limitingSpeedRpm: 8000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.35, Y: 0.57, e: 1.14 } },
];

export const CYLINDRICAL_NU: SeriesTemplate[] = [
  { seriesDesignation: "NU 204", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 20, outerDiameterMm: 47, widthMm: 14, dynamicRatingN: 25100, staticRatingN: 22000, limitingSpeedRpm: 12000, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
  { seriesDesignation: "NU 205", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 28600, staticRatingN: 27000, limitingSpeedRpm: 10000, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
  { seriesDesignation: "NU 206", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 38000, staticRatingN: 36500, limitingSpeedRpm: 8500, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
  { seriesDesignation: "NU 207", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 51000, limitingSpeedRpm: 7500, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
  { seriesDesignation: "NU 208", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 53900, staticRatingN: 53000, limitingSpeedRpm: 7000, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
  { seriesDesignation: "NU 210", type: "cylindrical_roller", family: "cylindrical_roller", series: "NU2xx", boreMm: 50, outerDiameterMm: 90, widthMm: 20, dynamicRatingN: 73500, staticRatingN: 78000, limitingSpeedRpm: 6000, mountingRole: "non_locating", applicationTags: ["floating_bearing", "general_radial"] },
];

export const CYLINDRICAL_NJ: SeriesTemplate[] = [
  { seriesDesignation: "NJ 205", type: "cylindrical_nj", family: "cylindrical_roller", series: "NJ2xx", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 28600, staticRatingN: 28500, limitingSpeedRpm: 9500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.35, e: 0.4 } },
  { seriesDesignation: "NJ 206", type: "cylindrical_nj", family: "cylindrical_roller", series: "NJ2xx", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 38000, staticRatingN: 39000, limitingSpeedRpm: 8000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.35, e: 0.4 } },
  { seriesDesignation: "NJ 207", type: "cylindrical_nj", family: "cylindrical_roller", series: "NJ2xx", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 53000, limitingSpeedRpm: 7000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.35, e: 0.4 } },
  { seriesDesignation: "NJ 208", type: "cylindrical_nj", family: "cylindrical_roller", series: "NJ2xx", boreMm: 40, outerDiameterMm: 80, widthMm: 18, dynamicRatingN: 53900, staticRatingN: 57000, limitingSpeedRpm: 6300, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.35, e: 0.4 } },
];

export const CYLINDRICAL_NUP: SeriesTemplate[] = [
  { seriesDesignation: "NUP 205", type: "cylindrical_nup", family: "cylindrical_roller", series: "NUP2xx", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 28600, staticRatingN: 29000, limitingSpeedRpm: 9000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.45, e: 0.4 } },
  { seriesDesignation: "NUP 206", type: "cylindrical_nup", family: "cylindrical_roller", series: "NUP2xx", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 38000, staticRatingN: 40000, limitingSpeedRpm: 7500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.45, e: 0.4 } },
  { seriesDesignation: "NUP 207", type: "cylindrical_nup", family: "cylindrical_roller", series: "NUP2xx", boreMm: 35, outerDiameterMm: 72, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 54000, limitingSpeedRpm: 6700, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 1, Y: 0.45, e: 0.4 } },
];

export const TAPERED_ROLLER: SeriesTemplate[] = [
  { seriesDesignation: "30205", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 25, outerDiameterMm: 52, widthMm: 16.25, dynamicRatingN: 45500, staticRatingN: 43000, limitingSpeedRpm: 9000, referenceSpeedRpm: 12000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30206", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 30, outerDiameterMm: 62, widthMm: 17.25, dynamicRatingN: 58000, staticRatingN: 56000, limitingSpeedRpm: 7500, referenceSpeedRpm: 10000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30207", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 35, outerDiameterMm: 72, widthMm: 18.25, dynamicRatingN: 73500, staticRatingN: 73000, limitingSpeedRpm: 6300, referenceSpeedRpm: 8500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30208", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 40, outerDiameterMm: 80, widthMm: 19.25, dynamicRatingN: 86500, staticRatingN: 90000, limitingSpeedRpm: 5600, referenceSpeedRpm: 7500, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30209", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 45, outerDiameterMm: 85, widthMm: 20.75, dynamicRatingN: 91500, staticRatingN: 98000, limitingSpeedRpm: 5300, referenceSpeedRpm: 7000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30210", type: "tapered_roller", family: "tapered_roller", series: "302xx", dimensionSeries: "tapered_light", boreMm: 50, outerDiameterMm: 90, widthMm: 21.75, dynamicRatingN: 98000, staticRatingN: 110000, limitingSpeedRpm: 5000, referenceSpeedRpm: 6700, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30305", type: "tapered_roller", family: "tapered_roller", series: "303xx", dimensionSeries: "tapered_medium", boreMm: 25, outerDiameterMm: 62, widthMm: 20.25, dynamicRatingN: 65000, staticRatingN: 63000, limitingSpeedRpm: 7000, referenceSpeedRpm: 9500, mountingRole: "locating", applicationTags: [...COMBINED, "heavy_shock"], catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "30306", type: "tapered_roller", family: "tapered_roller", series: "303xx", dimensionSeries: "tapered_medium", boreMm: 30, outerDiameterMm: 72, widthMm: 22.25, dynamicRatingN: 82500, staticRatingN: 85000, limitingSpeedRpm: 6000, referenceSpeedRpm: 8000, mountingRole: "locating", applicationTags: [...COMBINED, "heavy_shock"], catalogFactors: { X: 0.4, Y: 1.0, e: 0.4 } },
  { seriesDesignation: "32005", type: "tapered_roller", family: "tapered_roller", series: "320xx", dimensionSeries: "tapered_light", boreMm: 25, outerDiameterMm: 47, widthMm: 15, dynamicRatingN: 38000, staticRatingN: 38000, limitingSpeedRpm: 10000, referenceSpeedRpm: 13000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.43, Y: 1.1, e: 0.35 } },
  { seriesDesignation: "32006", type: "tapered_roller", family: "tapered_roller", series: "320xx", dimensionSeries: "tapered_light", boreMm: 30, outerDiameterMm: 55, widthMm: 17, dynamicRatingN: 48000, staticRatingN: 50000, limitingSpeedRpm: 8500, referenceSpeedRpm: 11000, mountingRole: "locating", applicationTags: COMBINED, catalogFactors: { X: 0.43, Y: 1.1, e: 0.35 } },
];

export const SPHERICAL_ROLLER: SeriesTemplate[] = [
  { seriesDesignation: "22208", type: "spherical_roller", family: "spherical_roller", series: "222xx", boreMm: 40, outerDiameterMm: 80, widthMm: 23, dynamicRatingN: 106000, staticRatingN: 118000, limitingSpeedRpm: 6000, referenceSpeedRpm: 8000, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.1, e: 0.65 } },
  { seriesDesignation: "22209", type: "spherical_roller", family: "spherical_roller", series: "222xx", boreMm: 45, outerDiameterMm: 85, widthMm: 23, dynamicRatingN: 118000, staticRatingN: 132000, limitingSpeedRpm: 5300, referenceSpeedRpm: 7000, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.1, e: 0.65 } },
  { seriesDesignation: "22210", type: "spherical_roller", family: "spherical_roller", series: "222xx", boreMm: 50, outerDiameterMm: 90, widthMm: 23, dynamicRatingN: 127000, staticRatingN: 145000, limitingSpeedRpm: 5000, referenceSpeedRpm: 6700, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.1, e: 0.65 } },
  { seriesDesignation: "22308", type: "spherical_roller", family: "spherical_roller", series: "223xx", dimensionSeries: "medium", boreMm: 40, outerDiameterMm: 90, widthMm: 33, dynamicRatingN: 150000, staticRatingN: 186000, limitingSpeedRpm: 4800, referenceSpeedRpm: 6300, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.1, e: 0.65 } },
  { seriesDesignation: "22309", type: "spherical_roller", family: "spherical_roller", series: "223xx", dimensionSeries: "medium", boreMm: 45, outerDiameterMm: 100, widthMm: 36, dynamicRatingN: 186000, staticRatingN: 240000, limitingSpeedRpm: 4300, referenceSpeedRpm: 5600, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.1, e: 0.65 } },
];

export const NEEDLE_ROLLER: SeriesTemplate[] = [
  { seriesDesignation: "NA 4906", type: "needle_roller", family: "needle_roller", series: "NA49xx", boreMm: 30, outerDiameterMm: 47, widthMm: 17, dynamicRatingN: 28000, staticRatingN: 42000, limitingSpeedRpm: 11000, mountingRole: "non_locating", applicationTags: COMPACT },
  { seriesDesignation: "NA 4907", type: "needle_roller", family: "needle_roller", series: "NA49xx", boreMm: 35, outerDiameterMm: 52, widthMm: 20, dynamicRatingN: 32500, staticRatingN: 53000, limitingSpeedRpm: 9500, mountingRole: "non_locating", applicationTags: COMPACT },
  { seriesDesignation: "HK 2520", type: "needle_roller", family: "needle_roller", series: "HK", boreMm: 25, outerDiameterMm: 32, widthMm: 20, dynamicRatingN: 18500, staticRatingN: 32000, limitingSpeedRpm: 12000, mountingRole: "non_locating", applicationTags: COMPACT },
  { seriesDesignation: "HK 3020", type: "needle_roller", family: "needle_roller", series: "HK", boreMm: 30, outerDiameterMm: 37, widthMm: 20, dynamicRatingN: 22000, staticRatingN: 40000, limitingSpeedRpm: 10000, mountingRole: "non_locating", applicationTags: COMPACT },
];

export const SELF_ALIGNING: SeriesTemplate[] = [
  { seriesDesignation: "1205", type: "self_aligning_ball", family: "self_aligning_ball", series: "12xx", boreMm: 25, outerDiameterMm: 52, widthMm: 15, dynamicRatingN: 14800, staticRatingN: 3800, limitingSpeedRpm: 12000, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.3, e: 0.65 } },
  { seriesDesignation: "1206", type: "self_aligning_ball", family: "self_aligning_ball", series: "12xx", boreMm: 30, outerDiameterMm: 62, widthMm: 16, dynamicRatingN: 19500, staticRatingN: 5000, limitingSpeedRpm: 10000, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.3, e: 0.65 } },
  { seriesDesignation: "1308", type: "self_aligning_ball", family: "self_aligning_ball", series: "13xx", dimensionSeries: "medium", boreMm: 40, outerDiameterMm: 90, widthMm: 23, dynamicRatingN: 31900, staticRatingN: 8500, limitingSpeedRpm: 7500, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.3, e: 0.65 } },
  { seriesDesignation: "1309", type: "self_aligning_ball", family: "self_aligning_ball", series: "13xx", dimensionSeries: "medium", boreMm: 45, outerDiameterMm: 100, widthMm: 25, dynamicRatingN: 40500, staticRatingN: 10800, limitingSpeedRpm: 6700, mountingRole: "either", applicationTags: SHOCK, catalogFactors: { X: 1, Y: 2.3, e: 0.65 } },
];

export const THRUST_BALL: SeriesTemplate[] = [
  { seriesDesignation: "51105", type: "thrust_ball", family: "thrust_ball", series: "511xx", boreMm: 25, outerDiameterMm: 42, widthMm: 11, dynamicRatingN: 25500, staticRatingN: 56000, limitingSpeedRpm: 6000, mountingRole: "locating", applicationTags: THRUST },
  { seriesDesignation: "51106", type: "thrust_ball", family: "thrust_ball", series: "511xx", boreMm: 30, outerDiameterMm: 47, widthMm: 11, dynamicRatingN: 29000, staticRatingN: 67000, limitingSpeedRpm: 5300, mountingRole: "locating", applicationTags: THRUST },
  { seriesDesignation: "51107", type: "thrust_ball", family: "thrust_ball", series: "511xx", boreMm: 35, outerDiameterMm: 52, widthMm: 12, dynamicRatingN: 32500, staticRatingN: 78000, limitingSpeedRpm: 4800, mountingRole: "locating", applicationTags: THRUST },
  { seriesDesignation: "51206", type: "thrust_ball", family: "thrust_ball", series: "512xx", dimensionSeries: "medium", boreMm: 30, outerDiameterMm: 52, widthMm: 16, dynamicRatingN: 39000, staticRatingN: 95000, limitingSpeedRpm: 4500, mountingRole: "locating", applicationTags: THRUST },
];

export const TIMKEN_INCH: SeriesTemplate[] = [
  { seriesDesignation: "R 4", type: "deep_groove", family: "deep_groove_ball", series: "R", boreMm: 6.35, outerDiameterMm: 15.875, widthMm: 4.978, dynamicRatingN: 2240, staticRatingN: 950, limitingSpeedRpm: 32000, applicationTags: RADIAL, manufacturers: ["TIMKEN"] },
  { seriesDesignation: "R 6", type: "deep_groove", family: "deep_groove_ball", series: "R", boreMm: 9.525, outerDiameterMm: 22.225, widthMm: 5.556, dynamicRatingN: 3350, staticRatingN: 1500, limitingSpeedRpm: 28000, applicationTags: RADIAL, manufacturers: ["TIMKEN"] },
  { seriesDesignation: "R 8", type: "deep_groove", family: "deep_groove_ball", series: "R", boreMm: 12.7, outerDiameterMm: 28.575, widthMm: 7.938, dynamicRatingN: 4750, staticRatingN: 2240, limitingSpeedRpm: 24000, applicationTags: RADIAL, manufacturers: ["TIMKEN"] },
];

/** All templates merged for catalog build. */
export const ALL_SERIES_TEMPLATES: SeriesTemplate[] = [
  ...METRIC_DEEP_GROOVE,
  ...SEALED_DEEP_GROOVE,
  ...ANGULAR_CONTACT,
  ...CYLINDRICAL_NU,
  ...CYLINDRICAL_NJ,
  ...CYLINDRICAL_NUP,
  ...TAPERED_ROLLER,
  ...SPHERICAL_ROLLER,
  ...NEEDLE_ROLLER,
  ...SELF_ALIGNING,
  ...THRUST_BALL,
  ...TIMKEN_INCH,
];

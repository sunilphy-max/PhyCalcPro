/**
 * Bearing catalog metadata — families, application profiles, and entry schema.
 */

export type CatalogBearingType =
  | "deep_groove"
  | "angular_contact"
  | "cylindrical_roller"
  | "cylindrical_nj"
  | "cylindrical_nup"
  | "tapered_roller"
  | "spherical_roller"
  | "needle_roller"
  | "self_aligning_ball"
  | "thrust_ball";

export type BearingManufacturer = "SKF" | "FAG" | "NSK" | "TIMKEN" | "NTN";

export type BearingFamily =
  | "deep_groove_ball"
  | "angular_contact_ball"
  | "cylindrical_roller"
  | "tapered_roller"
  | "spherical_roller"
  | "needle_roller"
  | "self_aligning_ball"
  | "thrust_ball";

export type BearingSealType = "open" | "shielded" | "sealed" | "contact_sealed";

export type BearingClearance = "C2" | "CN" | "C3" | "C4";

export type BearingMountingRole = "locating" | "non_locating" | "either";

export type BearingDimensionSeries =
  | "extra_light"
  | "light"
  | "medium"
  | "heavy"
  | "thin_section"
  | "tapered_light"
  | "tapered_medium";

export type BearingApplicationProfile =
  | "general_radial"
  | "combined_loads"
  | "heavy_shock"
  | "high_speed"
  | "space_limited"
  | "pure_thrust"
  | "locating_bearing"
  | "floating_bearing";

/** @deprecated Use BearingManufacturer — kept for saved-project migration */
export type BearingCatalogTier = "skf_metric" | "inch" | "ina_fag";

/** @deprecated Use BearingManufacturer */
export type BearingCatalogSource = BearingManufacturer | "INCH" | "INA_FAG";

/** Optional per-designation ISO 281 screening factors (overrides solver defaults). */
export type BearingCatalogFactors = {
  X: number;
  Y: number;
  e: number;
};

export type BearingCatalogEntry = {
  designation: string;
  type: CatalogBearingType;
  family: BearingFamily;
  manufacturer: BearingManufacturer;
  /** Catalog series label, e.g. 62xx, 302xx, 222xx */
  series: string;
  dimensionSeries?: BearingDimensionSeries;
  sealType: BearingSealType;
  clearance: BearingClearance;
  mountingRole: BearingMountingRole;
  applicationTags: BearingApplicationProfile[];
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  dynamicRatingN: number;
  staticRatingN: number;
  limitingSpeedRpm: number;
  /** Reference speed (oil) where available — screening only */
  referenceSpeedRpm?: number;
  catalogFactors?: BearingCatalogFactors;
};

export type SeriesTemplate = {
  seriesDesignation: string;
  type: CatalogBearingType;
  family: BearingFamily;
  series: string;
  dimensionSeries?: BearingDimensionSeries;
  sealType?: BearingSealType;
  clearance?: BearingClearance;
  mountingRole?: BearingMountingRole;
  applicationTags?: BearingApplicationProfile[];
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  dynamicRatingN: number;
  staticRatingN: number;
  limitingSpeedRpm: number;
  referenceSpeedRpm?: number;
  catalogFactors?: BearingCatalogFactors;
  /** Limit expansion to specific manufacturers (e.g. Timken inch series) */
  manufacturers?: BearingManufacturer[];
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

export const BEARING_FAMILY_LABELS: Record<BearingFamily, string> = {
  deep_groove_ball: "Deep groove ball",
  angular_contact_ball: "Angular contact ball",
  cylindrical_roller: "Cylindrical roller (NU)",
  tapered_roller: "Tapered roller",
  spherical_roller: "Spherical roller",
  needle_roller: "Needle roller",
  self_aligning_ball: "Self-aligning ball",
  thrust_ball: "Thrust ball",
};

export const BEARING_TYPE_LABELS: Record<CatalogBearingType, string> = {
  deep_groove: "Deep groove ball",
  angular_contact: "Angular contact ball (40°)",
  cylindrical_roller: "Cylindrical roller (NU — float)",
  cylindrical_nj: "Cylindrical roller (NJ — locate)",
  cylindrical_nup: "Cylindrical roller (NUP — locate)",
  tapered_roller: "Tapered roller",
  spherical_roller: "Spherical roller",
  needle_roller: "Needle roller",
  self_aligning_ball: "Self-aligning ball",
  thrust_ball: "Thrust ball",
};

export const SEAL_TYPE_LABELS: Record<BearingSealType, string> = {
  open: "Open",
  shielded: "Shielded (Z)",
  sealed: "Sealed (RS/2RS)",
  contact_sealed: "Contact sealed",
};

export function familyForType(type: CatalogBearingType): BearingFamily {
  const map: Record<CatalogBearingType, BearingFamily> = {
    deep_groove: "deep_groove_ball",
    angular_contact: "angular_contact_ball",
    cylindrical_roller: "cylindrical_roller",
    cylindrical_nj: "cylindrical_roller",
    cylindrical_nup: "cylindrical_roller",
    tapered_roller: "tapered_roller",
    spherical_roller: "spherical_roller",
    needle_roller: "needle_roller",
    self_aligning_ball: "self_aligning_ball",
    thrust_ball: "thrust_ball",
  };
  return map[type];
}

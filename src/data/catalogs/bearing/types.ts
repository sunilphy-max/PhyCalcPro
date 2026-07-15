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
  | "toroidal_roller"
  | "needle_roller"
  | "self_aligning_ball"
  | "thrust_ball"
  | "thrust_cylindrical_roller"
  | "thrust_spherical_roller";

export type BearingManufacturer = "SKF" | "FAG" | "NSK" | "TIMKEN" | "NTN";

export type BearingFamily =
  | "deep_groove_ball"
  | "angular_contact_ball"
  | "cylindrical_roller"
  | "tapered_roller"
  | "spherical_roller"
  | "toroidal_roller"
  | "needle_roller"
  | "self_aligning_ball"
  | "thrust_ball"
  | "thrust_cylindrical_roller"
  | "thrust_spherical_roller";

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
  | "tapered_medium"
  | "inch";

/** Catalog dimension system — metric ISO or inch (ABMA / Timken). */
export type BearingUnitSystem = "metric" | "inch";

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
  /** Catalog series label, e.g. 62xx, 302xx, 222xx, C22xx, LM */
  series: string;
  dimensionSeries?: BearingDimensionSeries;
  /** Metric ISO vs inch ABMA / Timken cone-cup. */
  unitSystem: BearingUnitSystem;
  sealType: BearingSealType;
  clearance: BearingClearance;
  mountingRole: BearingMountingRole;
  applicationTags: BearingApplicationProfile[];
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  /** Bore in inches when unitSystem is inch (screening display). */
  boreIn?: number;
  outerDiameterIn?: number;
  widthIn?: number;
  dynamicRatingN: number;
  staticRatingN: number;
  limitingSpeedRpm: number;
  /** Reference speed (oil) where available — screening only */
  referenceSpeedRpm?: number;
  /** ISO / canonical size key for cross-manufacturer equivalence (e.g. 6205) */
  isoSize?: string;
  /** Screening mass (kg) */
  massKg?: number;
  /** Cage / retainer type */
  cageType?: string;
  /** Relative cost index (1.0 = baseline open deep groove). */
  costIndex?: number;
  /**
   * Fatigue load limit Pu (N) from datasheet when available.
   * Critical for aSKF / aISO at high P/C — prefer this over C-ratio estimates.
   */
  fatigueLoadLimitN?: number;
  /** True when Pu came from an explicit datasheet value (not a ratio estimate). */
  fatigueLoadLimitFromDatasheet?: boolean;
  /** Provenance of Pu — preferred over the boolean when present. */
  puSource?: "datasheet" | "c0_ratio" | "c_ratio";
  /** Contact angle (deg) for angular contact / tapered screening notes. */
  contactAngleDeg?: number;
  catalogFactors?: BearingCatalogFactors;
};

export type SeriesTemplate = {
  seriesDesignation: string;
  type: CatalogBearingType;
  family: BearingFamily;
  series: string;
  dimensionSeries?: BearingDimensionSeries;
  unitSystem?: BearingUnitSystem;
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
  /**
   * Fatigue load limit Pu (N). When set with puSource "datasheet", catalog build
   * OEM-scales it. When puSource is "c0_ratio"/"c_ratio" (or omitted after
   * withEstimatedPu), values are screening estimates — not datasheet.
   */
  fatigueLoadLimitN?: number;
  /** Set "datasheet" only for literal OEM figures; estimators set "c0_ratio". */
  puSource?: "datasheet" | "c0_ratio" | "c_ratio";
  contactAngleDeg?: number;
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
  toroidal_roller: "Toroidal roller (CARB)",
  needle_roller: "Needle roller",
  self_aligning_ball: "Self-aligning ball",
  thrust_ball: "Thrust ball",
  thrust_cylindrical_roller: "Cylindrical roller thrust",
  thrust_spherical_roller: "Spherical roller thrust",
};

export const BEARING_TYPE_LABELS: Record<CatalogBearingType, string> = {
  deep_groove: "Deep groove ball",
  angular_contact: "Angular contact ball (40°)",
  cylindrical_roller: "Cylindrical roller (NU — float)",
  cylindrical_nj: "Cylindrical roller (NJ — locate)",
  cylindrical_nup: "Cylindrical roller (NUP — locate)",
  tapered_roller: "Tapered roller",
  spherical_roller: "Spherical roller",
  toroidal_roller: "Toroidal roller (CARB)",
  needle_roller: "Needle roller",
  self_aligning_ball: "Self-aligning ball",
  thrust_ball: "Thrust ball",
  thrust_cylindrical_roller: "Cylindrical roller thrust",
  thrust_spherical_roller: "Spherical roller thrust",
};

export const SEAL_TYPE_LABELS: Record<BearingSealType, string> = {
  open: "Open",
  shielded: "Shielded (Z)",
  sealed: "Sealed (RS/2RS)",
  contact_sealed: "Contact sealed",
};

/** Roller families use life exponent p = 10/3; ball families use p = 3. */
export const ROLLER_BEARING_TYPES: readonly CatalogBearingType[] = [
  "cylindrical_roller",
  "cylindrical_nj",
  "cylindrical_nup",
  "tapered_roller",
  "spherical_roller",
  "toroidal_roller",
  "needle_roller",
  "thrust_cylindrical_roller",
  "thrust_spherical_roller",
] as const;

export function isRollerBearingType(type: CatalogBearingType): boolean {
  return (ROLLER_BEARING_TYPES as readonly string[]).includes(type);
}

export function isThrustBearingType(type: CatalogBearingType): boolean {
  return (
    type === "thrust_ball" ||
    type === "thrust_cylindrical_roller" ||
    type === "thrust_spherical_roller"
  );
}

export function familyForType(type: CatalogBearingType): BearingFamily {
  const map: Record<CatalogBearingType, BearingFamily> = {
    deep_groove: "deep_groove_ball",
    angular_contact: "angular_contact_ball",
    cylindrical_roller: "cylindrical_roller",
    cylindrical_nj: "cylindrical_roller",
    cylindrical_nup: "cylindrical_roller",
    tapered_roller: "tapered_roller",
    spherical_roller: "spherical_roller",
    toroidal_roller: "toroidal_roller",
    needle_roller: "needle_roller",
    self_aligning_ball: "self_aligning_ball",
    thrust_ball: "thrust_ball",
    thrust_cylindrical_roller: "thrust_cylindrical_roller",
    thrust_spherical_roller: "thrust_spherical_roller",
  };
  return map[type];
}

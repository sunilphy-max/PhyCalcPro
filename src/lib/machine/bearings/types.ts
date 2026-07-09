/**
 * Bearing Design Module Types
 */

import type {
  BearingManufacturer,
  BearingCatalogTier,
  CatalogBearingType,
  BearingApplicationProfile,
  BearingSealType,
} from "@/data/catalogs/bearingCatalog";

export type {
  BearingManufacturer,
  BearingCatalogTier,
  BearingApplicationProfile,
  BearingSealType,
};

/** Solver bearing type — mirrors catalog types */
export type BearingType = CatalogBearingType;

export type BearingMaterial = {
  name: string;
  dynamicRatingFactor: number;
  staticRatingFactor: number;
  allowableLife: number;
};

export type BearingReliability = 90 | 95 | 96 | 97 | 98 | 99;

/** Simplified ISO 281 modified-life lubrication screening (a_ISO). */
export type LubricationClass = "poor" | "average" | "good";

/** Paired / duplex mounting (MITCalc-style layout). */
export type BearingArrangement = "single" | "back_to_back" | "face_to_face" | "tandem";

export type BearingConfig = {
  radialLoad: number;
  axialLoad: number;
  speed: number;
  lifeHours: number;
  safetyFactor: number;
  bearingType: BearingType;
  dynamicLoadRatingN?: number;
  staticLoadRatingN?: number;
  limitingSpeedRpm?: number;
  designation?: string;
  reliabilityPercent?: BearingReliability;
  lubricationClass?: LubricationClass;
  /** Preferred bearing manufacturer for catalog lookup and auto-design */
  manufacturer?: BearingManufacturer;
  /** Application profile for catalog filtering in design mode */
  applicationProfile?: BearingApplicationProfile | "all";
  /** @deprecated Use manufacturer — kept for saved projects */
  catalogTier?: BearingCatalogTier;
  arrangement?: BearingArrangement;
  /** Per-designation X/Y/e override from catalog entry */
  catalogFactors?: { X: number; Y: number; e: number };
  /** Target static safety factor s₀ = C₀/P₀ (default 1.0) */
  targetStaticSafetyFactor?: number;
  /** Minimum speed margin n_lim / n (default 1.0) */
  targetSpeedMargin?: number;
  material: BearingMaterial;
};

export type BearingGeometry = {
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
};

export type BearingResult = {
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  staticEquivalentLoad: number;
  requiredDynamicRating: number;
  requiredStaticRating: number;
  expectedLife: number;
  modifiedLife: number;
  expectedLifeRevolutions: number;
  dynamicLoadRatingN: number;
  staticLoadRatingN: number;
  limitingSpeedRpm: number | null;
  lifeExponent: number;
  a1: number;
  aIso: number;
  dynamicUtilization: number;
  staticSafetyFactor: number;
  speedMargin: number | null;
  lifeUtilization: number;
  safetyFactor: number;
  bearingType: BearingType;
  designation?: string;
  geometry: BearingGeometry | null;
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
  governingFailureMode: string;
  material: BearingMaterial;
};

/**
 * Bearing Design Module Types
 */

import type {
  BearingManufacturer,
  BearingCatalogTier,
  CatalogBearingType,
  BearingApplicationProfile,
  BearingSealType,
  BearingClearance,
} from "@/data/catalogs/bearingCatalog";
import type { ContaminationLevel } from "./iso281Life";
import type { FitRecommendation } from "./fitsClearance";
import type { LoadSpectrumStep } from "./variableLoad";
import type { ModifiedLifeFactors } from "./iso281Life";

export type {
  BearingManufacturer,
  BearingCatalogTier,
  BearingApplicationProfile,
  BearingSealType,
  ContaminationLevel,
  LoadSpectrumStep,
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

/** @deprecated Prefer lubricantType + isoVgGrade + contamination for full ISO 281 aISO */
export type LubricationClass = "poor" | "average" | "good";

export type LubricantType = "oil" | "grease" | "none";

/** Paired / duplex mounting (MITCalc-style layout). */
export type BearingArrangement = "single" | "back_to_back" | "face_to_face" | "tandem";

export type PairedStationResult = {
  index: number;
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  staticEquivalentLoad: number;
  basicLifeHours: number;
  modifiedLifeHours: number;
};

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
  /** Legacy simplified lubrication — used when full lubricant inputs absent */
  lubricationClass?: LubricationClass;
  /** Full ISO 281 lubrication inputs */
  lubricantType?: LubricantType;
  isoVgGrade?: number;
  operatingTempC?: number;
  kinematicViscosityCst?: number;
  contamination?: ContaminationLevel;
  fatigueLoadLimitN?: number;
  boreMm?: number;
  outerDiameterMm?: number;
  clearance?: BearingClearance;
  sealed?: boolean;
  /** ISO 281-1 variable load spectrum */
  loadSpectrum?: LoadSpectrumStep[];
  manufacturer?: BearingManufacturer;
  applicationProfile?: BearingApplicationProfile | "all";
  /** @deprecated Use manufacturer — kept for saved projects */
  catalogTier?: BearingCatalogTier;
  arrangement?: BearingArrangement;
  catalogFactors?: { X: number; Y: number; e: number };
  targetStaticSafetyFactor?: number;
  targetSpeedMargin?: number;
  material: BearingMaterial;
  fitRecommendation?: FitRecommendation;
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
  modifiedLifeFactors: ModifiedLifeFactors;
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
  arrangement: BearingArrangement;
  pairedStations?: PairedStationResult[];
  minimumRadialLoadN: number;
  minLoadSatisfied: boolean;
  frictionTorqueNm: number;
  powerLossW: number;
  temperatureDeratingFactor: number;
  fitRecommendation?: FitRecommendation;
};

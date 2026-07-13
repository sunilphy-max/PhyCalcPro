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
  BearingClearance,
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

export type BearingPreloadClass = "none" | "light" | "medium" | "heavy";

export type PairedStationResult = {
  index: number;
  role?: "locating" | "floating" | "duplex_a" | "duplex_b";
  label?: string;
  designation?: string;
  bearingType?: BearingType;
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  staticEquivalentLoad: number;
  basicLifeHours: number;
  modifiedLifeHours: number;
  dynamicRatingN?: number;
  dynamicUtilization?: number;
};

export type ThermalExpansionCheck = {
  deltaTempK: number;
  requiredFloatMm: number;
  availableFloatMm: number;
  floatMarginMm: number;
  floatUtilization: number;
  status: "ok" | "marginal" | "insufficient";
  note: string;
};

export type DuplexStiffnessCheck = {
  preloadForceN: number;
  preloadClass: BearingPreloadClass;
  axialStiffnessNPerUm: number;
  radialStiffnessNPerUm: number;
  momentStiffnessNmPerMrad: number;
  arrangementLabel: string;
  comparisonNote: string;
};

export type ThermalEquilibriumCheck = {
  ambientTempC: number;
  equilibriumTempC: number;
  operatingTempC: number;
  deltaTempK: number;
  powerLossW: number;
  frictionTorqueNm: number;
  thermalResistanceKW: number;
  viscosityCst: number | null;
  usedSpecifiedTemp: boolean;
  note: string;
};

export type RelubricationCheck = {
  intervalHours: number;
  speedFactorNdm: number;
  temperatureFactor: number;
  loadFactor: number;
  contaminationFactor: number;
  status: "ok" | "frequent" | "critical";
  note: string;
  /** grease_life | relubrication | oil_service | none */
  mode?: "grease_life" | "relubrication" | "oil_service" | "none";
  /** Sealed / for-life grease L10h (hours). */
  greaseLifeHours?: number | null;
  /** Open bearing replenishment interval (hours). */
  relubricationIntervalHours?: number | null;
  fillFactor?: number;
};

export type DefectFrequenciesCheck = {
  shaftHz: number;
  bpfoHz: number;
  bpfiHz: number;
  bsfHz: number;
  ftfHz: number;
  bpfoOrder: number;
  bpfiOrder: number;
  bsfOrder: number;
  ftfOrder: number;
  rollingElementCount: number;
  note: string;
};

export type AdjustedReferenceSpeedCheck = {
  nRefBaseRpm: number;
  nAdjRpm: number;
  nAdjMargin: number;
  loadFactor: number;
  viscosityFactor: number;
  lubricantFactor: number;
  sealFactor: number;
  note: string;
};

export type EnergyCo2Check = {
  powerLossW: number;
  annualEnergyKwh: number;
  annualCo2Kg: number;
  operatingHoursPerYear: number;
  gridKgCo2PerKwh: number;
  note: string;
};

/**
 * Life calculation method.
 * - iso281: basic ISO 281 L₁₀ / Lnm (a₁·aISO)
 * - iso16281_screen: ISO 16281-inspired P adjustment (clearance, misalignment, distribution)
 * - stress_life_screen: transparent contact/film stress-life modifier (not SKF GBLM/AFC)
 */
export type BearingLifeMethod = "iso281" | "iso16281_screen" | "stress_life_screen";

export type RollingElementMaterial = "steel" | "hybrid_ceramic" | "full_ceramic";

/** Screening-grade advanced life factor breakdown (ISO 16281 / stress-life / hybrid). */
export type AdvancedLifeFactors = {
  lifeMethod: BearingLifeMethod;
  misalignmentUsedMrad: number;
  misalignmentCapacityMrad: number;
  /** Multiplier on equivalent load P (ISO 16281 screen path). */
  fClearance: number;
  fMisalign: number;
  fDistrib: number;
  /** ISO 281 P before advanced adjustment. */
  PbaseN: number;
  /** P used for life (may equal Pbase for iso281 / stress-life). */
  PadjN: number;
  /** Stress-life surface modifier (1 when method is not stress_life_screen). */
  aStress: number;
  /** Misalignment life derate when not folded into P (iso281 / stress-life). */
  aMis: number;
  hybridLifeFactor: number;
  hybridDynamicRatingFactor: number;
  hybridSpeedFactor: number;
  /** Combined life modification beyond a₁·aISO applied to Lnm. */
  aAdvanced: number;
  contactPressureProxyMpa: number | null;
  note: string;
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
  referenceSpeedRpm?: number;
  designation?: string;
  /** Second station designation for locating+floating systems. */
  floatingDesignation?: string;
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
  /**
   * Locating + floating shaft layout (DG+NU / AC+NU).
   * When set (and arrangement is single), solver reports two stations.
   */
  mountingSystem?: "single" | "locating_floating" | "duplex";
  /** Locating family when mountingSystem is locating_floating. */
  locatingBearingType?: BearingType;
  /** Floating family when mountingSystem is locating_floating. */
  floatingBearingType?: BearingType;
  /** Duplex preload class (O/X/T). */
  preloadClass?: BearingPreloadClass;
  /** Override preload force (N). */
  preloadForceN?: number;
  /** Contact angle for stiffness (deg). */
  contactAngleDeg?: number;
  /** Bearing span for thermal expansion (mm). */
  bearingSpanMm?: number;
  /** Available axial float at floating bearing (mm). */
  availableFloatMm?: number;
  /**
   * Per-station radial reactions from shaft FBD (N).
   * When length ≥ 2 and mounting is locating_floating, overrides Fr/2 split.
   */
  stationRadialLoadsN?: number[];
  /** Ambient temperature for thermal equilibrium (°C). */
  ambientTempC?: number;
  /** If true, solve equilibrium temp instead of trusting operatingTempC alone. */
  useThermalEquilibrium?: boolean;
  catalogFactors?: { X: number; Y: number; e: number };
  targetStaticSafetyFactor?: number;
  targetSpeedMargin?: number;
  material: BearingMaterial;
  fitRecommendation?: FitRecommendation;
  /** Life model method — default iso281. */
  lifeMethod?: BearingLifeMethod;
  /** Manual misalignment angle (mrad). Combined with stationSlopesMrad as max. */
  misalignmentAngleMrad?: number;
  /**
   * Per-station shaft slopes at bearings (mrad) from shaft FEM handoff.
   * Effective misalignment = max(manual, …stationSlopes).
   */
  stationSlopesMrad?: number[];
  /** Rolling-element material — ISO 20056-inspired hybrid/full ceramic modifiers. */
  rollingElementMaterial?: RollingElementMaterial;
  /** Override operating clearance (μm) for ISO 16281 screening; else from fits. */
  operatingClearanceUm?: number;
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
  /** n_ref / n when catalog reference speed is available (SKF lubrication screening). */
  referenceSpeedMargin: number | null;
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
  thermalExpansion?: ThermalExpansionCheck;
  duplexStiffness?: DuplexStiffnessCheck;
  thermalEquilibrium?: ThermalEquilibriumCheck;
  relubrication?: RelubricationCheck;
  defectFrequencies?: DefectFrequenciesCheck;
  adjustedReferenceSpeed?: AdjustedReferenceSpeedCheck;
  energyCo2?: EnergyCo2Check;
  /** First-failure (min station) modified life. */
  systemMinLifeHours?: number;
  /** Weibull multi-bearing system life L_sys. */
  weibullSystemLifeHours?: number;
  /** Life safety Lnm / L_req. */
  lifeSafetyFactor?: number;
  minimumRadialLoadN: number;
  minLoadSatisfied: boolean;
  frictionTorqueNm: number;
  powerLossW: number;
  temperatureDeratingFactor: number;
  fitRecommendation?: FitRecommendation;
  /** Active life method used for Lnm. */
  lifeMethod: BearingLifeMethod;
  /** Effective misalignment angle used (mrad). */
  misalignmentUsedMrad?: number;
  /** Screening advanced-life factor breakdown (16281 / stress-life / hybrid). */
  advancedLifeFactors?: AdvancedLifeFactors;
};

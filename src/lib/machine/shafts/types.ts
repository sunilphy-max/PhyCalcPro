/**
 * Shaft Design Module Types
 */

import type { SurfaceFinish } from "@/lib/materials/fatigue/types";
import type { Din743WorksheetOptions, Din743WorksheetResult } from "./din743/types";
import type {
  Agma6001DutyClass,
  Agma6001InterfaceKind,
  Agma6001LoadTemplate,
} from "./agma6001/interfaceLoads";

export type ShaftMaterial = {
  name: string;
  E: number;
  G: number;
  density: number;
  yieldStress: number;
  /** Ultimate tensile strength — required for fatigue screening */
  ultimateStrength: number;
};

export type ShaftSegment = {
  length: number;
  outerDiameter: number;
  innerDiameter?: number;
};

export type ShaftGeometry = {
  /** Total span (m); when segments are set, should equal sum of segment lengths */
  length: number;
  /** Uniform diameter (m) — used when segments is empty */
  diameter: number;
  /** Stepped or hollow sections along the shaft */
  segments?: ShaftSegment[];
};

export type BearingSupportType = "fixed" | "pin";

export type BearingSupport = {
  position: number;
  type: BearingSupportType;
};

/** Typed station for loading-diagram graphics (inferred when omitted). */
export type ShaftLoadKind = "gear" | "pulley" | "torque" | "bending" | "force";

export type LoadCase = {
  position: number;
  torque?: number;
  bendingMoment?: number;
  axialForce?: number;
  /** Transverse force in the lateral (Y) direction (N) */
  transverseForce?: number;
  /** Optional diagram icon; inferred from components when omitted */
  kind?: ShaftLoadKind;
};

export type StressFeatureType = "shoulder_fillet" | "keyway" | "retaining_ring" | "custom";

export type KeywayStyle = "sled_runner" | "end_milled";

export type StressFeature = {
  position: number;
  type: StressFeatureType;
  /** Larger diameter (m) for shoulder fillet */
  largerDiameter?: number;
  /** Smaller diameter (m) for shoulder fillet */
  smallerDiameter?: number;
  /** Fillet radius (m) */
  filletRadius?: number;
  /** Keyway style (default sled_runner) */
  keywayStyle?: KeywayStyle;
  /** Retaining-ring groove depth (m) */
  grooveDepth?: number;
  /** Retaining-ring groove width (m) */
  grooveWidth?: number;
  /** Axial thrust retained by the ring (N) — for capacity check */
  axialRetentionLoad?: number;
  customKt?: number;
};

export type ShaftFatigueOptions = {
  enabled: boolean;
  surfaceFinish?: SurfaceFinish;
  /** Alternating torque fraction (0–1) for pulsating torsion */
  alternatingTorqueFraction?: number;
  /** Use fatigue stress concentration Kf = 1+q(Kt−1); default true */
  useNotchSensitivity?: boolean;
};

/** DIN 743 influence and fatigue reduction coefficients (worksheet inputs / overrides). */
export type ShaftDin743Coefficients = {
  /** Bending stress influence factor K_σ (default 1; auto from DIN 743-2 when worksheet runs) */
  K_sigma?: number;
  /** Torsion stress influence factor K_τ (default 1) */
  K_tau?: number;
  /** Fatigue strength reduction / yield enlargement factor γ_F (default 1) */
  gamma_F?: number;
};

export type ShaftAgma6001Options = {
  enabled?: boolean;
  interfaceKind?: Agma6001InterfaceKind;
  duty?: Agma6001DutyClass;
};

export type ShaftAnalysisLimits = {
  /** Max deflection as span / ratio (default 1000) */
  deflectionLimitRatio?: number;
  /** Max slope at bearings (rad, default 0.001) */
  slopeLimitRad?: number;
  /** Minimum critical speed margin ω_cr / ω_op (default 1.25) */
  criticalSpeedMarginMin?: number;
  /** Target static safety factor (default 1.5) */
  targetStaticSafetyFactor?: number;
  /** Target fatigue safety factor (default 1.5) */
  targetFatigueSafetyFactor?: number;
  /** Target bearing L10 life for screening (hours, default 20000) */
  targetBearingLifeHours?: number;
};

export type ShaftConfig = {
  geometry: ShaftGeometry;
  material: ShaftMaterial;
  loads: LoadCase[];
  supports?: BearingSupport[];
  stressFeatures?: StressFeature[];
  meshSegments?: number;
  /** Global Kt fallback when no feature is defined at a section */
  stressConcentrationFactor?: number;
  operatingRpm?: number;
  includeSelfWeight?: boolean;
  fatigue?: ShaftFatigueOptions;
  /** Legacy / manual DIN multipliers (overrides when > 1) */
  din743?: ShaftDin743Coefficients;
  /** Full DIN 743-1/2/3 EU worksheet options */
  din743Worksheet?: Din743WorksheetOptions;
  /** AGMA 6001 interface load template (US) */
  agma6001?: ShaftAgma6001Options;
  limits?: ShaftAnalysisLimits;
  /** Optional key length override for integrated key sizing (m) */
  keyLength?: number;
};

export type BearingReaction = {
  position: number;
  forceY: number;
  forceZ: number;
  momentY: number;
  momentZ: number;
};

export type ShaftFatigueDetail = {
  safetyFactor: number;
  bendingSf: number;
  torsionSf: number;
  combinedSf: number;
  sigmaA: number;
  sigmaM: number;
  tauA: number;
  tauM: number;
  vonMisesA: number;
  vonMisesM: number;
  correctedEndurance: number;
  ultimateStrength: number;
  /** Mean-stress axis for Goodman plot (Pa) */
  goodmanMean: number[];
  /** Allowable alternating stress on Goodman line (Pa) */
  goodmanAllowable: number[];
};

export type ShaftKeysDesign = {
  shaftDiameter: number;
  width: number;
  height: number;
  length: number;
  shearStress: number;
  bearingStress: number;
  shearSafety: number;
  bearingSafety: number;
  capacityTorque: number;
  appliedTorque: number;
  standard: string;
  status: "safe" | "warning" | "critical";
};

export type ShaftRetainingRingCheck = {
  position: number;
  grooveDepth: number;
  grooveWidth: number;
  kt: number;
  kf: number;
  axialCapacity: number;
  axialLoad: number;
  safetyFactor: number;
  status: "safe" | "warning" | "critical" | "n/a";
};

export type ShaftBearingLifeScreen = {
  position: number;
  radialForce: number;
  slopeRad: number;
  requiredDynamicRating: number;
  /** Rough catalog C estimate for this bore (N); null if unavailable */
  estimatedDynamicRating: number | null;
  estimatedL10Hours: number | null;
  targetLifeHours: number;
  status: "safe" | "warning" | "critical" | "n/a";
};

export type ShaftResult = {
  x: number[];
  torqueDistribution: number[];
  bendingMomentDistribution: number[];
  shearForce: number[];
  shearStress: number[];
  bendingStress: number[];
  vonMisesStress: number[];
  /** Max principal stress σ₁ along shaft (Pa), Kt-adjusted */
  principalStress: number[];
  deflection: number[];
  slope: number[];
  rotation: number[];
  stressConcentrationFactor: number[];
  /** Fatigue stress concentration Kf along shaft */
  fatigueConcentrationFactor: number[];

  maxStress: number;
  /** Peak Kt-adjusted max principal stress (Pa) */
  maxPrincipalStress: number;
  maxShearStress: number;
  maxBendingStress: number;
  maxDeflection: number;
  maxSlope: number;
  maxTorque: number;
  maxBendingMoment: number;
  maxShearForce: number;
  safetyFactor: number;

  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
  governingFailureMode: string;

  criticalSection: number;
  criticalSpeed: number;
  criticalSpeedModes: number[];
  criticalSpeedMargin: number | null;

  fatigueSafetyFactor: number | null;
  fatigueStatus: "safe" | "warning" | "critical" | "n/a";
  fatigueDetail: ShaftFatigueDetail | null;

  deflectionUtilization: number;
  slopeUtilization: number;

  bearingReactions: BearingReaction[];
  bearingSlopes: { position: number; slopeRad: number }[];
  bearingLifeScreens: ShaftBearingLifeScreen[];

  keysDesign: ShaftKeysDesign | null;
  retainingRingChecks: ShaftRetainingRingCheck[];

  /** DIN 743-1/2/3 EU multi-station worksheet (null only if explicitly disabled) */
  din743Worksheet: Din743WorksheetResult | null;
  /** AGMA 6001 interface load template when enabled */
  agma6001Template: Agma6001LoadTemplate | null;

  analysisType: "FEA";

  diameter?: number;
  radius?: number;
  polarMoment?: number;
  secondMoment?: number;
};

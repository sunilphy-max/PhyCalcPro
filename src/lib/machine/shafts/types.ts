/**
 * Shaft Design Module Types
 */

import type { SurfaceFinish } from "@/lib/materials/fatigue/types";

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

export type LoadCase = {
  position: number;
  torque?: number;
  bendingMoment?: number;
  axialForce?: number;
  /** Transverse force in the lateral (Y) direction (N) */
  transverseForce?: number;
};

export type StressFeatureType = "shoulder_fillet" | "keyway" | "custom";

export type StressFeature = {
  position: number;
  type: StressFeatureType;
  /** Larger diameter (m) for shoulder fillet */
  largerDiameter?: number;
  /** Smaller diameter (m) for shoulder fillet */
  smallerDiameter?: number;
  /** Fillet radius (m) */
  filletRadius?: number;
  customKt?: number;
};

export type ShaftFatigueOptions = {
  enabled: boolean;
  surfaceFinish?: SurfaceFinish;
  /** Alternating torque fraction (0–1) for pulsating torsion */
  alternatingTorqueFraction?: number;
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
  limits?: ShaftAnalysisLimits;
};

export type BearingReaction = {
  position: number;
  forceY: number;
  forceZ: number;
  momentY: number;
  momentZ: number;
};

export type ShaftResult = {
  x: number[];
  torqueDistribution: number[];
  bendingMomentDistribution: number[];
  shearForce: number[];
  shearStress: number[];
  bendingStress: number[];
  vonMisesStress: number[];
  deflection: number[];
  slope: number[];
  rotation: number[];
  stressConcentrationFactor: number[];

  maxStress: number;
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

  deflectionUtilization: number;
  slopeUtilization: number;

  bearingReactions: BearingReaction[];
  bearingSlopes: { position: number; slopeRad: number }[];

  analysisType: "FEA";

  diameter?: number;
  radius?: number;
  polarMoment?: number;
  secondMoment?: number;
};

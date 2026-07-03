import type { SpringEndCondition } from "../shared/helicalCommon";
import type { SpringWireType } from "../shared/wireStrength";
import type { En13906LifeClass, En13906WireQuality } from "../shared/en13906Fatigue";

export type { SpringWireType };

export type CompressionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  modulus: number;
  deflection: number;
  ultimateStrength: number;
  wireType?: SpringWireType;
  density?: number;
  endCondition?: SpringEndCondition;
  operatingFrequencyHz?: number;
  targetSafetyFactor?: number;
  /** Minimum operating frequency margin f_surge / f_operating (default 10) */
  targetSurgeMargin?: number;
  /** Minimum deflection for fatigue range (0 = fully relaxed) */
  minDeflection?: number;
  lifeClass?: En13906LifeClass;
  loadCycles?: number;
  wireQuality?: En13906WireQuality;
  enableFatigueCheck?: boolean;
};

export type CompressionSpringResult = {
  springRate: number;
  solidHeight: number;
  loadedLength: number;
  solidHeightClearance: number;
  maxLoad: number;
  shearStress: number;
  allowableShearStress: number;
  wireUltimateStrength: number;
  safetyFactor: number;
  stressUtilization: number;
  naturalFrequency: number;
  surgeMargin: number | null;
  springIndex: number;
  wahlFactor: number;
  slenderness: number;
  bucklingLimit: number;
  bucklingRisk: boolean;
  outerDiameter: number;
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
  governingFailureMode: string;
  fatigueSafetyFactor: number | null;
  fatigueUtilization: number | null;
  fatiguePass: boolean | null;
  lifeClass: En13906LifeClass | null;
};

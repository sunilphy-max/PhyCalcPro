import type { SpringEndCondition } from "../shared/helicalCommon";
import type { SpringWireType, HookType } from "../shared/wireStrength";
import type { CompressionSpringResult } from "../compression-springs/types";
import type { En13906LifeClass, En13906WireQuality } from "../shared/en13906Fatigue";

export type ExtensionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  modulus: number;
  deflection: number;
  ultimateStrength: number;
  wireType?: SpringWireType;
  density?: number;
  initialTension?: number;
  hookType?: HookType;
  operatingFrequencyHz?: number;
  targetSafetyFactor?: number;
  targetSurgeMargin?: number;
  endCondition?: SpringEndCondition;
  minDeflection?: number;
  lifeClass?: En13906LifeClass;
  loadCycles?: number;
  wireQuality?: En13906WireQuality;
  enableFatigueCheck?: boolean;
};

export type ExtensionSpringResult = CompressionSpringResult & {
  initialTension: number;
  maxInitialTension: number;
  initialTensionValid: boolean;
  forceAtExtension: number;
  bodyShearStress: number;
  hookShearStress: number;
  hookFactor: number;
  hookType: HookType;
  bodySafetyFactor: number;
  hookSafetyFactor: number;
  coilBindLength: number;
  extendedLength: number;
};

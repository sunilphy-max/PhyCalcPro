import type { SpringWireType } from "../shared/wireStrength";
import type { En13906LifeClass, En13906WireQuality } from "../shared/en13906Fatigue";

export type TorsionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  legLength: number;
  modulus: number;
  deflectionAngleDeg: number;
  ultimateStrength: number;
  wireType?: SpringWireType;
  targetSafetyFactor?: number;
  minDeflectionAngleDeg?: number;
  lifeClass?: En13906LifeClass;
  loadCycles?: number;
  wireQuality?: En13906WireQuality;
  enableFatigueCheck?: boolean;
};

export type TorsionSpringResult = {
  springRate: number;
  torque: number;
  bendingStress: number;
  allowableBendingStress: number;
  wireUltimateStrength: number;
  legForce: number;
  legBendingStress: number;
  safetyFactor: number;
  stressUtilization: number;
  springIndex: number;
  curvatureFactor: number;
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
  governingFailureMode: string;
  fatigueSafetyFactor: number | null;
  fatigueUtilization: number | null;
  fatiguePass: boolean | null;
  lifeClass: En13906LifeClass | null;
};

import {
  allowableBendingStress,
  springIndex,
  torsionCurvatureFactor,
  determineSpringStatus,
} from "../shared/helicalCommon";
import { wireUltimateStrengthPa, type SpringWireType } from "../shared/wireStrength";
import { en13906BendingFatigueCheck } from "../shared/en13906Fatigue";
import type { TorsionSpringConfig, TorsionSpringResult } from "./types";

export function solveTorsionSpringEngine(c: TorsionSpringConfig): TorsionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const E = c.modulus;
  const targetSf = c.targetSafetyFactor ?? 1.5;

  const C = springIndex(D, d);
  const Kb = torsionCurvatureFactor(C);

  // Shigley Eq. 10-37: k = E·d⁴/(64·D·n) [N·m/rad]
  const springRate = (E * d ** 4) / (64 * D * n);
  const angleRad = (c.deflectionAngleDeg * Math.PI) / 180;
  const minAngleRad = (Math.max(c.minDeflectionAngleDeg ?? 0, 0) * Math.PI) / 180;
  const torque = springRate * angleRad;
  const torqueMin = springRate * minAngleRad;

  const bendingStress = (Kb * 32 * torque) / (Math.PI * d ** 3);
  const bendingStressMin = (Kb * 32 * torqueMin) / (Math.PI * d ** 3);

  const wireUltimate = wireUltimateStrengthPa(c.wireType, d, c.ultimateStrength);
  const allowableBending = allowableBendingStress(wireUltimate);
  const safetyFactor = allowableBending / Math.max(bendingStress, 1e-9);
  const stressUtilization = bendingStress / Math.max(allowableBending, 1e-9);

  const legLength = Math.max(c.legLength, 1e-9);
  const legForce = torque / Math.max(legLength, 1e-9);
  const legBendingStress = (6 * legForce * legLength) / (Math.max(d, 1e-9) ** 3);

  const indexInRange = C >= 4 && C <= 14;

  const fatigueEnabled =
    c.enableFatigueCheck === true ||
    (c.minDeflectionAngleDeg != null && c.minDeflectionAngleDeg >= 0 && c.deflectionAngleDeg > minAngleRad);
  const fatigue = en13906BendingFatigueCheck({
    sigmaMax: bendingStress,
    sigmaMin: bendingStressMin,
    ultimateStrength: wireUltimate,
    wireDiameterM: d,
    staticAllowableBending: allowableBending,
    lifeClass: c.lifeClass,
    loadCycles: c.loadCycles,
    wireQuality: c.wireQuality,
    enabled: fatigueEnabled && c.deflectionAngleDeg > 0,
  });

  const governingSf = fatigue.enabled
    ? Math.min(safetyFactor, fatigue.fatigueSafetyFactor)
    : safetyFactor;

  const { designStatus, isSafe, governing } = determineSpringStatus({
    safetyFactor: governingSf,
    targetSf,
    bucklingRisk: false,
    solidClearance: 1,
    surgeMargin: null,
    targetSurgeMargin: 10,
    indexInRange,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
  });

  let governingFailureMode = governing;
  if (fatigue.enabled && fatigue.fatigueSafetyFactor < safetyFactor) {
    governingFailureMode = "Fatigue (EN 13906)";
  }

  return {
    springRate,
    torque,
    bendingStress,
    allowableBendingStress: allowableBending,
    wireUltimateStrength: wireUltimate,
    legForce,
    legBendingStress,
    safetyFactor,
    stressUtilization,
    springIndex: C,
    curvatureFactor: Kb,
    designStatus,
    isSafe: isSafe && (!fatigue.enabled || fatigue.fatiguePass),
    governingFailureMode,
    fatigueSafetyFactor: fatigue.enabled ? fatigue.fatigueSafetyFactor : null,
    fatigueUtilization: fatigue.enabled ? fatigue.fatigueUtilization : null,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
    lifeClass: fatigue.enabled ? fatigue.lifeClass : null,
  };
}

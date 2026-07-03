import { solveCompressionSpringEngine } from "../compression-springs/engine";
import {
  helicalShearStress,
  helicalSpringRate,
  springIndex,
  wahlFactor,
  activeCoilMass,
  surgeFrequencyHz,
  en13906AllowableShear,
  determineSpringStatus,
} from "../shared/helicalCommon";
import {
  wireUltimateStrengthPa,
  maxInitialTensionEstimate,
  HOOK_STRESS_FACTOR,
  type HookType,
} from "../shared/wireStrength";
import { en13906ShearFatigueCheck } from "../shared/en13906Fatigue";
import type { ExtensionSpringConfig, ExtensionSpringResult } from "./types";

export function solveExtensionSpringEngine(c: ExtensionSpringConfig): ExtensionSpringResult {
  const base = solveCompressionSpringEngine(c);
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const C = springIndex(D, d);
  const Kw = wahlFactor(C);

  const wireUltimate = wireUltimateStrengthPa(c.wireType, d, c.ultimateStrength);
  const allowableShear = en13906AllowableShear(wireUltimate);
  const FiMax = maxInitialTensionEstimate(allowableShear * 0.3, d, D, Kw);

  const initialTension =
    c.initialTension != null && c.initialTension >= 0
      ? c.initialTension
      : Math.min(FiMax * 0.5, base.springRate * 0.02);

  const hookType: HookType = c.hookType ?? "machine";
  const hookFactor = HOOK_STRESS_FACTOR[hookType];

  const forceAtExtension = initialTension + base.maxLoad;
  const minDeflection = Math.max(c.minDeflection ?? 0, 0);
  const forceAtMin = initialTension + base.springRate * minDeflection;
  const bodyShearStress = helicalShearStress(forceAtExtension, D, d, Kw);
  const bodyShearStressMin = helicalShearStress(forceAtMin, D, d, Kw);
  const hookShearStress = bodyShearStress * hookFactor;

  const bodySf = allowableShear / Math.max(bodyShearStress, 1e-9);
  const hookSf = allowableShear / Math.max(hookShearStress, 1e-9);
  const safetyFactor = Math.min(bodySf, hookSf);

  const initialTensionValid = initialTension <= FiMax;
  const coilBindLength = c.activeCoils * d;
  const extendedLength = c.freeLength + c.deflection + 2 * d;

  const fatigueEnabled =
    c.enableFatigueCheck === true || (c.minDeflection != null && c.minDeflection >= 0 && c.deflection > minDeflection);
  const fatigue = en13906ShearFatigueCheck({
    tauMax: bodyShearStress,
    tauMin: bodyShearStressMin,
    ultimateStrength: wireUltimate,
    wireDiameterM: d,
    staticAllowableShear: allowableShear,
    lifeClass: c.lifeClass,
    loadCycles: c.loadCycles,
    wireQuality: c.wireQuality,
    enabled: fatigueEnabled && c.deflection > 0,
  });

  const governingSf = fatigue.enabled
    ? Math.min(safetyFactor, fatigue.fatigueSafetyFactor)
    : safetyFactor;

  const { designStatus, isSafe, governing } = determineSpringStatus({
    safetyFactor: governingSf,
    targetSf: c.targetSafetyFactor ?? 1.5,
    bucklingRisk: false,
    solidClearance: 1,
    surgeMargin: base.surgeMargin,
    targetSurgeMargin: c.targetSurgeMargin ?? 10,
    indexInRange: C >= 4 && C <= 12,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
  });

  let governingFailureMode = governing;
  if (!initialTensionValid) governingFailureMode = "Initial tension too high";
  else if (hookSf < bodySf) governingFailureMode = "Hook stress";
  else if (fatigue.enabled && fatigue.fatigueSafetyFactor < bodySf) {
    governingFailureMode = "Fatigue (EN 13906)";
  }

  return {
    ...base,
    initialTension,
    maxInitialTension: FiMax,
    initialTensionValid,
    forceAtExtension,
    bodyShearStress,
    hookShearStress,
    hookFactor,
    hookType,
    bodySafetyFactor: bodySf,
    hookSafetyFactor: hookSf,
    safetyFactor,
    stressUtilization: bodyShearStress / Math.max(allowableShear, 1e-9),
    coilBindLength,
    extendedLength,
    designStatus: !initialTensionValid || safetyFactor < 1 ? "critical" : designStatus,
    isSafe:
      isSafe &&
      initialTensionValid &&
      safetyFactor >= (c.targetSafetyFactor ?? 1.5) &&
      (!fatigue.enabled || fatigue.fatiguePass),
    governingFailureMode,
    fatigueSafetyFactor: fatigue.enabled ? fatigue.fatigueSafetyFactor : null,
    fatigueUtilization: fatigue.enabled ? fatigue.fatigueUtilization : null,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
    lifeClass: fatigue.enabled ? fatigue.lifeClass : null,
  };
}

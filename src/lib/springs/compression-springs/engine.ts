import type { SpringEndCondition } from "../shared/helicalCommon";
import {
  activeCoilMass,
  bucklingSlendernessLimit,
  determineSpringStatus,
  en13906AllowableShear,
  helicalShearStress,
  helicalSpringRate,
  isBucklingRisk,
  solidHeightCompression,
  springIndex,
  surgeFrequencyHz,
  wahlFactor,
} from "../shared/helicalCommon";
import { en13906ShearFatigueCheck } from "../shared/en13906Fatigue";
import { wireUltimateStrengthPa, type SpringWireType } from "../shared/wireStrength";
import type { CompressionSpringConfig, CompressionSpringResult } from "./types";

export { wireUltimateStrengthPa } from "../shared/wireStrength";
export type { SpringWireType } from "../shared/wireStrength";

export function solveCompressionSpringEngine(c: CompressionSpringConfig): CompressionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const G = c.modulus;
  const rho = c.density ?? 7850;
  const endCondition: SpringEndCondition = c.endCondition ?? "guided";
  const targetSf = c.targetSafetyFactor ?? 1.5;
  const targetSurgeMargin = c.targetSurgeMargin ?? 10;

  const C = springIndex(D, d);
  const Kw = wahlFactor(C);
  const springRate = helicalSpringRate(G, d, D, n);
  const solidHeight = solidHeightCompression(n, d);
  const freeLength = c.freeLength > 0 ? c.freeLength : solidHeight + c.deflection;
  const loadedLength = freeLength - c.deflection;
  const solidHeightClearance = loadedLength - solidHeight;
  const maxLoad = springRate * c.deflection;
  const minDeflection = Math.max(c.minDeflection ?? 0, 0);
  const minLoad = springRate * minDeflection;
  const shearStress = helicalShearStress(maxLoad, D, d, Kw);
  const shearStressMin = helicalShearStress(minLoad, D, d, Kw);

  const wireUltimate = wireUltimateStrengthPa(c.wireType, d, c.ultimateStrength);
  const allowableShearStress = en13906AllowableShear(wireUltimate);
  const safetyFactor = allowableShearStress / Math.max(shearStress, 1e-9);
  const stressUtilization = shearStress / Math.max(allowableShearStress, 1e-9);

  const activeMass = activeCoilMass(d, D, n, rho);
  const naturalFrequency = surgeFrequencyHz(springRate, activeMass);

  const slenderness = freeLength / D;
  const bucklingLimit = bucklingSlendernessLimit(endCondition);
  const bucklingRisk = isBucklingRisk(freeLength, D, endCondition);

  const operatingFrequency = c.operatingFrequencyHz ?? 0;
  const surgeMargin =
    operatingFrequency > 0 ? naturalFrequency / operatingFrequency : null;

  const indexInRange = C >= 4 && C <= 12;

  const fatigueEnabled =
    c.enableFatigueCheck === true || (c.minDeflection != null && c.minDeflection > 0);
  const fatigue = en13906ShearFatigueCheck({
    tauMax: shearStress,
    tauMin: shearStressMin,
    ultimateStrength: wireUltimate,
    wireDiameterM: d,
    staticAllowableShear: allowableShearStress,
    lifeClass: c.lifeClass,
    loadCycles: c.loadCycles,
    wireQuality: c.wireQuality,
    enabled: fatigueEnabled,
  });

  const governingSf = fatigue.enabled
    ? Math.min(safetyFactor, fatigue.fatigueSafetyFactor)
    : safetyFactor;

  const { designStatus, isSafe, governing } = determineSpringStatus({
    safetyFactor: governingSf,
    targetSf,
    bucklingRisk,
    solidClearance: solidHeightClearance,
    surgeMargin,
    targetSurgeMargin,
    indexInRange,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
  });

  let governingFailureMode = governing;
  if (fatigue.enabled && fatigue.fatigueSafetyFactor < safetyFactor) {
    governingFailureMode = "Fatigue (EN 13906)";
  }

  return {
    springRate,
    solidHeight,
    loadedLength,
    solidHeightClearance,
    maxLoad,
    shearStress,
    allowableShearStress,
    wireUltimateStrength: wireUltimate,
    safetyFactor,
    stressUtilization,
    naturalFrequency,
    surgeMargin,
    springIndex: C,
    wahlFactor: Kw,
    slenderness,
    bucklingLimit,
    bucklingRisk,
    outerDiameter: D + d,
    designStatus,
    isSafe: isSafe && (!fatigue.enabled || fatigue.fatiguePass),
    governingFailureMode,
    fatigueSafetyFactor: fatigue.enabled ? fatigue.fatigueSafetyFactor : null,
    fatigueUtilization: fatigue.enabled ? fatigue.fatigueUtilization : null,
    fatiguePass: fatigue.enabled ? fatigue.fatiguePass : null,
    lifeClass: fatigue.enabled ? fatigue.lifeClass : null,
  };
}

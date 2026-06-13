import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeSafetyFactorCheck } from "../buildSpec";
import type { GearResult } from "@/lib/machine/gears/types";
import { runIso6336Rating } from "./iso6336";

/**
 * US / EU / ISO gear checks run the ISO 6336 worksheet (Method B/C level
 * approximations; the AGMA 2101 rating shares the same structure and the
 * dynamic factor here uses the AGMA transmission accuracy curve).
 */
export function buildGearCodeChecks(
  result: GearResult,
  designCode: DesignCodeId,
  options?: { ePa?: number; poisson?: number; ultimatePa?: number }
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const ultimatePa = options?.ultimatePa ?? result.allowableStress * 1.5;
  const rating = runIso6336Rating({
    tangentialForceN: result.tangentialForce,
    faceWidthM: result.faceWidth,
    moduleM: result.module,
    z1: result.pinionTeeth,
    z2: result.gearTeeth,
    pinionDiameterM: result.pitchDiameterPinion,
    pitchVelocityMs: result.pitchLineVelocity,
    ePa: options?.ePa ?? 210e9,
    poisson: options?.poisson ?? 0.3,
    ultimatePa,
  });

  const f = rating.factors;
  return [
    makeSafetyFactorCheck(
      "bending_strength",
      `Bending safety S_F (ISO 6336-3): σ_F = ${(rating.bendingStressPa / 1e6).toFixed(0)} MPa vs σ_FE = ${(rating.allowableBendingStressPa / 1e6).toFixed(0)} MPa (K_A=${f.KA.toFixed(2)}, K_V=${f.KV.toFixed(2)}, K_β=${f.KHbeta.toFixed(2)}, Y_FS=${f.YFS.toFixed(2)})`,
      rating.bendingSafetyFactor,
      designCode
    ),
    makeSafetyFactorCheck(
      "contact_strength",
      `Pitting safety S_H (ISO 6336-2): σ_H = ${(rating.contactStressPa / 1e6).toFixed(0)} MPa vs σ_H,lim = ${(rating.allowableContactStressPa / 1e6).toFixed(0)} MPa (Z_H=${f.ZH.toFixed(2)}, Z_E=${(f.ZE / 1e3).toFixed(1)} √MPa, ε_α=${f.contactRatio.toFixed(2)})`,
      rating.contactSafetyFactor,
      designCode
    ),
    makeSafetyFactorCheck(
      "bending_fatigue",
      "Bending fatigue safety factor (0.45·Su endurance screening)",
      result.bendingFatigueSafetyFactor,
      designCode
    ),
    makeSafetyFactorCheck(
      "contact_fatigue",
      "Contact fatigue safety factor (hardness-based endurance)",
      result.contactFatigueSafetyFactor,
      designCode
    ),
  ];
}

export function gearCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "ISO 6336-2/-3 rating worksheet (AGMA 2101-equivalent structure, AGMA Kv curve)";
    case "EU":
      return "ISO 6336-2/-3 rating worksheet (DIN 3990 equivalent, Method C factors)";
    case "ISO":
      return "ISO 6336-2/-3 rating worksheet (Method C factor approximations)";
    default:
      return "Lewis bending and simplified Hertzian contact (indicative)";
  }
}

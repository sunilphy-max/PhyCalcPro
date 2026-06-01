import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeSafetyFactorCheck } from "../buildSpec";
import type { GearResult } from "@/lib/machine/gears/types";

/**
 * Phase 1 β allowables — simplified; calibrate against AGMA / ISO 6336 worksheets.
 */
function bendingAllowablePa(designCode: DesignCodeId, yieldPa: number): number {
  switch (designCode) {
    case "US":
      return 0.4 * yieldPa;
    case "EU":
      return 0.35 * yieldPa;
    case "ISO":
      return 0.38 * yieldPa;
    default:
      return yieldPa;
  }
}

function contactAllowablePa(designCode: DesignCodeId, yieldPa: number): number {
  switch (designCode) {
    case "US":
      return 0.55 * yieldPa;
    case "EU":
    case "ISO":
      return 0.5 * yieldPa;
    default:
      return yieldPa;
  }
}

export function buildGearCodeChecks(
  result: GearResult,
  designCode: DesignCodeId
): EngineeringCheck[] {
  if (designCode === "INDICATIVE") return [];

  const yieldPa = result.allowableStress;
  const bendAllow = bendingAllowablePa(designCode, yieldPa);
  const contactAllow = contactAllowablePa(designCode, yieldPa);

  const bendingSf =
    result.bendingStress > 0 ? bendAllow / result.bendingStress : 999;
  const contactSf =
    result.contactStress > 0 ? contactAllow / result.contactStress : 999;

  return [
    makeSafetyFactorCheck(
      "bending_strength",
      "Bending strength safety factor",
      bendingSf,
      designCode
    ),
    makeSafetyFactorCheck(
      "contact_strength",
      "Contact (pitting) strength safety factor",
      contactSf,
      designCode
    ),
    makeSafetyFactorCheck(
      "micropitting",
      "Micropitting safety factor",
      result.micropittingSafetyFactor,
      designCode
    ),
  ];
}

export function gearCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "US":
      return "Lewis bending + Hertzian contact vs AGMA 2101-style allowables (β)";
    case "EU":
      return "Lewis bending + Hertzian contact vs DIN 3990 / ISO 6336-style allowables (β)";
    case "ISO":
      return "Lewis bending + Hertzian contact vs ISO 6336-style allowables (β)";
    default:
      return "Lewis bending and simplified Hertzian contact (indicative)";
  }
}

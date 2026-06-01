import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { GearResult } from "@/lib/machine/gears/types";
import { buildGearCodeChecks, gearCodeMethod } from "../codeChecks/gears";

export function attachGearCalculationSpec(
  result: GearResult,
  designCode: DesignCodeId
): GearResult & { calculationSpec: CalculationSpec } {
  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeSafetyFactorCheck(
            "bending_strength",
            "Bending strength safety factor",
            result.safetyFactor,
            designCode
          ),
          makeSafetyFactorCheck(
            "contact_strength",
            "Contact (pitting) strength safety factor",
            result.contactSafetyFactor,
            designCode
          ),
          makeSafetyFactorCheck(
            "micropitting",
            "Micropitting safety factor (ISO 6336-22 screening)",
            result.micropittingSafetyFactor,
            designCode
          ),
        ]
      : buildGearCodeChecks(result, designCode);

  const calculationSpec = buildCalculationSpec({
    moduleId: "gears",
    designCode,
    method: gearCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

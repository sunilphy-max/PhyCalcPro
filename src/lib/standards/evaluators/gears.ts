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
            "bending_fatigue",
            "Bending fatigue safety factor (0.45·Su endurance screening)",
            result.bendingFatigueSafetyFactor,
            designCode
          ),
          makeSafetyFactorCheck(
            "contact_fatigue",
            "Contact fatigue safety factor (hardness-based screening)",
            result.contactFatigueSafetyFactor,
            designCode
          ),
        ]
      : buildGearCodeChecks(result, designCode, {
          ePa: result.material?.E,
          poisson: result.material?.poisson,
          ultimatePa: result.material ? result.material.yieldStress * 1.5 : undefined,
        });

  const calculationSpec = buildCalculationSpec({
    moduleId: "gears",
    designCode,
    method: gearCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

import type { DesignCodeId, CalculationSpec, WorksheetStep } from "../types";
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

  const worksheetSteps: WorksheetStep[] | undefined = result.iso6336
    ? [
        { label: "Application factor", symbol: "K_A", value: result.iso6336.KA.toFixed(3) },
        { label: "Dynamic factor", symbol: "K_V", value: result.iso6336.KV.toFixed(3) },
        { label: "Face load factor", symbol: "K_Hβ", value: result.iso6336.KHbeta.toFixed(3) },
        { label: "Zone factor", symbol: "Z_H", value: result.iso6336.ZH.toFixed(3) },
        { label: "Elastic factor", symbol: "Z_E", value: `${(result.iso6336.ZE / 1e3).toFixed(2)} √MPa` },
        { label: "Contact ratio factor", symbol: "Z_ε", value: result.iso6336.Zeps.toFixed(3) },
        { label: "Form factor", symbol: "Y_FS", value: result.iso6336.YFS.toFixed(3) },
        { label: "Contact ratio (bending)", symbol: "Y_ε", value: result.iso6336.Yeps.toFixed(3) },
        ...(result.iso6336BendingSafetyFactor != null
          ? [{ label: "Bending safety S_F", symbol: "S_F", value: result.iso6336BendingSafetyFactor.toFixed(2) }]
          : []),
        ...(result.iso6336ContactSafetyFactor != null
          ? [{ label: "Pitting safety S_H", symbol: "S_H", value: result.iso6336ContactSafetyFactor.toFixed(2) }]
          : []),
      ]
    : undefined;

  const calculationSpec = buildCalculationSpec({
    moduleId: "gears",
    designCode,
    method: gearCodeMethod(designCode),
    implementedChecks,
    worksheetSteps,
  });

  return { ...result, calculationSpec };
}

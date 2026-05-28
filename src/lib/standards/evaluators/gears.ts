import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { GearResult } from "@/lib/machine/gears/types";

export function attachGearCalculationSpec(
  result: GearResult,
  designCode: DesignCodeId
): GearResult & { calculationSpec: CalculationSpec } {
  const implementedChecks = [];

  if (designCode === "INDICATIVE") {
    implementedChecks.push(
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
      )
    );
  }

  const calculationSpec = buildCalculationSpec({
    moduleId: "gears",
    designCode,
    method:
      designCode === "INDICATIVE"
        ? "Lewis bending stress and simplified Hertzian contact (indicative)"
        : "AGMA / ISO 6336 rating workflow (pending verified implementation)",
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

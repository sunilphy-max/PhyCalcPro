import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { BucklingResult } from "@/lib/structural/columns/types";
import { buildColumnCodeChecks, columnCodeMethod } from "../codeChecks/columns";

export function attachColumnCalculationSpec(
  result: BucklingResult,
  designCode: DesignCodeId
): BucklingResult & { calculationSpec: CalculationSpec } {
  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeSafetyFactorCheck(
            "euler_critical",
            "Buckling safety factor (Pcr / P)",
            result.safetyFactor,
            designCode
          ),
        ]
      : buildColumnCodeChecks(result, designCode);

  const calculationSpec = buildCalculationSpec({
    moduleId: "columns",
    designCode,
    method: columnCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

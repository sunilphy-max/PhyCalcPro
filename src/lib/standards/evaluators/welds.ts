import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { WeldResult } from "@/lib/fasteners/welds/types";
import { buildWeldCodeChecks, weldCodeMethod } from "../codeChecks/welds";

export function attachWeldCalculationSpec(
  result: WeldResult,
  designCode: DesignCodeId
): WeldResult & { calculationSpec: CalculationSpec } {
  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeSafetyFactorCheck(
            "throat_combined",
            "Overall weld safety factor",
            result.safetyFactorOverall,
            designCode
          ),
        ]
      : buildWeldCodeChecks(result, designCode);

  const calculationSpec = buildCalculationSpec({
    moduleId: "welds",
    designCode,
    method: weldCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

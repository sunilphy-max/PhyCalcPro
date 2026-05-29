import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeSafetyFactorCheck } from "../buildSpec";
import type { CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";
import {
  buildCombinedLoadingCodeChecks,
  combinedLoadingCodeMethod,
} from "../codeChecks/combinedLoading";

export function attachCombinedLoadingCalculationSpec(
  result: CombinedLoadingResult,
  designCode: DesignCodeId,
  options?: { yieldStressPa?: number }
): CombinedLoadingResult & { calculationSpec: CalculationSpec } {
  const yieldPa = options?.yieldStressPa ?? 250e6;

  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeSafetyFactorCheck(
            "von_mises",
            "Combined loading safety factor",
            result.safetyFactor,
            designCode
          ),
        ]
      : buildCombinedLoadingCodeChecks(result, designCode, yieldPa);

  const calculationSpec = buildCalculationSpec({
    moduleId: "combined-loading",
    designCode,
    method: combinedLoadingCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";
import { buildBeamCodeChecks, beamCodeMethod } from "../codeChecks/beams";

export function attachBeamCalculationSpec(
  result: BeamResult,
  designCode: DesignCodeId,
  options?: { yieldStressPa?: number; deflectionLimit?: number }
): BeamResult & { calculationSpec: CalculationSpec } {
  const yieldStress = options?.yieldStressPa ?? 250e6;
  const deflectionLimit = options?.deflectionLimit;

  const stressUtilization = result.maxStress > 0 ? result.maxStress / yieldStress : 0;
  const deflectionUtilization =
    deflectionLimit && deflectionLimit > 0
      ? result.maxDeflection / deflectionLimit
      : undefined;

  const implementedChecks =
    designCode === "INDICATIVE"
      ? [
          makeUtilizationCheck(
            "bending_stress",
            "Bending stress utilization (σ / σy, indicative)",
            stressUtilization,
            designCode
          ),
          ...(deflectionUtilization != null
            ? [
                makeUtilizationCheck(
                  "deflection_serviceability",
                  "Deflection serviceability utilization",
                  deflectionUtilization,
                  designCode
                ),
              ]
            : []),
        ]
      : buildBeamCodeChecks(result, designCode, {
          yieldStressPa: yieldStress,
          deflectionLimit,
        });

  const calculationSpec = buildCalculationSpec({
    moduleId: "beams",
    designCode,
    method: beamCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";

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

  const implementedChecks = [];

  if (designCode === "INDICATIVE") {
    implementedChecks.push(
      makeUtilizationCheck(
        "bending_stress",
        "Bending stress utilization (σ / σy, indicative)",
        stressUtilization,
        designCode
      )
    );
    if (deflectionUtilization != null) {
      implementedChecks.push(
        makeUtilizationCheck(
          "deflection_serviceability",
          "Deflection serviceability utilization",
          deflectionUtilization,
          designCode
        )
      );
    }
  }

  const calculationSpec = buildCalculationSpec({
    moduleId: "beams",
    designCode,
    method:
      designCode === "INDICATIVE"
        ? "1D beam FEM (Euler-Bernoulli)"
        : "Code-check workflow pending verified AISC / EN implementation",
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

import type { DesignCodeId, CalculationSpec } from "../types";
import { buildCalculationSpec, makeUtilizationCheck } from "../buildSpec";
import type { BeamResult } from "@/lib/structural/beams/types";
import { buildBeamCodeChecks, beamCodeMethod } from "../codeChecks/beams";

export function attachBeamCalculationSpec(
  result: BeamResult,
  designCode: DesignCodeId,
  options?: {
    yieldStressPa?: number;
    deflectionLimit?: number;
    c?: number;
    I?: number;
    spanLength?: number;
    unbracedLength?: number;
  }
): BeamResult & { calculationSpec: CalculationSpec } {
  const yieldStress = options?.yieldStressPa ?? 250e6;
  const deflectionLimit = options?.deflectionLimit;
  const c = options?.c ?? 0.05;
  const I = options?.I ?? 1e-6;
  const areaEstimate = Math.max((3 * I) / (c * c), 1e-9);
  const tauMax = (1.5 * result.maxShear) / areaEstimate;
  const tauAllow = 0.6 * yieldStress;
  const shearUtil = tauAllow > 0 ? tauMax / tauAllow : 0;

  const Lb = options?.unbracedLength ?? options?.spanLength ?? 1;
  const Sx = I / Math.max(c, 1e-9);
  const r = Math.sqrt(I / areaEstimate);
  const Fe = (Math.PI ** 2 * 210e9) / Math.pow(Lb / Math.max(r, 1e-9), 2);
  const Mn =
    Fe >= 0.7 * yieldStress
      ? 0.9 * yieldStress * Sx
      : 0.9 * yieldStress * Sx * Math.sqrt(Fe / Math.max(yieldStress, 1e-9));
  const ltbUtil = Mn > 0 ? result.maxMoment / Mn : 0;

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
          makeUtilizationCheck(
            "shear_stress",
            "Shear utilization (τ / 0.6·σy, indicative)",
            shearUtil,
            designCode
          ),
          makeUtilizationCheck(
            "lateral_torsional_buckling",
            "LTB utilization (M / Mn, indicative)",
            ltbUtil,
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
          c: options?.c,
          I: options?.I,
          spanLength: options?.spanLength,
          unbracedLength: options?.unbracedLength,
        });

  const calculationSpec = buildCalculationSpec({
    moduleId: "beams",
    designCode,
    method: beamCodeMethod(designCode),
    implementedChecks,
  });

  return { ...result, calculationSpec };
}

/**
 * Bolt/Screw Diagnosis Engine
 * Post-solve risk screening for bolt joints (VDI 2230) and power screws (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
  riskFromUtilization,
  emptyDiagnosis,
} from "@/lib/design-workflows/diagnosisTypes";
import type { ScrewResult } from "./types";
import type { Vdi2230Result } from "./vdi2230";

type BoltDiagnosisInput = ScrewResult | Vdi2230Result;

function isVdi2230Result(result: BoltDiagnosisInput): result is Vdi2230Result {
  return "slipSafetyFactor" in result;
}

function isScrewResult(result: BoltDiagnosisInput): result is ScrewResult {
  return "screwType" in result && "designStatus" in result;
}

export function diagnoseBolt(result: BoltDiagnosisInput): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Handle VDI 2230 bolt joint
  if (isVdi2230Result(result)) {
    // Slip safety factor
    const slipRisk = riskFromSafetyFactor(result.slipSafetyFactor);
    if (slipRisk && slipRisk !== "low") {
      findings.push({
        category: "slip",
        categoryLabel: "Joint Slip",
        level: slipRisk,
        title: `Slip safety factor ${result.slipSafetyFactor.toFixed(2)}`,
        detail: `Residual clamp force ${(result.residualClampForce / 1000).toFixed(
          1
        )} kN vs required ${(result.requiredClampForce / 1000).toFixed(
          1
        )} kN. Risk of joint separation under transverse load.`,
        metricKey: "slipSafetyFactor",
        metricValue: result.slipSafetyFactor,
        threshold: 1.25,
      });
      if (result.slipSafetyFactor < 1) {
        recommendations.push({
          id: "increase_preload",
          label: "Increase preload or bolt size",
          detail: "Joint may slip under service loads. Use higher-grade bolt or larger diameter.",
        });
      }
    }

    // Working stress utilization
    const workingRisk = riskFromUtilization(result.workingStressUtilization);
    if (workingRisk && workingRisk !== "low") {
      findings.push({
        category: "working_stress",
        categoryLabel: "Working Stress",
        level: workingRisk,
        title: `Working stress utilization ${(result.workingStressUtilization * 100).toFixed(0)}%`,
        detail: `Max bolt force ${(result.maxBoltForce / 1000).toFixed(
          1
        )} kN approaches or exceeds yield capacity. Risk of plastic deformation.`,
        metricKey: "workingStressUtilization",
        metricValue: result.workingStressUtilization,
        threshold: 0.9,
      });
    }

    // Fatigue safety factor
    const fatigueRisk = riskFromSafetyFactor(result.fatigueSafetyFactor);
    if (fatigueRisk && fatigueRisk !== "low") {
      findings.push({
        category: "fatigue",
        categoryLabel: "Thread Fatigue",
        level: fatigueRisk,
        title: `Fatigue safety factor ${result.fatigueSafetyFactor.toFixed(2)}`,
        detail: `Stress amplitude ${(result.stressAmplitude / 1e6).toFixed(
          1
        )} MPa vs endurance limit ${(result.enduranceLimit / 1e6).toFixed(
          1
        )} MPa. Risk of fatigue crack initiation.`,
        metricKey: "fatigueSafetyFactor",
        metricValue: result.fatigueSafetyFactor,
        threshold: 1.5,
      });
      if (result.fatigueSafetyFactor < 1.25) {
        recommendations.push({
          id: "reduce_load_amplitude",
          label: "Reduce load amplitude or increase preload",
          detail: "Higher preload reduces alternating stress range in thread.",
        });
      }
    }

    // Surface pressure utilization
    const pressureRisk = riskFromUtilization(result.surfacePressureUtilization);
    if (pressureRisk && pressureRisk !== "low") {
      findings.push({
        category: "bearing_pressure",
        categoryLabel: "Bearing Pressure",
        level: pressureRisk,
        title: `Surface pressure utilization ${(result.surfacePressureUtilization * 100).toFixed(0)}%`,
        detail: `Head bearing pressure ${(result.surfacePressure / 1e6).toFixed(
          0
        )} MPa approaches joint material limit. Risk of embedment or crushing.`,
        metricKey: "surfacePressureUtilization",
        metricValue: result.surfacePressureUtilization,
        threshold: 0.85,
      });
    }

    const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
    const summary =
      overallRisk === "high"
        ? "Critical failure risk detected in bolt joint. Immediate redesign required."
        : overallRisk === "medium"
          ? "Marginal safety in bolt joint. Consider design improvements."
          : "Bolt joint metrics within acceptable VDI 2230 thresholds.";

    return {
      overallRisk,
      summary,
      findings,
      recommendations,
    };
  }

  // Handle power screw / ball screw
  if (isScrewResult(result)) {
    const sfRisk = riskFromSafetyFactor(result.safetyFactor);
    if (sfRisk && sfRisk !== "low") {
      findings.push({
        category: "static_strength",
        categoryLabel: "Static Strength",
        level: sfRisk,
        title: `Safety factor ${result.safetyFactor.toFixed(2)}`,
        detail: `Von Mises stress ${(result.vonMisesStress / 1e6).toFixed(
          1
        )} MPa yields SF = ${result.safetyFactor.toFixed(2)}. Risk of yielding under load.`,
        metricKey: "safetyFactor",
        metricValue: result.safetyFactor,
        threshold: 1.5,
      });
    }

    const fatigueRisk = riskFromSafetyFactor(result.fatigueSafetyFactor);
    if (fatigueRisk && fatigueRisk !== "low") {
      findings.push({
        category: "fatigue",
        categoryLabel: "Fatigue Life",
        level: fatigueRisk,
        title: `Fatigue safety factor ${result.fatigueSafetyFactor.toFixed(2)}`,
        detail: `Cyclic loading indicates elevated fatigue risk. Ensure adequate lubrication and maintenance.`,
        metricKey: "fatigueSafetyFactor",
        metricValue: result.fatigueSafetyFactor,
        threshold: 1.5,
      });
    }

    // Add recommendations from result if available
    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach((rec, idx) => {
        recommendations.push({
          id: `rec_${idx}`,
          label: rec,
          detail: rec,
        });
      });
    }

    const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
    const summary =
      result.designStatus === "critical"
        ? "Critical failure risk detected. Immediate redesign required."
        : result.designStatus === "warning"
          ? "Marginal safety detected. Consider design improvements."
          : "Screw design metrics within acceptable thresholds.";

    return {
      overallRisk,
      summary,
      findings,
      recommendations,
    };
  }

  // Fallback
  return emptyDiagnosis("Unknown bolt/screw result type for diagnosis screening.");
}

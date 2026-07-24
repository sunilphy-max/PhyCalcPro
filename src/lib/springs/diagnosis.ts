/**
 * Spring Diagnosis Engine
 * Shared post-solve risk screening for helical springs (compression, extension, torsion).
 * No new physics — maps existing result fields.
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
} from "@/lib/design-workflows/diagnosisTypes";
import type { CompressionSpringResult } from "./compression-springs/types";

/**
 * Generic compression-like spring result shape (works for compression, extension, torsion).
 * All share: safetyFactor, stressUtilization, fatigueSafetyFactor, governingFailureMode.
 * surgeMargin / bucklingRisk are optional (torsion typically omits them).
 */
type HelicalSpringResult = {
  safetyFactor: number;
  stressUtilization: number;
  /** Compression/extension; torsion engines typically omit this. */
  surgeMargin?: number | null;
  /** Compression-oriented; torsion engines typically omit this. */
  bucklingRisk?: boolean;
  solidHeightClearance?: number;
  fatigueSafetyFactor: number | null;
  governingFailureMode: string;
  designStatus?: "safe" | "warning" | "critical";
  isSafe?: boolean;
};

export function diagnoseHelicalSpring(result: HelicalSpringResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Static safety factor
  const sfRisk = riskFromSafetyFactor(result.safetyFactor);
  if (sfRisk && sfRisk !== "low") {
    findings.push({
      category: "static_strength",
      categoryLabel: "Static Strength",
      level: sfRisk,
      title: `Static safety factor ${result.safetyFactor.toFixed(2)}`,
      detail: `Shear stress yields SF = ${result.safetyFactor.toFixed(
        2
      )}. Risk of yielding or set under peak load.`,
      metricKey: "safetyFactor",
      metricValue: result.safetyFactor,
      threshold: 1.5,
    });
    if (result.safetyFactor < 1.25) {
      recommendations.push({
        id: "increase_wire_diameter",
        label: "Increase wire diameter",
        detail: "Larger wire reduces shear stress and improves static strength.",
      });
    }
  }

  // Stress utilization
  const utilRisk = riskFromUtilization(result.stressUtilization);
  if (utilRisk && utilRisk !== "low") {
    findings.push({
      category: "stress_utilization",
      categoryLabel: "Stress Utilization",
      level: utilRisk,
      title: `Stress utilization ${(result.stressUtilization * 100).toFixed(0)}%`,
      detail: `Operating stress approaches or exceeds material allowable. Risk of permanent set.`,
      metricKey: "stressUtilization",
      metricValue: result.stressUtilization,
      threshold: 0.85,
    });
  }

  // Surge margin (natural frequency vs operating frequency)
  if (result.surgeMargin != null) {
    const surgeRisk =
      result.surgeMargin < 5 ? "high" : result.surgeMargin < 10 ? "medium" : "low";
    if (surgeRisk !== "low") {
      findings.push({
        category: "surge",
        categoryLabel: "Surge/Resonance",
        level: surgeRisk,
        title: `Surge margin ${result.surgeMargin.toFixed(1)}`,
        detail: `Natural frequency margin below recommended 10×. Risk of resonance and fatigue failure.`,
        metricKey: "surgeMargin",
        metricValue: result.surgeMargin,
        threshold: 10,
      });
      if (result.surgeMargin < 5) {
        recommendations.push({
          id: "reduce_frequency",
          label: "Reduce operating frequency or add damper",
          detail: "Operating near natural frequency induces surge waves and premature failure.",
        });
      }
    }
  }

  // Buckling risk
  if (result.bucklingRisk) {
    findings.push({
      category: "buckling",
      categoryLabel: "Column Buckling",
      level: "high",
      title: "Buckling risk detected",
      detail: "Slenderness ratio exceeds critical limit. Spring may buckle laterally under compression.",
    });
    recommendations.push({
      id: "add_guide",
      label: "Add guide rod or reduce free length",
      detail: "Lateral guidance or shorter free length prevents buckling instability.",
    });
  }

  // Solid height clearance (if available, e.g., compression springs)
  if (result.solidHeightClearance != null && result.solidHeightClearance < 0.001) {
    findings.push({
      category: "solid_height",
      categoryLabel: "Solid Height Clearance",
      level: "high",
      title: "Insufficient solid height clearance",
      detail: `Clearance ${(result.solidHeightClearance * 1000).toFixed(
        1
      )} mm. Spring may bottom out, causing set or breakage.`,
      metricKey: "solidHeightClearance",
      metricValue: result.solidHeightClearance,
      threshold: 0.005,
    });
    recommendations.push({
      id: "increase_free_length",
      label: "Increase free length or reduce coils",
      detail: "Ensure minimum 5 mm clearance to solid height under maximum load.",
    });
  }

  // Fatigue safety factor
  if (result.fatigueSafetyFactor != null) {
    const fatigueRisk = riskFromSafetyFactor(result.fatigueSafetyFactor);
    if (fatigueRisk && fatigueRisk !== "low") {
      findings.push({
        category: "fatigue",
        categoryLabel: "Fatigue Life",
        level: fatigueRisk,
        title: `Fatigue safety factor ${result.fatigueSafetyFactor.toFixed(2)}`,
        detail: `EN 13906 fatigue screening yields SF = ${result.fatigueSafetyFactor.toFixed(
          2
        )}. Risk of finite-life failure under cyclic loading.`,
        metricKey: "fatigueSafetyFactor",
        metricValue: result.fatigueSafetyFactor,
        threshold: 1.5,
      });
      if (result.fatigueSafetyFactor < 1.25) {
        recommendations.push({
          id: "reduce_stress_range",
          label: "Reduce stress range or improve surface finish",
          detail: "Shot peening or lower stress amplitude improves fatigue life.",
        });
      }
    }
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "high"
      ? `Critical failure risk detected: ${result.governingFailureMode}. Immediate redesign required.`
      : overallRisk === "medium"
        ? `Marginal safety in ${result.governingFailureMode}. Consider design improvements.`
        : "Spring design metrics within acceptable thresholds.";

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}

/**
 * Convenience wrapper for compression spring result (direct type compatibility).
 */
export function diagnoseCompressionSpring(result: CompressionSpringResult): ModuleDiagnosis {
  return diagnoseHelicalSpring(result);
}

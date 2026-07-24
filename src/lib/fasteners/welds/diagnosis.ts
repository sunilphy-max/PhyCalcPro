/**
 * Weld Diagnosis Engine
 * Post-solve risk screening for weld designs (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
  emptyDiagnosis,
} from "@/lib/design-workflows/diagnosisTypes";
import type { WeldResult } from "./types";

export function diagnoseWeld(result: WeldResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Shear safety factor
  const shearRisk = riskFromSafetyFactor(result.safetyFactorShear);
  if (shearRisk && shearRisk !== "low") {
    findings.push({
      category: "shear",
      categoryLabel: "Shear Stress",
      level: shearRisk,
      title: `Shear safety factor ${result.safetyFactorShear.toFixed(2)}`,
      detail: `Weld shear stress ${(result.shearStress / 1e6).toFixed(
        1
      )} MPa vs allowable ${(result.allowableShear / 1e6).toFixed(
        1
      )} MPa. Risk of shear failure in throat section.`,
      metricKey: "safetyFactorShear",
      metricValue: result.safetyFactorShear,
      threshold: 1.5,
    });
  }

  // Axial safety factor
  const axialRisk = riskFromSafetyFactor(result.safetyFactorAxial);
  if (axialRisk && axialRisk !== "low") {
    findings.push({
      category: "axial",
      categoryLabel: "Axial (Tension)",
      level: axialRisk,
      title: `Axial safety factor ${result.safetyFactorAxial.toFixed(2)}`,
      detail: `Axial stress ${(result.axialStress / 1e6).toFixed(
        1
      )} MPa vs allowable ${(result.allowableAxial / 1e6).toFixed(
        1
      )} MPa. Risk of tension failure in weld group.`,
      metricKey: "safetyFactorAxial",
      metricValue: result.safetyFactorAxial,
      threshold: 1.5,
    });
  }

  // Resultant safety factor (combined stress)
  const resultantRisk = riskFromSafetyFactor(result.safetyFactorResultant);
  if (resultantRisk && resultantRisk !== "low") {
    findings.push({
      category: "resultant",
      categoryLabel: "Combined Stress",
      level: resultantRisk,
      title: `Resultant safety factor ${result.safetyFactorResultant.toFixed(2)}`,
      detail: `Combined resultant stress ${(result.resultantStress / 1e6).toFixed(
        1
      )} MPa vs allowable ${(result.allowableResultant / 1e6).toFixed(
        1
      )} MPa. Interaction of shear and axial components.`,
      metricKey: "safetyFactorResultant",
      metricValue: result.safetyFactorResultant,
      threshold: 1.5,
    });
  }

  // Overall safety factor
  const overallSfRisk = riskFromSafetyFactor(result.safetyFactorOverall);
  if (overallSfRisk && overallSfRisk !== "low") {
    findings.push({
      category: "overall",
      categoryLabel: "Overall Weld Safety",
      level: overallSfRisk,
      title: `Overall safety factor ${result.safetyFactorOverall.toFixed(2)}`,
      detail: `Governing failure mode: ${result.governingMode}. Overall weld group safety is marginal or critical.`,
      metricKey: "safetyFactorOverall",
      metricValue: result.safetyFactorOverall,
      threshold: 1.5,
    });
  }

  // Recommendations
  if (result.safetyFactorOverall < 1) {
    recommendations.push({
      id: "increase_weld_size",
      label: "Increase weld size or count",
      detail: `Current throat area ${(result.totalThroatArea * 1e6).toFixed(
        0
      )} mm² insufficient. Consider larger fillet or additional welds.`,
    });
  } else if (result.safetyFactorOverall < 1.25) {
    recommendations.push({
      id: "reduce_eccentricity",
      label: "Reduce load eccentricity",
      detail: "Moment-induced stress dominates. Reposition load closer to weld group centroid.",
    });
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "high"
      ? `Critical failure risk in ${result.governingMode} mode. Immediate redesign required.`
      : overallRisk === "medium"
        ? `Marginal safety in ${result.governingMode} mode. Consider increasing weld capacity.`
        : "Weld design metrics within acceptable AISC/AWS thresholds.";

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}

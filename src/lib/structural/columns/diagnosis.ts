/**
 * Column Buckling Diagnosis Engine
 * Post-solve risk screening for column designs (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
} from "@/lib/design-workflows/diagnosisTypes";
import type { BucklingResult } from "./types";

export function diagnoseColumn(result: BucklingResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Safety factor (Pcr / P)
  const sfRisk = riskFromSafetyFactor(result.safetyFactor);
  if (sfRisk && sfRisk !== "low") {
    findings.push({
      category: "buckling_safety",
      categoryLabel: "Buckling Safety Factor",
      level: sfRisk,
      title: `Buckling safety factor ${result.safetyFactor.toFixed(2)}`,
      detail: `Critical load ${(result.Pcr / 1000).toFixed(
        1
      )} kN vs applied ${(result.Pcr / (result.safetyFactor * 1000)).toFixed(
        1
      )} kN. Risk of column buckling failure.`,
      metricKey: "safetyFactor",
      metricValue: result.safetyFactor,
      threshold: 1.5,
    });
    if (result.safetyFactor < 1.25) {
      recommendations.push({
        id: "increase_section",
        label: "Increase column section or reduce length",
        detail: "Higher moment of inertia or shorter effective length raises critical buckling load.",
      });
    }
  }

  // Design status check
  if (!result.isSafe) {
    findings.push({
      category: "design_status",
      categoryLabel: "Overall Design Status",
      level: "high",
      title: "Column marked unsafe",
      detail: `Design status: ${result.designStatus}. Applied load exceeds or approaches buckling capacity.`,
    });
  }

  // Buckling mode classification
  if (result.bucklingMode === "inelastic" || result.bucklingMode === "critical") {
    const modeRisk = result.bucklingMode === "critical" ? "high" : "medium";
    findings.push({
      category: "buckling_mode",
      categoryLabel: "Buckling Mode",
      level: modeRisk,
      title: `Buckling mode: ${result.bucklingMode}`,
      detail:
        result.bucklingMode === "critical"
          ? "Applied load at or above critical buckling load. Immediate failure risk."
          : "Inelastic buckling regime. Yielding may occur before elastic critical load is reached.",
    });
  }

  // Slenderness ratio screening
  if (result.slenderness > 200) {
    findings.push({
      category: "slenderness",
      categoryLabel: "Slenderness Ratio",
      level: "medium",
      title: `High slenderness ratio ${result.slenderness.toFixed(0)}`,
      detail: "Very slender column. Highly sensitive to imperfections and lateral loads. Consider bracing.",
      metricKey: "slenderness",
      metricValue: result.slenderness,
      threshold: 200,
    });
    recommendations.push({
      id: "add_bracing",
      label: "Add lateral bracing",
      detail: "Reduce effective length by adding intermediate bracing or lateral supports.",
    });
  }

  // Code-check basis (if available, e.g., Eurocode or AISC checks)
  if (result.codeCheckBasis) {
    const { fyPa, eulerStressPa, appliedLoadN, areaM2 } = result.codeCheckBasis;
    const appliedStress = appliedLoadN / areaM2;
    const stressRatio = appliedStress / Math.min(fyPa, eulerStressPa);
    if (stressRatio > 0.85) {
      const risk = stressRatio > 1 ? "high" : "medium";
      findings.push({
        category: "code_stress",
        categoryLabel: "Code Stress Check",
        level: risk,
        title: `Stress ratio ${(stressRatio * 100).toFixed(0)}%`,
        detail: `Applied stress ${(appliedStress / 1e6).toFixed(
          1
        )} MPa vs governing limit ${(Math.min(fyPa, eulerStressPa) / 1e6).toFixed(
          1
        )} MPa. Code-based capacity check.`,
        metricKey: "stressRatio",
        metricValue: stressRatio,
        threshold: 0.85,
      });
    }
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "high"
      ? "Critical buckling failure risk. Immediate redesign required."
      : overallRisk === "medium"
        ? "Marginal buckling safety. Consider design improvements or bracing."
        : "Column buckling safety within acceptable thresholds.";

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}

/**
 * Beam Diagnosis Engine
 * Post-solve risk screening for beam designs (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromUtilization,
  emptyDiagnosis,
} from "@/lib/design-workflows/diagnosisTypes";
import type { BeamResult } from "./types";

export function diagnoseBeam(result: BeamResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Check if application context with utilization metrics is present
  if (!result.applicationContext) {
    return emptyDiagnosis(
      "No application context (stress/deflection limits) provided for beam diagnosis."
    );
  }

  const ctx = result.applicationContext;

  // Stress utilization
  const stressRisk = riskFromUtilization(ctx.stressUtilization);
  if (stressRisk && stressRisk !== "low") {
    findings.push({
      category: "stress",
      categoryLabel: "Bending Stress",
      level: stressRisk,
      title: `Stress utilization ${(ctx.stressUtilization * 100).toFixed(0)}%`,
      detail: `Max stress ${(result.maxStress / 1e6).toFixed(
        1
      )} MPa vs allowable ${(ctx.allowableStress / 1e6).toFixed(
        1
      )} MPa. Risk of yielding or failure per ${ctx.standards.join(", ")}.`,
      metricKey: "stressUtilization",
      metricValue: ctx.stressUtilization,
      threshold: 0.85,
    });
    if (ctx.stressUtilization > 1) {
      recommendations.push({
        id: "increase_section",
        label: "Increase section modulus",
        detail: "Use deeper section or higher-strength material to reduce bending stress.",
      });
    }
  }

  // Deflection utilization
  const deflRisk = riskFromUtilization(ctx.deflectionUtilization);
  if (deflRisk && deflRisk !== "low") {
    findings.push({
      category: "deflection",
      categoryLabel: "Deflection Serviceability",
      level: deflRisk,
      title: `Deflection utilization ${(ctx.deflectionUtilization * 100).toFixed(0)}%`,
      detail: `Max deflection ${(result.maxDeflection * 1000).toFixed(
        1
      )} mm vs limit ${(ctx.deflectionLimit * 1000).toFixed(
        1
      )} mm (L/${ctx.deflectionLimitRatio}). May affect serviceability or aesthetics.`,
      metricKey: "deflectionUtilization",
      metricValue: ctx.deflectionUtilization,
      threshold: 0.85,
    });
    if (ctx.deflectionUtilization > 1) {
      recommendations.push({
        id: "increase_stiffness",
        label: "Increase moment of inertia",
        detail: "Use deeper section or add bracing to limit deflection.",
      });
    }
  }

  // Fatigue sensitivity note
  if (ctx.fatigueSensitive && stressRisk !== "low") {
    findings.push({
      category: "fatigue",
      categoryLabel: "Fatigue Sensitivity",
      level: "medium",
      title: "Fatigue-sensitive application",
      detail: `Application marked as fatigue-sensitive per ${ctx.standards.join(
        ", "
      )}. High stress utilization increases fatigue risk.`,
    });
    recommendations.push({
      id: "fatigue_detail",
      label: "Review fatigue detailing",
      detail: "Avoid stress concentrations, ensure smooth transitions, consider fatigue life assessment.",
    });
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const governingMode =
    stressRisk === "high"
      ? "bending stress"
      : deflRisk === "high"
        ? "deflection"
        : "multiple factors";

  const summary =
    overallRisk === "high"
      ? `Critical failure risk in ${governingMode}. Immediate redesign required per ${ctx.standards.join(", ")}.`
      : overallRisk === "medium"
        ? `Marginal safety in ${governingMode}. Consider design improvements per ${ctx.standards.join(", ")}.`
        : `Beam design within acceptable ${ctx.standards.join(", ")} thresholds.`;

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}

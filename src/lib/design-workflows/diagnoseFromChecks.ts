/**
 * Generic diagnosis helper that builds ModuleDiagnosis from common result fields
 * (safetyFactor, *Utilization, designStatus, isSafe, governingFailureMode, alerts/warnings).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "./diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
  riskFromUtilization,
  emptyDiagnosis,
} from "./diagnosisTypes";

type ResultWithChecks = Record<string, any>;

export function diagnoseFromChecks(result: unknown): ModuleDiagnosis {
  if (!result || typeof result !== "object") {
    return emptyDiagnosis("Invalid result provided for diagnosis.");
  }

  const r = result as ResultWithChecks;
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Safety factor check
  if (typeof r.safetyFactor === "number") {
    const sfRisk = riskFromSafetyFactor(r.safetyFactor);
    if (sfRisk && sfRisk !== "low") {
      findings.push({
        category: "safety_factor",
        categoryLabel: "Safety Factor",
        level: sfRisk,
        title: `Safety factor ${r.safetyFactor.toFixed(2)}`,
        detail: `Design safety factor ${r.safetyFactor.toFixed(2)} is below recommended threshold.`,
        metricKey: "safetyFactor",
        metricValue: r.safetyFactor,
        threshold: 1.5,
      });
    }
  }

  // Fatigue safety factor check
  if (typeof r.fatigueSafetyFactor === "number") {
    const fatigueRisk = riskFromSafetyFactor(r.fatigueSafetyFactor);
    if (fatigueRisk && fatigueRisk !== "low") {
      findings.push({
        category: "fatigue",
        categoryLabel: "Fatigue Life",
        level: fatigueRisk,
        title: `Fatigue safety factor ${r.fatigueSafetyFactor.toFixed(2)}`,
        detail: `Fatigue screening yields SF = ${r.fatigueSafetyFactor.toFixed(2)}.`,
        metricKey: "fatigueSafetyFactor",
        metricValue: r.fatigueSafetyFactor,
        threshold: 1.5,
      });
    }
  }

  // Check all *Utilization fields
  for (const key of Object.keys(r)) {
    if (key.endsWith("Utilization") && typeof r[key] === "number") {
      const utilRisk = riskFromUtilization(r[key]);
      if (utilRisk && utilRisk !== "low") {
        const label = key
          .replace(/Utilization$/, "")
          .replace(/([A-Z])/g, " $1")
          .trim()
          .replace(/^\w/, (c) => c.toUpperCase());
        findings.push({
          category: key,
          categoryLabel: label,
          level: utilRisk,
          title: `${label} utilization ${(r[key] * 100).toFixed(0)}%`,
          detail: `${label} utilization ${(r[key] * 100).toFixed(0)}% approaches or exceeds serviceability limit.`,
          metricKey: key,
          metricValue: r[key],
          threshold: 0.85,
        });
      }
    }
  }

  // Extract alerts/warnings if available
  if (Array.isArray(r.alerts)) {
    r.alerts.forEach((alert: string, idx: number) => {
      findings.push({
        category: "alert",
        categoryLabel: "Alert",
        level: "high",
        title: "Design alert",
        detail: alert,
      });
    });
  }

  if (Array.isArray(r.warnings)) {
    r.warnings.forEach((warning: string, idx: number) => {
      findings.push({
        category: "warning",
        categoryLabel: "Warning",
        level: "medium",
        title: "Design warning",
        detail: warning,
      });
    });
  }

  // Extract recommendations if available
  if (Array.isArray(r.recommendations)) {
    r.recommendations.forEach((rec: string | { label: string; detail?: string }, idx: number) => {
      if (typeof rec === "string") {
        recommendations.push({
          id: `rec_${idx}`,
          label: rec,
          detail: rec,
        });
      } else if (rec && typeof rec === "object") {
        recommendations.push({
          id: `rec_${idx}`,
          label: rec.label,
          detail: rec.detail || rec.label,
        });
      }
    });
  }

  const overallRisk = findings.length > 0 ? maxDiagnosisRisk(findings.map((f) => f.level)) : "low";

  const hasAnyMetric =
    typeof r.safetyFactor === "number" ||
    typeof r.fatigueSafetyFactor === "number" ||
    Object.keys(r).some((k) => k.toLowerCase().includes("utilization")) ||
    typeof r.designStatus === "string" ||
    typeof r.isSafe === "boolean" ||
    Array.isArray(r.alerts) ||
    Array.isArray(r.warnings);

  if (findings.length === 0 && !hasAnyMetric) {
    return emptyDiagnosis("No safety metrics exposed yet for Diagnose screening.");
  }

  let summary = "All design metrics within acceptable thresholds.";
  if (overallRisk === "high") {
    const mode = r.governingFailureMode || "multiple factors";
    summary = `Critical failure risk detected: ${mode}. Immediate redesign required.`;
  } else if (overallRisk === "medium") {
    const mode = r.governingFailureMode || "multiple factors";
    summary = `Marginal safety detected in ${mode}. Consider design improvements.`;
  } else if (r.designStatus === "safe" || r.isSafe === true) {
    summary = "Design passes all safety checks.";
  } else if (r.designStatus === "warning") {
    summary = "Design has marginal safety. Review findings.";
  } else if (r.designStatus === "critical" || r.isSafe === false) {
    summary = "Design fails safety checks. Immediate redesign required.";
  }

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}

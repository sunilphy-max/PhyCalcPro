/** Shared Diagnose-mode risk screening contract (post-solve; no new physics). */

export type DiagnosisRiskLevel = "low" | "medium" | "high";

export type DiagnosisFinding = {
  category: string;
  categoryLabel?: string;
  level: DiagnosisRiskLevel;
  title: string;
  detail: string;
  metricKey?: string;
  metricValue?: number;
  threshold?: number;
};

export type DiagnosisRecommendation = {
  id: string;
  label: string;
  detail: string;
  /** Form field patches for Apply (same units as the module form). */
  fields?: Record<string, number | string>;
  catalogId?: string;
};

export type ModuleDiagnosis = {
  overallRisk: DiagnosisRiskLevel;
  summary: string;
  findings: DiagnosisFinding[];
  recommendations: DiagnosisRecommendation[];
};

export function maxDiagnosisRisk(levels: DiagnosisRiskLevel[]): DiagnosisRiskLevel {
  if (levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return "low";
}

export function riskFromSafetyFactor(
  sf: number | undefined | null,
  highBelow = 1,
  mediumBelow = 1.25
): DiagnosisRiskLevel | null {
  if (sf == null || !Number.isFinite(sf)) return null;
  if (sf < highBelow) return "high";
  if (sf < mediumBelow) return "medium";
  return "low";
}

export function riskFromUtilization(
  util: number | undefined | null,
  highAbove = 1,
  mediumAbove = 0.85
): DiagnosisRiskLevel | null {
  if (util == null || !Number.isFinite(util)) return null;
  if (util > highAbove) return "high";
  if (util > mediumAbove) return "medium";
  return "low";
}

/** Empty diagnosis when a module has no safety metrics to screen. */
export function emptyDiagnosis(summary = "No safety metrics exposed yet for Diagnose screening."): ModuleDiagnosis {
  return {
    overallRisk: "low",
    summary,
    findings: [],
    recommendations: [],
  };
}

/**
 * Plain-bearing failure-risk screening for diagnose workflow.
 * Uses film / load / temperature outputs — not OEM catalog ranking.
 */

import type { PlainBearingConfig, PlainBearingResult } from "./types";

export type PlainBearingRiskLevel = "low" | "medium" | "high";

export type PlainBearingDiagnosisCategory =
  | "film"
  | "overload"
  | "thermal"
  | "clearance"
  | "viscosity"
  | "geometry";

export type PlainBearingDiagnosisFinding = {
  category: PlainBearingDiagnosisCategory;
  level: PlainBearingRiskLevel;
  title: string;
  detail: string;
};

export type PlainBearingAdjustment = {
  id: string;
  label: string;
  detail: string;
  fields: Partial<{
    clearanceUm: number;
    lengthMm: number;
    viscosity: number;
    diameterMm: number;
    padCount: number;
  }>;
};

export type PlainBearingDiagnosis = {
  findings: PlainBearingDiagnosisFinding[];
  adjustments: PlainBearingAdjustment[];
  overallRisk: PlainBearingRiskLevel;
  summary: string;
};

function maxRisk(levels: PlainBearingRiskLevel[]): PlainBearingRiskLevel {
  if (levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return "low";
}

const CATEGORY_LABELS: Record<PlainBearingDiagnosisCategory, string> = {
  film: "Film",
  overload: "Overload",
  thermal: "Thermal",
  clearance: "Clearance",
  viscosity: "Viscosity",
  geometry: "Geometry",
};

export function plainDiagnosisCategoryLabel(
  category: PlainBearingDiagnosisCategory
): string {
  return CATEGORY_LABELS[category];
}

export function diagnosePlainBearing(
  result: PlainBearingResult,
  config: Pick<
    PlainBearingConfig,
    "bearingType" | "load" | "speed" | "diameter" | "length" | "clearance" | "viscosity"
  >
): PlainBearingDiagnosis {
  const findings: PlainBearingDiagnosisFinding[] = [];
  const adjustments: PlainBearingAdjustment[] = [];

  const filmUm = result.minFilmThickness * 1e6;
  const filmLimitUm = result.bearingType === "journal" ? 5 : 8;

  if (filmUm < filmLimitUm) {
    findings.push({
      category: "film",
      level: "high",
      title: "Inadequate minimum film thickness",
      detail: `h_min ≈ ${filmUm.toFixed(1)} µm is below the ${filmLimitUm} µm screening limit. Risk of boundary lubrication or pad contact.`,
    });
    adjustments.push({
      id: "increase_clearance",
      label: "Increase diametral clearance",
      detail: "Raise clearance toward ~0.1% of diameter for journal screening.",
      fields: { clearanceUm: Math.max(config.diameter * 1e3 * 1.2, 40) },
    });
    adjustments.push({
      id: "increase_viscosity",
      label: "Increase lubricant viscosity",
      detail: "Higher η raises Sommerfeld number and film thickness at fixed load/speed.",
      fields: { viscosity: Math.min(config.viscosity * 1.5, 0.2) },
    });
  } else if (filmUm < filmLimitUm * 1.5) {
    findings.push({
      category: "film",
      level: "medium",
      title: "Thin film margin",
      detail: `h_min ≈ ${filmUm.toFixed(1)} µm leaves little reserve for start-up or viscosity drop.`,
    });
  }

  if (result.bearingType === "journal" && result.eccentricityRatio > 0.9) {
    findings.push({
      category: "film",
      level: "high",
      title: "High eccentricity ratio",
      detail: `ε ≈ ${result.eccentricityRatio.toFixed(2)} approaches metal-to-metal contact. Reduce load or increase L·D / viscosity.`,
    });
  } else if (result.bearingType === "journal" && result.eccentricityRatio > 0.75) {
    findings.push({
      category: "film",
      level: "medium",
      title: "Elevated eccentricity",
      detail: `ε ≈ ${result.eccentricityRatio.toFixed(2)}. Film is still present but margins are thin.`,
    });
  }

  const specific = result.specificLoadPa ?? result.unitLoad ?? 0;
  const loadLimit = result.bearingType === "journal" ? 3.5e6 : 2.5e6;
  if (specific > loadLimit) {
    findings.push({
      category: "overload",
      level: "high",
      title: "Specific / unit load too high",
      detail: `Load intensity ${(specific / 1e6).toFixed(2)} MPa exceeds ${(loadLimit / 1e6).toFixed(1)} MPa screening limit.`,
    });
    if (result.bearingType === "journal") {
      adjustments.push({
        id: "increase_length",
        label: "Increase bearing length",
        detail: "Larger projected area reduces specific load.",
        fields: { lengthMm: (config.length * 1000) * 1.25 },
      });
    } else {
      adjustments.push({
        id: "increase_pads",
        label: "Increase pad count / area",
        detail: "More pads or larger outer diameter share axial load.",
        fields: { padCount: 8, diameterMm: config.diameter * 1000 * 1.15 },
      });
    }
  } else if (specific > loadLimit * 0.85) {
    findings.push({
      category: "overload",
      level: "medium",
      title: "High specific load",
      detail: `Operating near ${(loadLimit / 1e6).toFixed(1)} MPa screening limit.`,
    });
  }

  const outlet = result.outletTempC ?? 0;
  const rise = result.temperatureRiseC ?? 0;
  if (outlet > 120 || rise > 50) {
    findings.push({
      category: "thermal",
      level: outlet > 140 ? "high" : "medium",
      title: "Elevated operating temperature",
      detail: `ΔT ≈ ${rise.toFixed(0)} °C, outlet ≈ ${outlet.toFixed(0)} °C. Viscosity will drop and film capacity falls.`,
    });
    adjustments.push({
      id: "cool_or_thicken",
      label: "Improve cooling or raise viscosity",
      detail: "Lower power density or use a higher VG grade for screening.",
      fields: { viscosity: Math.min(config.viscosity * 1.3, 0.15) },
    });
  }

  if (
    result.minRecommendedClearanceUm != null &&
    config.clearance * 1e6 < result.minRecommendedClearanceUm * 0.7
  ) {
    findings.push({
      category: "clearance",
      level: "medium",
      title: "Clearance below recommended minimum",
      detail: `Entered clearance ${(config.clearance * 1e6).toFixed(0)} µm is below suggested ~${result.minRecommendedClearanceUm.toFixed(0)} µm.`,
    });
    adjustments.push({
      id: "apply_min_clearance",
      label: "Apply recommended minimum clearance",
      detail: `Set clearance to ${result.minRecommendedClearanceUm.toFixed(0)} µm.`,
      fields: { clearanceUm: result.minRecommendedClearanceUm },
    });
  }

  if (config.speed > 0 && config.viscosity < 0.01 && result.bearingType === "journal") {
    findings.push({
      category: "viscosity",
      level: "medium",
      title: "Low viscosity for duty",
      detail: "η < 0.01 Pa·s may be thin for industrial journal screening at this speed.",
    });
  }

  const ld = config.length / Math.max(config.diameter, 1e-9);
  if (result.bearingType === "journal" && (ld < 0.5 || ld > 2.0)) {
    findings.push({
      category: "geometry",
      level: "medium",
      title: "Unusual L/D ratio",
      detail: `L/D ≈ ${ld.toFixed(2)}. Typical journal screening uses ~0.8–1.5.`,
    });
  }

  const overallRisk = maxRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "low"
      ? "Film, load, and temperature screens are within typical limits."
      : overallRisk === "medium"
        ? "One or more screens are marginal — review film thickness, load intensity, or temperature."
        : "Critical film, load, or thermal risk — adjust geometry or lubricant before design freeze.";

  // Deduplicate adjustments by id
  const uniqueAdjustments = Array.from(
    new Map(adjustments.map((a) => [a.id, a])).values()
  );

  return {
    findings,
    adjustments: uniqueAdjustments,
    overallRisk,
    summary,
  };
}

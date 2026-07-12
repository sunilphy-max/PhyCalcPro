/**
 * Housing failure-risk screening for diagnose workflow.
 */

import type { HousingConfig, HousingResult } from "./types";

export type HousingRiskLevel = "low" | "medium" | "high";

export type HousingDiagnosisCategory =
  | "body"
  | "bolt"
  | "deflection"
  | "fit"
  | "geometry";

export type HousingDiagnosisFinding = {
  category: HousingDiagnosisCategory;
  level: HousingRiskLevel;
  title: string;
  detail: string;
};

export type HousingAdjustment = {
  id: string;
  label: string;
  detail: string;
  fields: Partial<{
    boltCount: number;
    boltCircleDiameterMm: number;
    yieldStressMPa: number;
    mountStyle: HousingConfig["mountStyle"];
  }>;
};

export type HousingDiagnosis = {
  findings: HousingDiagnosisFinding[];
  adjustments: HousingAdjustment[];
  overallRisk: HousingRiskLevel;
  summary: string;
};

function maxRisk(levels: HousingRiskLevel[]): HousingRiskLevel {
  if (levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return "low";
}

const CATEGORY_LABELS: Record<HousingDiagnosisCategory, string> = {
  body: "Body",
  bolt: "Bolts",
  deflection: "Deflection",
  fit: "Fits",
  geometry: "Geometry",
};

export function housingDiagnosisCategoryLabel(category: HousingDiagnosisCategory): string {
  return CATEGORY_LABELS[category];
}

export function diagnoseHousing(
  result: HousingResult,
  config: Pick<
    HousingConfig,
    "boreDiameter" | "radialLoad" | "axialLoad" | "boltCount" | "boltCircleDiameter" | "yieldStress" | "mountStyle"
  >
): HousingDiagnosis {
  const findings: HousingDiagnosisFinding[] = [];
  const adjustments: HousingAdjustment[] = [];

  if (result.bodySafetyFactor < 1.5) {
    findings.push({
      category: "body",
      level: "high",
      title: "Housing body overload",
      detail: `Body SF = ${result.bodySafetyFactor.toFixed(2)} < 1.5. Increase section, bolt circle, or material yield.`,
    });
    adjustments.push({
      id: "increase_bcd",
      label: "Increase bolt circle diameter",
      detail: "Larger BCD reduces bending moment arm on the body.",
      fields: { boltCircleDiameterMm: config.boltCircleDiameter * 1000 * 1.2 },
    });
    adjustments.push({
      id: "higher_yield",
      label: "Use higher-yield housing material",
      detail: "Raise Sy toward structural steel or cast steel grades.",
      fields: { yieldStressMPa: Math.max((config.yieldStress / 1e6) * 1.2, 300) },
    });
  } else if (result.bodySafetyFactor < 2) {
    findings.push({
      category: "body",
      level: "medium",
      title: "Marginal body safety factor",
      detail: `Body SF = ${result.bodySafetyFactor.toFixed(2)}. Acceptable for screening but thin for shock duty.`,
    });
  }

  // Bolt utilization vs recommended size — if recommended is larger than M12 under high load, flag
  const boltUtilHint =
    result.boltTensionPerBolt > 0.7 * config.yieldStress * 42.4e-6 ||
    result.boltShearPerBolt > 0.7 * config.yieldStress * 58e-6;
  if (boltUtilHint || result.recommendedBoltSize === "M20" || result.recommendedBoltSize === "M16") {
    findings.push({
      category: "bolt",
      level: result.recommendedBoltSize === "M20" ? "high" : "medium",
      title: "Bolt size / count may be undersized",
      detail: `Recommended fastener ≈ ${result.recommendedBoltSize}. Tension/bolt ${result.boltTensionPerBolt.toFixed(0)} N, shear/bolt ${result.boltShearPerBolt.toFixed(0)} N.`,
    });
    adjustments.push({
      id: "more_bolts",
      label: "Increase bolt count",
      detail: "Share tension and shear across more fasteners.",
      fields: { boltCount: Math.min(config.boltCount + 2, 12) },
    });
  }

  const deflUm = result.housingDeflection * 1e6;
  const boreUm = config.boreDiameter * 1e6;
  if (deflUm > boreUm * 0.002) {
    findings.push({
      category: "deflection",
      level: "medium",
      title: "High housing deflection",
      detail: `Deflection ≈ ${deflUm.toFixed(0)} µm may affect alignment and operating clearance.`,
    });
    adjustments.push({
      id: "stiffer_mount",
      label: "Prefer stiffer mount geometry",
      detail: "Flange mounts typically shorten the moment arm vs foot mounts.",
      fields: { mountStyle: "flange" },
    });
  }

  if (result.estimatedOperatingClearanceUm < 5) {
    findings.push({
      category: "fit",
      level: "medium",
      title: "Tight estimated operating clearance",
      detail: `Operating clearance ≈ ${result.estimatedOperatingClearanceUm.toFixed(0)} µm. Check thermal growth and CN vs C3.`,
    });
  }

  const bcdOverBore = config.boltCircleDiameter / Math.max(config.boreDiameter, 1e-9);
  if (bcdOverBore < 1.8) {
    findings.push({
      category: "geometry",
      level: "medium",
      title: "Compact bolt circle",
      detail: `BCD / bore ≈ ${bcdOverBore.toFixed(2)}. Typical pillow-block patterns are ~2.2–3× bore.`,
    });
  }

  const overallRisk = maxRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "low"
      ? "Body and bolt screens meet typical housing margins."
      : overallRisk === "medium"
        ? "Housing margins are thin — review body SF, bolt size, or deflection."
        : "Housing body or fasteners fail screening — redesign bolt pattern or material.";

  const uniqueAdjustments = Array.from(new Map(adjustments.map((a) => [a.id, a])).values());

  return {
    findings,
    adjustments: uniqueAdjustments,
    overallRisk,
    summary,
  };
}

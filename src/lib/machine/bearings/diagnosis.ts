/**
 * Bearing failure-risk screening for reliability / diagnose workflow.
 * Uses solver outputs plus operating inputs — not vibration analytics.
 */

import type { BearingCatalogEntry } from "@/data/catalogs/bearingCatalog";
import { rankCatalogBearings } from "./catalogSelection";
import type { BearingConfig, BearingResult } from "./types";

export type BearingRiskLevel = "low" | "medium" | "high";

export type BearingDiagnosisCategory =
  | "overload"
  | "lubrication"
  | "misalignment"
  | "speed"
  | "contamination"
  | "min_load"
  | "thermal"
  | "arrangement";

export type BearingDiagnosisFinding = {
  category: BearingDiagnosisCategory;
  level: BearingRiskLevel;
  title: string;
  detail: string;
};

export type BearingReplacementOption = {
  designation: string;
  manufacturer: string;
  modifiedLifeHours: number;
  dynamicUtilization: number;
  staticUtilization: number;
  speedMargin: number;
  passes: boolean;
};

export type BearingDiagnosis = {
  findings: BearingDiagnosisFinding[];
  replacements: BearingReplacementOption[];
  overallRisk: BearingRiskLevel;
  summary: string;
};

function maxRisk(levels: BearingRiskLevel[]): BearingRiskLevel {
  if (levels.includes("high")) return "high";
  if (levels.includes("medium")) return "medium";
  return "low";
}

function pushFinding(
  findings: BearingDiagnosisFinding[],
  finding: BearingDiagnosisFinding
) {
  findings.push(finding);
}

export function diagnoseBearing(
  result: BearingResult,
  config: Pick<
    BearingConfig,
    | "radialLoad"
    | "axialLoad"
    | "speed"
    | "bearingType"
    | "manufacturer"
    | "applicationProfile"
    | "arrangement"
    | "lubricantType"
    | "contamination"
    | "operatingTempC"
  >
): BearingDiagnosis {
  const findings: BearingDiagnosisFinding[] = [];

  if (result.dynamicUtilization > 1 || result.lifeUtilization > 1) {
    pushFinding(findings, {
      category: "overload",
      level: "high",
      title: "Dynamic overload",
      detail: `P/C = ${result.dynamicUtilization.toFixed(2)} and life utilization ${result.lifeUtilization.toFixed(2)} exceed rating limits. Increase dynamic rating C or reduce loads.`,
    });
  } else if (result.dynamicUtilization > 0.85 || result.lifeUtilization > 0.85) {
    pushFinding(findings, {
      category: "overload",
      level: "medium",
      title: "High load utilization",
      detail: `Operating near rating limit (P/C ${result.dynamicUtilization.toFixed(2)}). Margins are thin for shock or temperature excursions.`,
    });
  }

  if (result.staticSafetyFactor < 1) {
    pushFinding(findings, {
      category: "overload",
      level: "high",
      title: "Static overload",
      detail: `Static safety s₀ = ${result.staticSafetyFactor.toFixed(2)} < 1. Check peak loads, braking, and misalignment-induced axial thrust.`,
    });
  } else if (result.staticSafetyFactor < 1.5) {
    pushFinding(findings, {
      category: "overload",
      level: "medium",
      title: "Low static margin",
      detail: `s₀ = ${result.staticSafetyFactor.toFixed(2)} is below typical 1.5 screening minimum for variable duty.`,
    });
  }

  if (result.speedMargin != null && result.speedMargin < 1) {
    pushFinding(findings, {
      category: "speed",
      level: "high",
      title: "Speed limit exceeded",
      detail: `Speed margin n_lim/n = ${result.speedMargin.toFixed(2)}. Reduce speed or select a higher-speed series / precision grade.`,
    });
  } else if (result.speedMargin != null && result.speedMargin < 1.2) {
    pushFinding(findings, {
      category: "speed",
      level: "medium",
      title: "Low speed margin",
      detail: `Speed margin ${result.speedMargin.toFixed(2)} leaves little reserve for run-up or overspeed events.`,
    });
  }

  if (!result.minLoadSatisfied) {
    pushFinding(findings, {
      category: "min_load",
      level: "high",
      title: "Skidding / minimum load risk",
      detail: `Radial load ${(Math.abs(config.radialLoad) / 1000).toFixed(2)} kN is below minimum for reliable rolling (≈ ${(result.minimumRadialLoadN / 1000).toFixed(2)} kN).`,
    });
  }

  const kappa = result.modifiedLifeFactors.kappa;
  const aIso = result.aIso;
  if (config.lubricantType && config.lubricantType !== "none") {
    if (kappa < 0.4 || aIso < 0.5) {
      pushFinding(findings, {
        category: "lubrication",
        level: "high",
        title: "Inadequate lubrication film",
        detail: `κ = ${kappa.toFixed(2)}, aISO = ${aIso.toFixed(2)}. Viscosity or temperature is insufficient — increase VG grade, improve oil supply, or reduce temperature.`,
      });
    } else if (kappa < 1 || aIso < 0.8) {
      pushFinding(findings, {
        category: "lubrication",
        level: "medium",
        title: "Marginal lubrication",
        detail: `κ = ${kappa.toFixed(2)}, aISO = ${aIso.toFixed(2)}. Film thickness is borderline; verify relubrication interval and operating temperature.`,
      });
    }
  } else if (result.modifiedLife < result.expectedLife * 0.7) {
    pushFinding(findings, {
      category: "lubrication",
      level: "medium",
      title: "Modified life penalty",
      detail: "Lnm is significantly below basic L10 — enable full lubrication inputs (ISO VG, temperature, contamination) for accurate screening.",
    });
  }

  const contamination = config.contamination;
  if (
    contamination === "typical_contamination" ||
    contamination === "heavy_contamination"
  ) {
    pushFinding(findings, {
      category: "contamination",
      level: contamination === "heavy_contamination" ? "high" : "medium",
      title: "Contamination exposure",
      detail: `eC = ${result.modifiedLifeFactors.eC.toFixed(3)}. Improve sealing, filtration, or relubrication interval for the duty environment.`,
    });
  }

  if (result.temperatureDeratingFactor < 0.95) {
    pushFinding(findings, {
      category: "thermal",
      level: "medium",
      title: "High operating temperature",
      detail: `Catalog C derated to ${(result.temperatureDeratingFactor * 100).toFixed(0)}% above 120 °C screening threshold.`,
    });
  }

  if (result.powerLossW > 500) {
    pushFinding(findings, {
      category: "thermal",
      level: "medium",
      title: "Elevated friction losses",
      detail: `Estimated power loss ${result.powerLossW.toFixed(0)} W — check preload, seal drag, and lubricant viscosity at operating temperature.`,
    });
  }

  if (result.thermalExpansion?.status === "insufficient") {
    pushFinding(findings, {
      category: "thermal",
      level: "high",
      title: "Insufficient thermal float",
      detail: result.thermalExpansion.note,
    });
  } else if (result.thermalExpansion?.status === "marginal") {
    pushFinding(findings, {
      category: "thermal",
      level: "medium",
      title: "Marginal thermal float",
      detail: result.thermalExpansion.note,
    });
  }

  const arr = result.arrangementAnalysis;
  if (arr) {
    if (arr.axialDisplacementStatus === "critical") {
      pushFinding(findings, {
        category: "arrangement",
        level: "high",
        title: "Excessive axial displacement",
        detail: arr.axialDisplacementNote,
      });
    } else if (arr.axialDisplacementStatus === "warning") {
      pushFinding(findings, {
        category: "arrangement",
        level: "medium",
        title: "Elevated axial displacement",
        detail: arr.axialDisplacementNote,
      });
    }

    if (
      arr.thermalPreloadChangeN != null &&
      arr.preloadForceN > 0 &&
      Math.abs(arr.thermalPreloadChangeN) > 0.4 * arr.preloadForceN
    ) {
      pushFinding(findings, {
        category: "arrangement",
        level: "medium",
        title: "Thermal preload shift",
        detail:
          arr.thermalNote ??
          `Warm-up changes preload by ~${(arr.thermalPreloadChangeN / 1000).toFixed(2)} kN — verify stiffness at operating temperature.`,
      });
    }

    if (arr.arrangement === "tandem") {
      pushFinding(findings, {
        category: "arrangement",
        level: "low",
        title: "Tandem axial capacity",
        detail:
          "Tandem shares axial load in one direction only — pair with reverse thrust support. O has ~12× higher moment stiffness for comparison.",
      });
    } else if (arr.arrangement === "face_to_face") {
      const oRow = arr.rigidityComparison.find((r) => r.arrangement === "back_to_back");
      if (oRow && arr.momentStiffnessNmPerMrad < 0.5 * oRow.momentStiffnessNmPerMrad) {
        pushFinding(findings, {
          category: "arrangement",
          level: "low",
          title: "X vs O moment rigidity",
          detail: `X moment stiffness is ${(100 * arr.momentStiffnessNmPerMrad / Math.max(oRow.momentStiffnessNmPerMrad, 1e-9)).toFixed(0)}% of O — prefer back-to-back for overhanging loads / spindles.`,
        });
      }
    }
  }

  const arrangement = config.arrangement ?? "single";
  const faOverFr = Math.abs(config.axialLoad) / Math.max(Math.abs(config.radialLoad), 1);
  if (
    (arrangement === "single" && faOverFr > 0.35 && config.bearingType === "deep_groove") ||
    (arrangement === "face_to_face" && faOverFr > 0.5)
  ) {
    pushFinding(findings, {
      category: "misalignment",
      level: faOverFr > 0.5 ? "high" : "medium",
      title: "Misalignment / thrust coupling risk",
      detail:
        arrangement === "single"
          ? `Fa/Fr = ${faOverFr.toFixed(2)} on a single deep-groove bearing — consider angular contact pair, self-aligning roller, or face-to-face arrangement.`
          : `High combined load on face-to-face pair — verify mounting stiffness and shaft deflection.`,
    });
  } else if (
    config.bearingType === "self_aligning_ball" ||
    config.bearingType === "spherical_roller"
  ) {
    pushFinding(findings, {
      category: "misalignment",
      level: "low",
      title: "Self-aligning family",
      detail: "Self-aligning bearing selected — angular misalignment capacity is higher, but overload and lubrication still govern life.",
    });
  }

  if (findings.length === 0) {
    pushFinding(findings, {
      category: "overload",
      level: "low",
      title: "No critical screening flags",
      detail: "ISO 281/76 checks pass with typical margins. Investigate installation, alignment, and maintenance history if field failures persist.",
    });
  }

  const overallRisk = maxRisk(findings.map((f) => f.level));

  const replacements = rankReplacements(result, config);

  const highCount = findings.filter((f) => f.level === "high").length;
  const summary =
    highCount > 0
      ? `${highCount} high-risk finding${highCount > 1 ? "s" : ""} — address overload, lubrication, or speed before returning to service.`
      : overallRisk === "medium"
        ? "Marginal operating conditions — monitor life and consider upgrades below."
        : "Screening checks pass; verify field symptoms against installation and maintenance records.";

  return { findings, replacements, overallRisk, summary };
}

function rankReplacements(
  result: BearingResult,
  config: Pick<
    BearingConfig,
    "bearingType" | "manufacturer" | "applicationProfile" | "speed"
  >
): BearingReplacementOption[] {
  const ranked = rankCatalogBearings({
    bearingType: config.bearingType,
    requiredDynamicRatingN: result.requiredDynamicRating,
    requiredStaticRatingN: result.requiredStaticRating,
    speedRpm: config.speed,
    manufacturer: config.manufacturer,
    applicationProfile: config.applicationProfile,
    boreMaxMm: result.geometry?.boreMm != null ? result.geometry.boreMm + 10 : undefined,
  });

  return ranked.slice(0, 5).map((row) => ({
    designation: row.entry.designation,
    manufacturer: row.entry.manufacturer,
    modifiedLifeHours: estimateReplacementLife(result, row.entry, config.speed),
    dynamicUtilization: row.dynamicUtilization,
    staticUtilization: row.staticUtilization,
    speedMargin: row.speedMargin,
    passes: row.passes,
  }));
}

function estimateReplacementLife(
  result: BearingResult,
  entry: BearingCatalogEntry,
  speedRpm: number
): number {
  const p = result.lifeExponent;
  const util = result.equivalentLoad / Math.max(entry.dynamicRatingN, 1);
  if (util <= 0) return Infinity;
  const basicRev = result.a1 * Math.pow(1 / util, p) * 1e6;
  const modifiedRev = basicRev * result.aIso;
  const speed = Math.max(speedRpm, 1);
  return modifiedRev / (60 * speed);
}

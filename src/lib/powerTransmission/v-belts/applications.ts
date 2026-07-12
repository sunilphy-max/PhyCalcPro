import type { VBeltResult } from "./types";

export type VBeltApplicationId =
  | "general"
  | "pump"
  | "compressor"
  | "fan"
  | "conveyor"
  | "agricultural"
  | "machine-tool"
  | "packaging";

export type VBeltApplicationSubType = {
  id: string;
  label: string;
  /** Added to profile default service factor. */
  serviceFactorDelta?: number;
};

export type VBeltApplicationProfile = {
  id: VBeltApplicationId;
  label: string;
  summary: string;
  serviceFactorMin: number;
  serviceFactorMax: number;
  defaultServiceFactor: number;
  defaultOperatingHoursPerDay: number;
  subTypes?: VBeltApplicationSubType[];
  /** Typical catalog sections for notes / scoring only — never forced on the form. */
  preferredSections?: string[];
};

export const VBELT_APPLICATIONS: VBeltApplicationProfile[] = [
  {
    id: "general",
    label: "General industrial",
    summary: "Default screening for mixed industrial drives.",
    serviceFactorMin: 1.0,
    serviceFactorMax: 1.6,
    defaultServiceFactor: 1.2,
    defaultOperatingHoursPerDay: 16,
  },
  {
    id: "pump",
    label: "Pump",
    summary: "Electric motor drives for centrifugal or positive-displacement pumps.",
    serviceFactorMin: 1.0,
    serviceFactorMax: 1.3,
    defaultServiceFactor: 1.15,
    defaultOperatingHoursPerDay: 24,
    subTypes: [
      { id: "centrifugal", label: "Centrifugal", serviceFactorDelta: 0 },
      { id: "positive-displacement", label: "Positive displacement", serviceFactorDelta: 0.15 },
    ],
    preferredSections: ["B", "C", "5V"],
  },
  {
    id: "compressor",
    label: "Compressor",
    summary: "Pulsating torque and high starting loads.",
    serviceFactorMin: 1.4,
    serviceFactorMax: 2.0,
    defaultServiceFactor: 1.5,
    defaultOperatingHoursPerDay: 16,
    subTypes: [
      { id: "reciprocating", label: "Reciprocating", serviceFactorDelta: 0.2 },
      { id: "screw", label: "Screw", serviceFactorDelta: 0.05 },
      { id: "scroll", label: "Scroll", serviceFactorDelta: -0.05 },
    ],
    preferredSections: ["C", "D", "5V", "8V"],
  },
  {
    id: "fan",
    label: "Fan / blower",
    summary: "Smooth operation; often fixed or variable speed ratio.",
    serviceFactorMin: 1.0,
    serviceFactorMax: 1.2,
    defaultServiceFactor: 1.1,
    defaultOperatingHoursPerDay: 16,
    subTypes: [
      { id: "fixed-speed", label: "Fixed speed", serviceFactorDelta: 0 },
      { id: "variable-speed", label: "Variable pulley / speed", serviceFactorDelta: 0.05 },
    ],
    preferredSections: ["A", "B", "3V", "5V"],
  },
  {
    id: "conveyor",
    label: "Conveyor",
    summary: "Constant operation with startup inertia.",
    serviceFactorMin: 1.4,
    serviceFactorMax: 1.8,
    defaultServiceFactor: 1.5,
    defaultOperatingHoursPerDay: 16,
    subTypes: [
      { id: "belt", label: "Belt conveyor", serviceFactorDelta: 0 },
      { id: "roller", label: "Roller conveyor", serviceFactorDelta: 0.1 },
    ],
    preferredSections: ["B", "C", "5V"],
  },
  {
    id: "agricultural",
    label: "Agricultural machinery",
    summary: "Dust, shock, and variable outdoor loads.",
    serviceFactorMin: 1.5,
    serviceFactorMax: 2.5,
    defaultServiceFactor: 1.8,
    defaultOperatingHoursPerDay: 8,
    preferredSections: ["C", "D", "5V", "8V"],
  },
  {
    id: "machine-tool",
    label: "Machine tool",
    summary: "Precision speed with low vibration requirements.",
    serviceFactorMin: 1.1,
    serviceFactorMax: 1.4,
    defaultServiceFactor: 1.2,
    defaultOperatingHoursPerDay: 8,
    subTypes: [
      { id: "standard", label: "Standard accuracy", serviceFactorDelta: 0 },
      { id: "high", label: "High speed accuracy", serviceFactorDelta: 0.1 },
    ],
    preferredSections: ["A", "B", "3V"],
  },
  {
    id: "packaging",
    label: "Packaging equipment",
    summary: "Frequent start/stop and high cycle counts.",
    serviceFactorMin: 1.3,
    serviceFactorMax: 1.8,
    defaultServiceFactor: 1.45,
    defaultOperatingHoursPerDay: 16,
    preferredSections: ["B", "5V"],
  },
];

export type VBeltApplicationOptions = {
  applicationId: VBeltApplicationId;
  subTypeId?: string;
  operatingHoursPerDay: number;
  dutyCycle?: "continuous" | "intermittent" | "batch";
  shockSeverity?: "low" | "medium" | "high";
  outdoorEnvironment?: boolean;
  conveyorLengthM?: number;
  materialWeightKg?: number;
  cyclesPerMinute?: number;
  startStopFrequency?: "low" | "medium" | "high";
  speedAccuracy?: "standard" | "high";
  variableSpeed?: boolean;
};

export type VBeltApplicationInsights = {
  applicationId: VBeltApplicationId;
  applicationLabel: string;
  serviceFactorSource: "application" | "manual";
  serviceFactorRange: { min: number; max: number };
  recommendedServiceFactor: number;
  warnings: string[];
  recommendations: string[];
  efficiencyLossPercent: number;
  estimatedBeltLifeHours: number;
  maintenanceIntervalHours: number;
  startupTorqueFactor: number;
  beltSectionNote?: string;
};

export function getApplicationProfile(id: VBeltApplicationId): VBeltApplicationProfile {
  return VBELT_APPLICATIONS.find((item) => item.id === id) ?? VBELT_APPLICATIONS[0]!;
}

export function resolveApplicationServiceFactor(
  options: VBeltApplicationOptions,
  manualFactor: number,
  useManualServiceFactor: boolean
): { factor: number; source: "application" | "manual"; range: { min: number; max: number } } {
  const profile = getApplicationProfile(options.applicationId);
  const range = { min: profile.serviceFactorMin, max: profile.serviceFactorMax };

  if (useManualServiceFactor) {
    return { factor: manualFactor, source: "manual", range };
  }

  let factor = profile.defaultServiceFactor;
  const sub = profile.subTypes?.find((item) => item.id === options.subTypeId);
  if (sub?.serviceFactorDelta) factor += sub.serviceFactorDelta;

  if (options.dutyCycle === "intermittent") factor += 0.05;
  if (options.dutyCycle === "batch") factor += 0.1;
  if (options.shockSeverity === "medium") factor += 0.15;
  if (options.shockSeverity === "high") factor += 0.3;
  if (options.outdoorEnvironment) factor += 0.1;
  if (options.startStopFrequency === "medium") factor += 0.1;
  if (options.startStopFrequency === "high") factor += 0.2;
  if (options.speedAccuracy === "high") factor += 0.05;
  if (options.cyclesPerMinute != null && options.cyclesPerMinute > 30) factor += 0.1;

  factor = Math.min(range.max, Math.max(range.min, factor));
  return { factor, source: "application", range };
}

function beltLifeBaseHours(applicationId: VBeltApplicationId): number {
  switch (applicationId) {
    case "fan":
    case "pump":
      return 24_000;
    case "machine-tool":
      return 20_000;
    case "compressor":
    case "conveyor":
      return 16_000;
    case "packaging":
      return 12_000;
    case "agricultural":
      return 10_000;
    default:
      return 18_000;
  }
}

export function buildApplicationInsights(
  result: VBeltResult,
  options: VBeltApplicationOptions,
  serviceFactorUsed: number,
  serviceFactorSource: "application" | "manual"
): VBeltApplicationInsights {
  const profile = getApplicationProfile(options.applicationId);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (result.wrapAngleDriver < 120) {
    warnings.push("Driver wrap angle is below 120° — increase center distance or pulley sizes to improve grip.");
  }
  if (result.beltSpeed > 30) {
    warnings.push("Belt speed exceeds 30 m/s — verify manufacturer speed limits and guard requirements.");
  }
  if (serviceFactorUsed > profile.serviceFactorMax) {
    warnings.push(
      `Service factor ${serviceFactorUsed.toFixed(2)} exceeds typical ${profile.label.toLowerCase()} range (${profile.serviceFactorMin}–${profile.serviceFactorMax}).`
    );
  }
  if (serviceFactorUsed < profile.serviceFactorMin) {
    warnings.push(
      `Service factor ${serviceFactorUsed.toFixed(2)} is below typical ${profile.label.toLowerCase()} range — drive may be under-designed.`
    );
  }

  switch (options.applicationId) {
    case "pump":
      recommendations.push("Confirm NPSH and hydraulic load separately — belt drive only sizes mechanical power transmission.");
      if (options.subTypeId === "positive-displacement") {
        recommendations.push("Positive-displacement pumps benefit from higher pretension checks at startup.");
      }
      break;
    case "compressor":
      recommendations.push("Verify motor starting torque and compressor unload strategy; belt slip at start is common.");
      recommendations.push("Monitor belt tension after the first 8–24 hours of operation.");
      break;
    case "fan":
      recommendations.push("For variable airflow, consider adjustable pitch or variable pulley ratio in final design.");
      if (result.ratio > 2.5) {
        recommendations.push("High speed ratio — confirm driven fan critical speed margin.");
      }
      break;
    case "conveyor":
      recommendations.push("Account for full-load startup inertia; consider soft-start motor if belt count is high.");
      if (options.materialWeightKg != null && options.materialWeightKg > 5000) {
        recommendations.push("Heavy material loading — verify conveyor brake and backstop requirements.");
      }
      break;
    case "agricultural":
      recommendations.push("Use shielded belts and increased inspection frequency in dusty outdoor environments.");
      if (options.outdoorEnvironment) {
        recommendations.push("Outdoor duty — plan for contamination and UV exposure in belt selection.");
      }
      break;
    case "machine-tool":
      recommendations.push("Minimize belt vibration: align pulleys within 0.5 mm and balance driver/driven components.");
      if (options.speedAccuracy === "high") {
        recommendations.push("High speed accuracy — prefer matched belt sets and narrow V-belt sections.");
      }
      break;
    case "packaging":
      recommendations.push("Frequent indexing increases flex fatigue — schedule tension checks every maintenance window.");
      if (options.startStopFrequency === "high") {
        recommendations.push("High start/stop rate — consider synchronous belt if positioning accuracy is critical.");
      }
      break;
    default:
      recommendations.push("Confirm final belt selection with manufacturer power rating tables (Gates, Conti, RMA/ISO).");
  }

  if (profile.preferredSections?.includes(result.beltSection)) {
    recommendations.push(`Section ${result.beltSection} is commonly used for ${profile.label.toLowerCase()} drives.`);
  }

  const lifeScale =
    (1 / serviceFactorUsed) *
    (result.wrapAngleDriver >= 160 ? 1.1 : result.wrapAngleDriver >= 120 ? 1 : 0.75) *
    (result.beltSpeed <= 25 ? 1 : 0.85) *
    (options.operatingHoursPerDay >= 20 ? 0.9 : 1);

  const estimatedBeltLifeHours = Math.round(beltLifeBaseHours(options.applicationId) * lifeScale);
  const maintenanceIntervalHours = Math.max(500, Math.round(estimatedBeltLifeHours * 0.25));

  const efficiencyLossPercent =
    options.applicationId === "machine-tool"
      ? 1.5 + (result.beltSpeed > 20 ? 0.5 : 0)
      : 2 + (result.powerUtilization > 0.9 ? 0.5 : 0);

  const startupTorqueFactor =
    options.applicationId === "compressor" || options.applicationId === "conveyor"
      ? 1.5 + (options.shockSeverity === "high" ? 0.3 : 0)
      : options.applicationId === "agricultural"
        ? 1.4
        : 1.2;

  return {
    applicationId: options.applicationId,
    applicationLabel: profile.label,
    serviceFactorSource,
    serviceFactorRange: { min: profile.serviceFactorMin, max: profile.serviceFactorMax },
    recommendedServiceFactor: resolveApplicationServiceFactor(options, serviceFactorUsed, false).factor,
    warnings,
    recommendations,
    efficiencyLossPercent,
    estimatedBeltLifeHours,
    maintenanceIntervalHours,
    startupTorqueFactor,
    beltSectionNote: profile.preferredSections
      ? `Typical sections: ${profile.preferredSections.join(", ")}`
      : undefined,
  };
}

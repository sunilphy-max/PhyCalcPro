/**
 * Bearing Application System Designer — project model, intent, and stage spine.
 * Wraps existing solver types; does not replace BearingConfig / BearingResult.
 */

import type { BearingArrangement, BearingLifeMethod, BearingType } from "./types";

/** Mirrors BearingMountingSystemId — kept in lib to avoid UI → lib cycles. */
export type BearingMountingSystemId =
  | "single"
  | "locating_dg_floating_nu"
  | "locating_ac_floating_nu"
  | "duplex_angular";

export type BearingDesignerIntent = "design" | "service";

export type BearingDesignerStageId =
  | "system"
  | "duty"
  | "size"
  | "verify"
  | "report";

export type BearingStationRole =
  | "single"
  | "locating"
  | "floating"
  | "duplex_a"
  | "duplex_b";

export type BearingProjectStation = {
  id: string;
  role: BearingStationRole;
  label: string;
  bearingType?: BearingType;
  designation?: string;
  /** Radial reaction at station (N), when known from shaft handoff or split. */
  radialLoadN?: number;
  /** Axial reaction at station (N). */
  axialLoadN?: number;
  /** Shaft slope at station (mrad) from FEM handoff. */
  slopeMrad?: number;
};

export type BearingMethodLadderStep = {
  id: BearingLifeMethod | "oem_fea";
  label: string;
  description: string;
  tier: "catalog" | "modified" | "screen" | "handoff";
};

export const METHOD_LADDER: BearingMethodLadderStep[] = [
  {
    id: "iso281",
    label: "ISO 281 basic / modified",
    description: "Catalog L₁₀ and a₁ · aISO life from κ, eC, Pu — day-to-day sizing.",
    tier: "catalog",
  },
  {
    id: "iso16281_screen",
    label: "ISO 16281 screen",
    description: "Clearance / misalignment / distribution load factors — not full FEA.",
    tier: "screen",
  },
  {
    id: "stress_life_screen",
    label: "Stress-life screen",
    description: "Transparent PhyCalcPro stress modifier — not vendor GBLM / AFC.",
    tier: "screen",
  },
  {
    id: "oem_fea",
    label: "OEM / FEA handoff",
    description: "SKF Product Select, SimPro, Bearinx, or elastic analysis for release drawings.",
    tier: "handoff",
  },
];

export type DesignerStageDef = {
  id: BearingDesignerStageId;
  designLabel: string;
  serviceLabel: string;
  designDescription: string;
  serviceDescription: string;
};

export const DESIGNER_STAGES: DesignerStageDef[] = [
  {
    id: "system",
    designLabel: "System",
    serviceLabel: "Identify",
    designDescription: "Stations, arrangement, and bearing family",
    serviceDescription: "Designation and mounting topology",
  },
  {
    id: "duty",
    designLabel: "Duty",
    serviceLabel: "Duty",
    designDescription: "Loads, speed, life target, and environment",
    serviceDescription: "Operating loads, speed, and lubricant conditions",
  },
  {
    id: "size",
    designLabel: "Size",
    serviceLabel: "Evaluate",
    designDescription: "Catalog filters and designation ranking",
    serviceDescription: "Confirm ratings and catalog match",
  },
  {
    id: "verify",
    designLabel: "Verify",
    serviceLabel: "Diagnose",
    designDescription: "Life method, fits, misalignment, and advanced checks",
    serviceDescription: "Failure modes, interchange, and CM frequencies",
  },
  {
    id: "report",
    designLabel: "Report",
    serviceLabel: "Actions",
    designDescription: "Calculate, save, and export the design decision",
    serviceDescription: "Corrective actions and project export",
  },
];

export function parseDesignerIntent(value: string | null | undefined): BearingDesignerIntent {
  return value === "service" ? "service" : "design";
}

export function parseDesignerStage(value: string | null | undefined): BearingDesignerStageId | null {
  if (
    value === "system" ||
    value === "duty" ||
    value === "size" ||
    value === "verify" ||
    value === "report"
  ) {
    return value;
  }
  /** Legacy focused-tool deep links */
  if (value === "life" || value === "loads" || value === "lubrication" || value === "speed") {
    return "verify";
  }
  if (value === "arrangement" || value === "mounting") return "system";
  if (value === "failure" || value === "diagnose") return "verify";
  return null;
}

export function stageLabel(stage: DesignerStageDef, intent: BearingDesignerIntent): string {
  return intent === "service" ? stage.serviceLabel : stage.designLabel;
}

export function stageDescription(stage: DesignerStageDef, intent: BearingDesignerIntent): string {
  return intent === "service" ? stage.serviceDescription : stage.designDescription;
}

export function defaultStageForIntent(intent: BearingDesignerIntent): BearingDesignerStageId {
  return "system";
}

/** Map mounting system id → dynamic station list. */
export function stationsFromMountingSystem(
  mountingSystem: BearingMountingSystemId,
  arrangement: BearingArrangement,
  opts?: {
    designation?: string;
    floatingDesignation?: string;
    bearingType?: BearingType;
    stationRadialLoadsN?: number[];
    stationSlopesMrad?: number[];
  }
): BearingProjectStation[] {
  const rad = opts?.stationRadialLoadsN;
  const slopes = opts?.stationSlopesMrad;

  if (mountingSystem === "single") {
    return [
      {
        id: "station-0",
        role: "single",
        label: "Bearing",
        bearingType: opts?.bearingType,
        designation: opts?.designation,
        radialLoadN: rad?.[0],
        slopeMrad: slopes?.[0],
      },
    ];
  }

  if (mountingSystem === "duplex_angular" || arrangement !== "single") {
    return [
      {
        id: "station-0",
        role: "duplex_a",
        label: "Station A",
        bearingType: opts?.bearingType ?? "angular_contact",
        designation: opts?.designation,
        radialLoadN: rad?.[0],
        slopeMrad: slopes?.[0],
      },
      {
        id: "station-1",
        role: "duplex_b",
        label: "Station B",
        bearingType: opts?.bearingType ?? "angular_contact",
        designation: opts?.designation,
        radialLoadN: rad?.[1] ?? rad?.[0],
        slopeMrad: slopes?.[1] ?? slopes?.[0],
      },
    ];
  }

  return [
    {
      id: "station-0",
      role: "locating",
      label: "Locating",
      bearingType: opts?.bearingType,
      designation: opts?.designation,
      radialLoadN: rad?.[0],
      slopeMrad: slopes?.[0],
    },
    {
      id: "station-1",
      role: "floating",
      label: "Floating",
      bearingType: "cylindrical_roller",
      designation: opts?.floatingDesignation,
      radialLoadN: rad?.[1],
      slopeMrad: slopes?.[1],
    },
  ];
}

export type SystemTopologyPreset = "single" | "locating_floating" | "duplex";

export function topologyFromMounting(mountingSystem: BearingMountingSystemId): SystemTopologyPreset {
  if (mountingSystem === "single") return "single";
  if (mountingSystem === "duplex_angular") return "duplex";
  return "locating_floating";
}

export function mountingFromTopology(
  topology: SystemTopologyPreset,
  previous: BearingMountingSystemId
): BearingMountingSystemId {
  if (topology === "single") return "single";
  if (topology === "duplex") return "duplex_angular";
  if (
    previous === "locating_dg_floating_nu" ||
    previous === "locating_ac_floating_nu"
  ) {
    return previous;
  }
  return "locating_dg_floating_nu";
}

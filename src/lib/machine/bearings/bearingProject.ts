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
  /** SKF selection-process step numbers this stage covers (design intent). */
  skfSteps: number[];
};

/**
 * Stage definitions aligned with SKF bearing selection process:
 * 1 Requirements → 2 Type & arrangement → 3 Size → 4–8 Lube/speed/interfaces/execution/mounting.
 * @see https://www.skf.com/us/products/rolling-bearings/principles-of-rolling-bearing-selection/bearing-selection-process
 */
export const DESIGNER_STAGES: DesignerStageDef[] = [
  {
    id: "duty",
    designLabel: "Requirements",
    serviceLabel: "Duty",
    designDescription: "Performance targets and operating conditions (SKF step 1)",
    serviceDescription: "Operating loads, speed, and life target",
    skfSteps: [1],
  },
  {
    id: "system",
    designLabel: "Type & arrangement",
    serviceLabel: "Identify",
    designDescription: "Bearing family, stations, and locating layout (SKF step 2)",
    serviceDescription: "Installed designation and mounting topology",
    skfSteps: [2],
  },
  {
    id: "size",
    designLabel: "Bearing size",
    serviceLabel: "Evaluate",
    designDescription: "Catalog filters and capacity ranking (SKF step 3)",
    serviceDescription: "Confirm ratings and catalog match",
    skfSteps: [3],
  },
  {
    id: "verify",
    designLabel: "Lube & interfaces",
    serviceLabel: "Diagnose",
    designDescription:
      "Lubrication, temperature/speed, fits, clearance, sealing (SKF steps 4–8)",
    serviceDescription: "Failure modes, interchange, grease life, CM frequencies",
    skfSteps: [4, 5, 6, 7, 8],
  },
  {
    id: "report",
    designLabel: "Decision",
    serviceLabel: "Actions",
    designDescription: "Pass/fail verdict, save, and export",
    serviceDescription: "Corrective actions and project export",
    skfSteps: [],
  },
];

/** Design follows SKF order: requirements before type/arrangement. */
export const DESIGN_STAGE_ORDER: BearingDesignerStageId[] = [
  "duty",
  "system",
  "size",
  "verify",
  "report",
];

/** Service starts from the installed bearing, then duty and checks. */
export const SERVICE_STAGE_ORDER: BearingDesignerStageId[] = [
  "system",
  "duty",
  "size",
  "verify",
  "report",
];

/** Hub / docs — full SKF eight-step map into Designer panels. */
export const SKF_SELECTION_PROCESS_STEPS: {
  step: number;
  title: string;
  summary: string;
  panel: BearingDesignerStageId;
  href: string;
}[] = [
  {
    step: 1,
    title: "Performance & operating conditions",
    summary: "Life, load, speed, temperature, cleanliness, and space limits",
    panel: "duty",
    href: "/products/bearings/designer?intent=design&panel=duty",
  },
  {
    step: 2,
    title: "Bearing type and arrangement",
    summary: "Family, locating/floating or duplex O / X / T",
    panel: "system",
    href: "/products/bearings/designer?intent=design&panel=system",
  },
  {
    step: 3,
    title: "Bearing size",
    summary: "Dynamic / static capacity and catalog designation",
    panel: "size",
    href: "/products/bearings/designer?intent=design&panel=size",
  },
  {
    step: 4,
    title: "Lubrication",
    summary: "Oil/grease, viscosity ratio κ, contamination eC",
    panel: "verify",
    href: "/products/bearings/designer?intent=design&panel=verify",
  },
  {
    step: 5,
    title: "Operating temperature and speed",
    summary: "Thermal equilibrium, limiting and reference speed",
    panel: "verify",
    href: "/products/bearings/designer?intent=design&panel=verify",
  },
  {
    step: 6,
    title: "Bearing interfaces",
    summary: "Shaft and housing fits, operating clearance",
    panel: "verify",
    href: "/products/bearings/designer?intent=design&panel=verify",
  },
  {
    step: 7,
    title: "Bearing execution",
    summary: "Clearance class, precision, cage / rolling-element material",
    panel: "verify",
    href: "/products/bearings/designer?intent=design&panel=verify",
  },
  {
    step: 8,
    title: "Sealing, mounting and dismounting",
    summary: "Seal type, mounting practice, maintenance path",
    panel: "verify",
    href: "/products/bearings/designer?intent=design&panel=verify",
  },
];

export function stagesForIntent(intent: BearingDesignerIntent): DesignerStageDef[] {
  const order = intent === "service" ? SERVICE_STAGE_ORDER : DESIGN_STAGE_ORDER;
  return order.map((id) => DESIGNER_STAGES.find((s) => s.id === id)!);
}

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
  /** Aliases + legacy deep links */
  if (value === "requirements" || value === "loads") return "duty";
  if (value === "type" || value === "arrangement" || value === "mounting") return "system";
  if (value === "life" || value === "lubrication" || value === "speed" || value === "interfaces") {
    return "verify";
  }
  if (value === "failure" || value === "diagnose") return "verify";
  if (value === "decision") return "report";
  return null;
}

export function stageLabel(stage: DesignerStageDef, intent: BearingDesignerIntent): string {
  return intent === "service" ? stage.serviceLabel : stage.designLabel;
}

export function stageDescription(stage: DesignerStageDef, intent: BearingDesignerIntent): string {
  return intent === "service" ? stage.serviceDescription : stage.designDescription;
}

export function defaultStageForIntent(intent: BearingDesignerIntent): BearingDesignerStageId {
  return intent === "service" ? "system" : "duty";
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

/**
 * Bearing System Designer — project model, intent, and stage spine.
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

/**
 * Single product job — replaces dual `intent` + `mode` vocabulary for entry routing.
 * Legacy URL params (`intent`, `mode`) still parse via helpers below.
 */
export type BearingJob = "autoDesign" | "validate" | "compare" | "diagnose";

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
    description: "Transparent PhyCalcPro stress modifier — screening only.",
    tier: "screen",
  },
  {
    id: "oem_fea",
    label: "OEM / FEA handoff",
    description: "Confirm critical duty with OEM datasheets or elastic FEA for release drawings.",
    tier: "handoff",
  },
];

export type DesignerStageDef = {
  id: BearingDesignerStageId;
  designLabel: string;
  serviceLabel: string;
  designDescription: string;
  serviceDescription: string;
  /** PhyCalc selection-process step numbers this stage covers (design intent). */
  processSteps: number[];
};

/**
 * Stage definitions for the PhyCalcPro bearing selection process:
 * 1 Requirements → 2 Type & arrangement → 3 Size → 4–8 Lube/speed/interfaces/execution/mounting.
 */
export const DESIGNER_STAGES: DesignerStageDef[] = [
  {
    id: "duty",
    designLabel: "Requirements",
    serviceLabel: "Duty",
    designDescription: "Performance targets and operating conditions (step 1)",
    serviceDescription: "Operating loads, speed, and life target",
    processSteps: [1],
  },
  {
    id: "system",
    designLabel: "Type & arrangement",
    serviceLabel: "Identify",
    designDescription: "Bearing family, stations, and locating layout (step 2)",
    serviceDescription: "Installed designation and mounting topology",
    processSteps: [2],
  },
  {
    id: "size",
    designLabel: "Bearing size",
    serviceLabel: "Evaluate",
    designDescription: "Catalog filters and capacity ranking (step 3)",
    serviceDescription: "Confirm ratings and catalog match",
    processSteps: [3],
  },
  {
    id: "verify",
    designLabel: "Lube & interfaces",
    serviceLabel: "Diagnose",
    designDescription:
      "Lubrication, temperature/speed, fits, clearance, sealing (steps 4–8)",
    serviceDescription: "Failure modes, interchange, grease life, CM frequencies",
    processSteps: [4, 5, 6, 7, 8],
  },
  {
    id: "report",
    designLabel: "Decision",
    serviceLabel: "Actions",
    designDescription: "Pass/fail verdict, save, and export",
    serviceDescription: "Corrective actions and project export",
    processSteps: [],
  },
];

/** Design follows PhyCalc order: requirements before type/arrangement. */
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

/** Job → Designer intent (stage order). */
export function intentFromJob(job: BearingJob): BearingDesignerIntent {
  return job === "diagnose" ? "service" : "design";
}

/** Job → cross-product DesignWorkflowMode id (`design` | `check` | `select` | `diagnose`). */
export function workflowModeFromJob(job: BearingJob): "design" | "check" | "select" | "diagnose" {
  if (job === "autoDesign") return "design";
  if (job === "validate") return "check";
  if (job === "compare") return "select";
  return "diagnose";
}

export function defaultStageForJob(job: BearingJob): BearingDesignerStageId {
  if (job === "diagnose") return "system";
  if (job === "validate" || job === "compare") return "size";
  return "duty";
}

export function parseBearingJob(value: string | null | undefined): BearingJob | null {
  if (!value) return null;
  const v = value.toLowerCase().replace(/[_-]/g, "");
  if (v === "autodesign" || v === "design") return "autoDesign";
  if (v === "validate" || v === "check") return "validate";
  if (v === "compare" || v === "select") return "compare";
  if (v === "diagnose" || v === "service") return "diagnose";
  return null;
}

/**
 * Resolve job from URL. Prefer `job=`; fall back to legacy `mode` + `intent`.
 */
export function resolveBearingJob(params: {
  job?: string | null;
  mode?: string | null;
  intent?: string | null;
}): BearingJob {
  const fromJob = parseBearingJob(params.job ?? null);
  if (fromJob) return fromJob;
  const mode = (params.mode ?? "").toLowerCase();
  if (mode === "design" || mode === "autodesign" || mode === "auto-design") return "autoDesign";
  if (mode === "check" || mode === "validate") return "validate";
  if (mode === "select" || mode === "compare") return "compare";
  if (mode === "diagnose" || mode === "service") return "diagnose";
  if (params.intent === "service") return "diagnose";
  return "autoDesign";
}

export type DesignerHrefOptions = {
  job: BearingJob;
  panel?: BearingDesignerStageId;
  /** Extra query keys (designation, type, assistant, …). */
  extra?: Record<string, string | undefined | null>;
};

/** Canonical Designer deep link — writes job + legacy intent/mode/panel for compatibility. */
export function designerHref(opts: DesignerHrefOptions): string {
  const job = opts.job;
  const intent = intentFromJob(job);
  const mode = workflowModeFromJob(job);
  const panel = opts.panel ?? defaultStageForJob(job);
  const params = new URLSearchParams();
  params.set("job", job);
  params.set("intent", intent);
  params.set("mode", mode);
  params.set("panel", panel);
  if (opts.extra) {
    for (const [key, value] of Object.entries(opts.extra)) {
      if (value != null && value !== "") params.set(key, value);
    }
  }
  return `/products/bearings/designer?${params.toString()}`;
}

export function stagesForIntent(intent: BearingDesignerIntent): DesignerStageDef[] {
  const order = intent === "service" ? SERVICE_STAGE_ORDER : DESIGN_STAGE_ORDER;
  return order.map((id) => DESIGNER_STAGES.find((s) => s.id === id)!);
}

export function stagesForJob(job: BearingJob): DesignerStageDef[] {
  return stagesForIntent(intentFromJob(job));
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

/** Map UI mounting preset → engine topology + locating/floating families. */
export function toEngineMountingFields(mountingSystem: BearingMountingSystemId): {
  mountingSystem: SystemTopologyPreset;
  locatingBearingType?: BearingType;
  floatingBearingType?: BearingType;
} {
  if (mountingSystem === "single") {
    return { mountingSystem: "single" };
  }
  if (mountingSystem === "duplex_angular") {
    return { mountingSystem: "duplex" };
  }
  return {
    mountingSystem: "locating_floating",
    locatingBearingType:
      mountingSystem === "locating_ac_floating_nu" ? "angular_contact" : "deep_groove",
    floatingBearingType: "cylindrical_roller",
  };
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

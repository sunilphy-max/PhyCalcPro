/**
 * Bearing-scoped Design Copilot — ISO 281 catalog sizing only.
 *
 * Deterministic: parses the brief, runs `designBearingSelection`, returns a
 * catalog recommendation. Does not chain shafts, housing, or other modules.
 */

import { parseBrief } from "./paramParser";
import type { CopilotParams, ParsedToken } from "./types";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type {
  BearingApplicationProfile,
  BearingArrangement,
  BearingManufacturer,
  BearingType,
  ContaminationLevel,
  LubricantType,
} from "@/lib/machine/bearings/types";

const NUMBER = "([-+]?\\d+(?:[.,]\\d+)?(?:e[-+]?\\d+)?)";

/** Defaults aligned with `designBearingSelection` so Apply matches sizing. */
export const BEARING_COPILOT_LUBE_DEFAULTS = {
  lubricantType: "oil" as LubricantType,
  isoVgGrade: 68,
  operatingTempC: 70,
  contamination: "normal_clean" as ContaminationLevel,
};

export type BearingCopilotApplyPayload = {
  radialLoad?: number;
  axialLoad?: number;
  speed?: number;
  lifeHours?: number;
  safetyFactor?: number;
  bearingType?: BearingType;
  manufacturer?: BearingManufacturer;
  applicationProfile?: BearingApplicationProfile | "all";
  arrangement?: BearingArrangement;
  designation?: string;
  maxBoreMm?: number;
  lubricantType?: LubricantType;
  isoVgGrade?: number;
  operatingTempC?: number;
  contamination?: ContaminationLevel;
  /** Clear series/seal filters so the designation appears in the dropdown. */
  resetCatalogFilters?: boolean;
};

export type BearingCopilotSession = {
  briefText: string;
  params: CopilotParams;
  tokens: ParsedToken[];
  hints: string[];
  design: ModuleDesignModeResult | null;
  apply: BearingCopilotApplyPayload;
  status: "ok" | "error";
  notes: string[];
  /** True when Fr/n/life were parsed enough to apply loads even if catalog sizing failed. */
  canApplyLoads: boolean;
};

function parseNumber(raw: string): number {
  return Number.parseFloat(raw.replace(/,/g, "."));
}

function parseForceN(text: string, unitRaw: string): number {
  const unit = unitRaw.toLowerCase().replace(/\s/g, "");
  const value = parseNumber(text);
  if (unit === "kn") return value * 1e3;
  if (unit === "mn") return value * 1e6;
  if (unit === "kgf") return value * 9.80665;
  if (unit === "lbf" || unit === "lb") return value * 4.44822;
  return value;
}

/** Labelled radial / axial loads (Fr, Fa) — not covered by generic force parser. */
function parseDirectionalLoads(
  text: string
): { radialN?: number; axialN?: number; hints: string[] } {
  const hints: string[] = [];
  let radialN: number | undefined;
  let axialN: number | undefined;

  const patterns: Array<{ key: "radial" | "axial"; regex: RegExp }> = [
    {
      key: "radial",
      regex: new RegExp(
        `(?:radial(?:\\s+load)?|(?:\\bfr\\b))\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?`,
        "i"
      ),
    },
    {
      key: "radial",
      regex: new RegExp(
        `${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?\\s*(?:radial(?:\\s+load)?|(?:\\bfr\\b))`,
        "i"
      ),
    },
    {
      key: "axial",
      regex: new RegExp(
        `(?:axial(?:\\s+load)?|(?:\\bfa\\b))\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?`,
        "i"
      ),
    },
    {
      key: "axial",
      regex: new RegExp(
        `${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?\\s*(?:axial(?:\\s+load)?|(?:\\bfa\\b))`,
        "i"
      ),
    },
  ];

  for (const { key, regex } of patterns) {
    if (key === "radial" && radialN != null) continue;
    if (key === "axial" && axialN != null) continue;
    const match = regex.exec(text);
    if (!match) continue;
    // Group order differs for reverse patterns (value, unit) vs forward (value, unit).
    const valueN = parseForceN(match[1]!, match[2] ?? "n");
    if (key === "radial") radialN = valueN;
    else axialN = valueN;
    hints.push(`Detected ${key} load ${match[0].trim()}`);
  }

  return { radialN, axialN, hints };
}

/** Bore / shaft diameter in mm (generic length parser stores metres as `length`). */
function parseBoreMm(text: string, params: CopilotParams): { boreMm?: number; hint?: string } {
  const labelled = new RegExp(
    `(?:bore|shaft\\s*diameter|shaft\\s*ø|ø|\\bd\\b)\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(mm|cm|in|m)?`,
    "i"
  ).exec(text);
  if (labelled) {
    const value = parseNumber(labelled[1]!);
    const unit = (labelled[2] ?? "mm").toLowerCase();
    let mm = value;
    if (unit === "m") mm = value * 1000;
    else if (unit === "cm") mm = value * 10;
    else if (unit === "in") mm = value * 25.4;
    return { boreMm: mm, hint: `Bore / shaft Ø ${mm} mm` };
  }
  if (params.diameter != null) {
    return { boreMm: params.diameter * 1000, hint: `Diameter ${(params.diameter * 1000).toFixed(1)} mm` };
  }
  // Bare length only when phrased with shaft/bore context elsewhere, or single mm length
  if (params.length != null && /(bore|shaft|diameter|ø|\bd\b)/i.test(text)) {
    return { boreMm: params.length * 1000, hint: `Bore ${(params.length * 1000).toFixed(1)} mm` };
  }
  return {};
}

/** Extra life patterns beyond generic paramParser (e.g. "20000 hours", "L10h = 25000"). */
function parseLifeHours(text: string, existing?: number): number | undefined {
  if (existing != null) return existing;
  const patterns = [
    new RegExp(`(?:L10h?|required\\s*life|rating\\s*life)\\s*[:=]?\\s*${NUMBER}\\s*(?:h|hours|hrs)?`, "i"),
    new RegExp(`${NUMBER}\\s*(?:hours|hrs)\\b`, "i"),
    new RegExp(`${NUMBER}\\s*h\\b(?!\\w)`, "i"),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    const value = parseNumber(match[1]!);
    if (Number.isFinite(value) && value > 10) return value;
  }
  return undefined;
}

function inferBearingType(text: string): BearingType | undefined {
  const hay = text.toLowerCase();
  if (/deep\s*groove|ball\s*bearing/.test(hay)) return "deep_groove";
  if (/angular\s*contact/.test(hay)) return "angular_contact";
  if (/\bnup\b|cylindrical.*nup/.test(hay)) return "cylindrical_nup";
  if (/\bnj\b|cylindrical.*nj/.test(hay)) return "cylindrical_nj";
  if (/cylindrical\s*roller|\bnu\b/.test(hay)) return "cylindrical_roller";
  if (/tapered\s*roller/.test(hay)) return "tapered_roller";
  if (/spherical\s*roller/.test(hay)) return "spherical_roller";
  if (/needle\s*roller/.test(hay)) return "needle_roller";
  if (/self[- ]align/.test(hay)) return "self_aligning_ball";
  if (/thrust\s*ball/.test(hay)) return "thrust_ball";
  return undefined;
}

function inferManufacturer(text: string): BearingManufacturer | undefined {
  const hay = text.toLowerCase();
  if (/\bskf\b/.test(hay)) return "SKF";
  if (/\bfag\b|schaeffler/.test(hay)) return "FAG";
  if (/\bnsk\b/.test(hay)) return "NSK";
  if (/timken/.test(hay)) return "TIMKEN";
  if (/\bntn\b/.test(hay)) return "NTN";
  return undefined;
}

function inferArrangement(text: string): BearingArrangement | undefined {
  const hay = text.toLowerCase();
  if (/back[- ]to[- ]back|\bduplex\s*o\b|\bo\s*arrangement\b/.test(hay)) return "back_to_back";
  if (/face[- ]to[- ]face|\bduplex\s*x\b|\bx\s*arrangement\b/.test(hay)) return "face_to_face";
  if (/tandem|\bduplex\s*t\b/.test(hay)) return "tandem";
  return undefined;
}

function inferApplicationProfile(text: string): BearingApplicationProfile | "all" | undefined {
  const hay = text.toLowerCase();
  if (/high\s*speed/.test(hay)) return "high_speed";
  if (/heavy\s*shock|shock\s*load/.test(hay)) return "heavy_shock";
  if (/combined\s*load/.test(hay)) return "combined_loads";
  if (/pure\s*thrust|thrust\s*only/.test(hay)) return "pure_thrust";
  if (/space\s*limited|compact/.test(hay)) return "space_limited";
  return undefined;
}

function resolveLoads(
  params: CopilotParams,
  directional: { radialN?: number; axialN?: number }
): { radialN: number; axialN: number } {
  const hasRadial = directional.radialN != null;
  const hasAxial = directional.axialN != null;

  // Labelled Fr/Fa win — do not also dump generic `force` into the other axis.
  if (hasRadial || hasAxial) {
    return {
      radialN: directional.radialN ?? 0,
      axialN: directional.axialN ?? 0,
    };
  }

  return {
    radialN: params.force ?? 5000,
    axialN: 0,
  };
}

function toUserInputs(
  params: CopilotParams,
  loads: { radialN: number; axialN: number },
  text: string,
  lifeHours: number,
  boreMm?: number
): ModuleUserInputs {
  const bearingType = inferBearingType(text);
  const manufacturer = inferManufacturer(text);
  const arrangement = inferArrangement(text);
  const applicationProfile = inferApplicationProfile(text);

  return {
    maxForce: loads.radialN,
    axialLoad: loads.axialN,
    speedDriver: params.rpm ?? 1500,
    requiredLife: lifeHours,
    targetSafetyFactor: params.targetSafetyFactor ?? params.serviceFactor ?? 1.5,
    ...(bearingType ? { bearingType } : {}),
    ...(manufacturer ? { bearingManufacturer: manufacturer } : {}),
    ...(arrangement ? { bearingArrangement: arrangement } : {}),
    ...(applicationProfile ? { bearingApplicationProfile: applicationProfile } : {}),
    ...(boreMm != null ? { shaftDiameterMm: boreMm } : {}),
  };
}

function toApplyPayload(
  inputs: ModuleUserInputs,
  design: ModuleDesignModeResult | null,
  operatingTempC: number
): BearingCopilotApplyPayload {
  const fields = design?.best?.fields ?? {};
  return {
    radialLoad: inputs.maxForce,
    axialLoad: inputs.axialLoad,
    speed: inputs.speedDriver,
    lifeHours: inputs.requiredLife,
    safetyFactor: inputs.targetSafetyFactor,
    bearingType: (fields.bearingType as BearingType | undefined) ?? inputs.bearingType,
    manufacturer:
      (fields.manufacturer as BearingManufacturer | undefined) ?? inputs.bearingManufacturer,
    applicationProfile: inputs.bearingApplicationProfile,
    arrangement: inputs.bearingArrangement,
    designation: typeof fields.designation === "string" ? fields.designation : undefined,
    maxBoreMm: inputs.shaftDiameterMm,
    lubricantType: BEARING_COPILOT_LUBE_DEFAULTS.lubricantType,
    isoVgGrade: BEARING_COPILOT_LUBE_DEFAULTS.isoVgGrade,
    operatingTempC,
    contamination: BEARING_COPILOT_LUBE_DEFAULTS.contamination,
    resetCatalogFilters: true,
  };
}

/**
 * Run bearing-only copilot: parse brief → ISO 281 required C → rank catalog.
 */
export function runBearingCopilotSession(text: string): BearingCopilotSession {
  const trimmed = text.trim();
  const { params, tokens } = parseBrief(trimmed);
  const directional = parseDirectionalLoads(trimmed);
  const hints = [...directional.hints];

  const loads = resolveLoads(params, directional);
  if (directional.radialN == null && directional.axialN == null && params.force != null) {
    hints.push(`Radial load from force ${params.force} N`);
  }

  const lifeHours = parseLifeHours(trimmed, params.lifeHours) ?? 20000;
  if (params.lifeHours == null && lifeHours !== 20000) {
    hints.push(`Life target ${lifeHours} h`);
  } else if (params.lifeHours != null) {
    hints.push(`Life target ${params.lifeHours} h`);
  }

  const bore = parseBoreMm(trimmed, params);
  if (bore.hint) hints.push(bore.hint);

  const operatingTempC =
    params.temperature != null && Number.isFinite(params.temperature)
      ? params.temperature
      : BEARING_COPILOT_LUBE_DEFAULTS.operatingTempC;
  if (params.temperature != null) hints.push(`Operating temperature ${operatingTempC} °C`);

  const inferredType = inferBearingType(trimmed);
  if (inferredType) hints.push(`Bearing family: ${inferredType.replace(/_/g, " ")}`);
  const inferredMfr = inferManufacturer(trimmed);
  if (inferredMfr) hints.push(`Manufacturer preference: ${inferredMfr}`);
  const inferredArr = inferArrangement(trimmed);
  if (inferredArr) hints.push(`Arrangement: ${inferredArr.replace(/_/g, " ")}`);

  const inputs = toUserInputs(params, loads, trimmed, lifeHours, bore.boreMm);
  const notes: string[] = [
    "Bearing copilot uses ISO 281 required C, static C₀, and catalog speed limits — same engine as SKF Product Select screening.",
    `Lubrication applied as oil ISO VG ${BEARING_COPILOT_LUBE_DEFAULTS.isoVgGrade} at ${operatingTempC} °C (normal cleanliness) so Apply matches sizing.`,
  ];

  let design: ModuleDesignModeResult | null = null;
  let status: BearingCopilotSession["status"] = "ok";

  try {
    design = runModuleDesignMode("bearings", inputs) ?? null;
    if (!design?.best) {
      status = "error";
      notes.push(
        "No catalog bearing met the required dynamic rating and speed margin — relax life target or check loads. You can still apply parsed loads to the form."
      );
    }
  } catch (error) {
    status = "error";
    notes.push((error as Error).message);
  }

  const canApplyLoads =
    loads.radialN > 0 ||
    loads.axialN > 0 ||
    params.rpm != null ||
    params.lifeHours != null ||
    lifeHours !== 20000;

  return {
    briefText: trimmed,
    params,
    tokens,
    hints,
    design,
    apply: toApplyPayload(inputs, design, operatingTempC),
    status,
    notes,
    canApplyLoads,
  };
}

export const BEARING_COPILOT_EXAMPLES = [
  "Select a deep groove SKF bearing for 5 kN radial and 1 kN axial at 3000 rpm, 20000 hours life.",
  "Size angular contact bearing: 8 kN radial, 2 kN axial, 2500 rpm, L10 25000 h, safety factor 1.5.",
  "Tapered roller for 12 kN radial and 4 kN axial at 1500 rpm, 30000 h life, Timken catalog.",
  "Needle roller, 3 kN radial only, 4500 rpm, 15000 hours, compact envelope.",
] as const;

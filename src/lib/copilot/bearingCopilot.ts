/**
 * Bearing-scoped Design Copilot — ISO 281 catalog sizing only.
 *
 * Deterministic: parses the brief, runs `designBearingSelection`, returns a
 * catalog recommendation. Does not chain shafts, housing, or other modules.
 */

import { parseBrief, type CopilotParams, type ParsedToken } from "./paramParser";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type {
  BearingApplicationProfile,
  BearingArrangement,
  BearingManufacturer,
  BearingType,
} from "@/lib/machine/bearings/types";

const NUMBER = "([-+]?\\d+(?:[.,]\\d+)?(?:e[-+]?\\d+)?)";

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
      key: "axial",
      regex: new RegExp(
        `(?:axial(?:\\s+load)?|(?:\\bfa\\b))\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?`,
        "i"
      ),
    },
  ];

  for (const { key, regex } of patterns) {
    const match = regex.exec(text);
    if (!match) continue;
    const valueN = parseForceN(match[1]!, match[2] ?? "n");
    if (key === "radial") radialN = valueN;
    else axialN = valueN;
    hints.push(`Detected ${key} load ${match[0].trim()}`);
  }

  return { radialN, axialN, hints };
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
  if (/back[- ]to[- ]back|\bduplex\s*o\b/.test(hay)) return "back_to_back";
  if (/face[- ]to[- ]face|\bduplex\s*x\b/.test(hay)) return "face_to_face";
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

function toUserInputs(
  params: CopilotParams,
  directional: { radialN?: number; axialN?: number },
  text: string
): ModuleUserInputs {
  const bearingType = inferBearingType(text);
  const manufacturer = inferManufacturer(text);
  const arrangement = inferArrangement(text);
  const applicationProfile = inferApplicationProfile(text);

  return {
    maxForce: directional.radialN ?? params.force ?? 5000,
    axialLoad: directional.axialN ?? 0,
    speedDriver: params.rpm ?? 1500,
    requiredLife: params.lifeHours ?? 20000,
    targetSafetyFactor: params.targetSafetyFactor ?? params.serviceFactor ?? 1.5,
    ...(bearingType ? { bearingType } : {}),
    ...(manufacturer ? { bearingManufacturer: manufacturer } : {}),
    ...(arrangement ? { bearingArrangement: arrangement } : {}),
    ...(applicationProfile ? { bearingApplicationProfile: applicationProfile } : {}),
    ...(params.diameter != null ? { shaftDiameterMm: params.diameter * 1000 } : {}),
  };
}

function toApplyPayload(
  inputs: ModuleUserInputs,
  design: ModuleDesignModeResult | null
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

  const inferredType = inferBearingType(trimmed);
  if (inferredType) hints.push(`Bearing family: ${inferredType.replace(/_/g, " ")}`);
  const inferredMfr = inferManufacturer(trimmed);
  if (inferredMfr) hints.push(`Manufacturer preference: ${inferredMfr}`);

  const inputs = toUserInputs(params, directional, trimmed);
  const notes: string[] = [
    "Bearing copilot uses ISO 281 required C, static C₀, and catalog speed limits — same engine as SKF Product Select screening.",
    "Lubrication defaults to oil ISO VG 68 at 70 °C unless you set values manually after applying.",
  ];

  let design: ModuleDesignModeResult | null = null;
  let status: BearingCopilotSession["status"] = "ok";

  try {
    design = runModuleDesignMode("bearings", inputs);
    if (!design?.best) {
      status = "error";
      notes.push("No catalog bearing met the required dynamic rating and speed margin — relax life target or check loads.");
    }
  } catch (error) {
    status = "error";
    notes.push((error as Error).message);
  }

  return {
    briefText: trimmed,
    params,
    tokens,
    hints,
    design,
    apply: toApplyPayload(inputs, design),
    status,
    notes,
  };
}

export const BEARING_COPILOT_EXAMPLES = [
  "Select a deep groove SKF bearing for 5 kN radial and 1 kN axial at 3000 rpm, 20000 hours life.",
  "Size angular contact bearing: 8 kN radial, 2 kN axial, 2500 rpm, L10 25000 h, safety factor 1.5.",
  "Tapered roller for 12 kN radial and 4 kN axial at 1500 rpm, 30000 h life, Timken catalog.",
  "Needle roller, 3 kN radial only, 4500 rpm, 15000 hours, compact envelope.",
] as const;

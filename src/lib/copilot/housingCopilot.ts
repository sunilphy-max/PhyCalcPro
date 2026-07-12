/**
 * Housing-scoped Design Copilot — bolt pattern / body screening only.
 */

import { parseBrief } from "./paramParser";
import type { CopilotParams, ParsedToken } from "./types";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { HousingMountStyle } from "@/lib/machine/housing/types";

const NUMBER = "([-+]?\\d+(?:[.,]\\d+)?(?:e[-+]?\\d+)?)";

export type HousingCopilotApplyPayload = {
  boreMm?: number;
  radialLoad?: number;
  axialLoad?: number;
  speed?: number;
  mountStyle?: HousingMountStyle;
  boltCount?: number;
  boltCircleDiameterMm?: number;
  yieldStressMPa?: number;
};

export type HousingCopilotSession = {
  briefText: string;
  params: CopilotParams;
  tokens: ParsedToken[];
  hints: string[];
  design: ModuleDesignModeResult | null;
  apply: HousingCopilotApplyPayload;
  status: "ok" | "error";
  notes: string[];
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

function inferMount(text: string): HousingMountStyle | undefined {
  const hay = text.toLowerCase();
  if (/flange/.test(hay)) return "flange";
  if (/foot\s*mount|foot-mounted/.test(hay)) return "foot";
  if (/pillow|plummer|snl|saf/.test(hay)) return "pillow_block";
  return undefined;
}

function parseDirectionalLoads(text: string): { radialN?: number; axialN?: number; hints: string[] } {
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

function parseBoreMm(text: string, params: CopilotParams): number | undefined {
  const patterns = [
    new RegExp(
      `(?:bore|shaft\\s*diameter|ø)\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(mm|cm|in|m)?`,
      "i"
    ),
    new RegExp(`${NUMBER}\\s*(mm|cm|in|m)?\\s*(?:bore|shaft\\s*diameter|ø)`, "i"),
  ];
  for (const pattern of patterns) {
    const labelled = pattern.exec(text);
    if (!labelled) continue;
    const value = parseNumber(labelled[1]!);
    const unit = (labelled[2] ?? "mm").toLowerCase();
    if (unit === "m") return value * 1000;
    if (unit === "cm") return value * 10;
    if (unit === "in") return value * 25.4;
    return value;
  }
  if (params.diameter != null) return params.diameter * 1000;
  return undefined;
}

export function runHousingCopilotSession(text: string): HousingCopilotSession {
  const trimmed = text.trim();
  const { params, tokens } = parseBrief(trimmed);
  const directional = parseDirectionalLoads(trimmed);
  const hints = [...directional.hints];

  const radialN = directional.radialN ?? params.force ?? undefined;
  const axialN = directional.axialN ?? 0;
  if (radialN != null && directional.radialN == null && params.force != null) {
    hints.push(`Radial load from force ${params.force} N`);
  }

  const boreMm = parseBoreMm(trimmed, params);
  if (boreMm != null) hints.push(`Bore ${boreMm} mm`);

  const speed = params.rpm ?? 1500;
  if (params.rpm != null) hints.push(`Speed ${speed} rpm`);

  const mountStyle = inferMount(trimmed);
  if (mountStyle) hints.push(`Mount: ${mountStyle.replace(/_/g, " ")}`);

  const inputs: ModuleUserInputs = {
    diameter: (boreMm ?? 40) / 1000,
    maxForce: radialN ?? 5000,
    axialLoad: axialN,
    rpm: speed,
    yieldStress: 250e6,
  };

  const notes = [
    "Housing copilot sweeps bolt count and bolt-circle diameter for body SF and fastener margin.",
    "Mount style stays user-selected unless named in the brief.",
  ];

  let design: ModuleDesignModeResult | null = null;
  let status: HousingCopilotSession["status"] = "ok";
  try {
    design = runModuleDesignMode("housing", inputs) ?? null;
    if (!design?.best) {
      status = "error";
      notes.push("Could not size a bolt pattern — include radial load and bore.");
    }
  } catch (error) {
    status = "error";
    notes.push((error as Error).message);
  }

  const fields = design?.best?.fields ?? {};
  const apply: HousingCopilotApplyPayload = {
    boreMm,
    radialLoad: radialN,
    axialLoad: axialN,
    speed,
    mountStyle,
    boltCount: typeof fields.boltCount === "number" ? fields.boltCount : undefined,
    boltCircleDiameterMm:
      typeof fields.boltCircleDiameter === "number" ? fields.boltCircleDiameter : undefined,
    yieldStressMPa: 250,
  };

  return {
    briefText: trimmed,
    params,
    tokens,
    hints,
    design,
    apply,
    status,
    notes,
    canApplyLoads: radialN != null || boreMm != null || params.rpm != null,
  };
}

export const HOUSING_COPILOT_EXAMPLES = [
  "Pillow block housing, 40 mm bore, 5 kN radial and 0.5 kN axial at 1500 rpm.",
  "Flange housing for 8 kN radial, 50 mm bore, 1200 rpm.",
  "Size housing bolts for 12 kN radial at 60 mm bore.",
] as const;

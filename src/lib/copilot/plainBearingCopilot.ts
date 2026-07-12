/**
 * Plain-bearing-scoped Design Copilot — hydrodynamic film sizing only.
 */

import { parseBrief } from "./paramParser";
import type { CopilotParams, ParsedToken } from "./types";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { PlainBearingType } from "@/lib/machine/plain-bearings/types";

const NUMBER = "([-+]?\\d+(?:[.,]\\d+)?(?:e[-+]?\\d+)?)";

export type PlainBearingCopilotApplyPayload = {
  load?: number;
  speed?: number;
  diameterMm?: number;
  lengthMm?: number;
  clearanceUm?: number;
  viscosity?: number;
  bearingType?: PlainBearingType;
  padCount?: number;
};

export type PlainBearingCopilotSession = {
  briefText: string;
  params: CopilotParams;
  tokens: ParsedToken[];
  hints: string[];
  design: ModuleDesignModeResult | null;
  apply: PlainBearingCopilotApplyPayload;
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

function inferType(text: string): PlainBearingType | undefined {
  const hay = text.toLowerCase();
  if (/tilting\s*pad/.test(hay)) return "tilting_pad";
  if (/thrust\s*pad|kingsbury|michell/.test(hay)) return "thrust_pad";
  if (/journal|plain\s*bearing|sleeve/.test(hay)) return "journal";
  return undefined;
}

function parseDiameterMm(text: string, params: CopilotParams): number | undefined {
  const patterns = [
    new RegExp(
      `(?:journal|shaft|bore|diameter|ø|\\bd\\b)\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(mm|cm|in|m)?`,
      "i"
    ),
    new RegExp(
      `${NUMBER}\\s*(mm|cm|in|m)?\\s*(?:journal|shaft|bore|diameter|ø)`,
      "i"
    ),
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

export function runPlainBearingCopilotSession(text: string): PlainBearingCopilotSession {
  const trimmed = text.trim();
  const { params, tokens } = parseBrief(trimmed);
  const hints: string[] = [];

  const loadMatch = new RegExp(
    `(?:load|force|thrust)\\s*(?:of\\s*|[:=]\\s*)?${NUMBER}\\s*(kn|mn|kgf|lbf|lb|n)?`,
    "i"
  ).exec(trimmed);
  const loadN =
    loadMatch != null
      ? parseForceN(loadMatch[1]!, loadMatch[2] ?? "n")
      : (params.force ?? undefined);
  if (loadN != null) hints.push(`Load ${loadN} N`);

  const speed = params.rpm ?? undefined;
  if (speed != null) hints.push(`Speed ${speed} rpm`);

  const diameterMm = parseDiameterMm(trimmed, params);
  if (diameterMm != null) hints.push(`Diameter ${diameterMm} mm`);

  const bearingType = inferType(trimmed) ?? "journal";
  if (inferType(trimmed)) hints.push(`Type: ${bearingType.replace(/_/g, " ")}`);

  const inputs: ModuleUserInputs = {
    maxForce: loadN ?? 5000,
    speedDriver: speed ?? 1200,
    ...(diameterMm != null ? { diameter: diameterMm / 1000 } : {}),
  };

  const notes = [
    "Plain bearing copilot sizes journal diameter for hydrodynamic film screening (ISO 7902 context).",
    "Does not select OEM pad catalogs — apply geometry to the form and refine viscosity/clearance.",
  ];

  let design: ModuleDesignModeResult | null = null;
  let status: PlainBearingCopilotSession["status"] = "ok";
  try {
    design = runModuleDesignMode("plain-bearings", inputs) ?? null;
    if (!design?.best) {
      status = "error";
      notes.push("Could not size a journal from this brief — include load and speed.");
    }
  } catch (error) {
    status = "error";
    notes.push((error as Error).message);
  }

  const fields = design?.best?.fields ?? {};
  const apply: PlainBearingCopilotApplyPayload = {
    load: loadN,
    speed: speed ?? inputs.speedDriver,
    diameterMm:
      typeof fields.diameter === "number"
        ? fields.diameter
        : diameterMm,
    lengthMm: typeof fields.length === "number" ? fields.length : undefined,
    bearingType,
    viscosity: 0.03,
  };

  if (apply.diameterMm != null && apply.clearanceUm == null) {
    apply.clearanceUm = apply.diameterMm * 1.0; // ~0.1% diametral → µm ≈ mm * 1 for 0.001*D in mm→µm
    // D=50 mm → clearance 50 µm = 0.001*D. So clearanceUm = diameterMm.
  }

  return {
    briefText: trimmed,
    params,
    tokens,
    hints,
    design,
    apply,
    status,
    notes,
    canApplyLoads: loadN != null || speed != null || diameterMm != null,
  };
}

export const PLAIN_BEARING_COPILOT_EXAMPLES = [
  "Journal bearing, 5 kN radial at 1200 rpm, 50 mm shaft.",
  "Size plain journal for 8 kN at 900 rpm.",
  "Thrust pad, 20 kN axial at 1800 rpm, 80 mm outer diameter.",
  "Tilting pad thrust for 15 kN at 3600 rpm.",
] as const;

import { allModules } from "@/data/modules";
import {
  beamApplicationPresets,
  type BeamApplicationId,
} from "@/lib/structural/beams/applicationPresets";
import type { DesignCodeId } from "@/lib/standards/types";
import {
  advancedSystemsApplicationPresets,
  dynamicsApplicationPresets,
  fastenerApplicationPresets,
  machineApplicationPresets,
  manufacturingApplicationPresets,
  materialsApplicationPresets,
  powerTransmissionApplicationPresets,
  pressureApplicationPresets,
  springApplicationPresets,
  structuralApplicationPresets,
  toolsApplicationPresets,
} from "./categoryPresets";
import {
  bearingHousingApplicationPresets,
  bearingsCategoryApplicationPresets,
  plainBearingApplicationPresets,
  rollingBearingApplicationPresets,
} from "./bearingPresets";
import type { ModuleApplicationPreset } from "./types";
import { ALL_DESIGN_CODES } from "./types";

/** Modules with their own dedicated application UI — layout selector is hidden. */
export const MODULES_WITH_INLINE_APPLICATION = new Set<string>(["v-belts"]);

/** Reference / converter modules without application context. */
export const MODULES_WITHOUT_APPLICATION_PRESET = new Set<string>([
  "unit-converter",
  "material-db",
  "sections",
  "rolled-sections",
  "profiles",
]);

const BEAM_PRESET_DESIGN_CODES: Record<BeamApplicationId, DesignCodeId[]> = {
  general_mechanics: ALL_DESIGN_CODES,
  machine_frame: ["INDICATIVE", "EU", "ISO"],
  lifting_beam: ["US", "EU", "ISO"],
  crane_hoist_support: ["US", "EU", "ISO"],
  transformer_support: ["US", "EU", "ISO"],
  wind_turbine_support: ["EU", "ISO"],
  aerospace_member: ["US", "ISO"],
  vacuum_cryogenic_support: ["US", "EU", "ISO"],
  magnetic_field_support: ["US", "EU", "ISO"],
};

function beamPresetToModule(p: (typeof beamApplicationPresets)[number]): ModuleApplicationPreset {
  return {
    id: p.id,
    label: p.label,
    description: p.description,
    designCodes: BEAM_PRESET_DESIGN_CODES[p.id] ?? ALL_DESIGN_CODES,
    standards: p.standards,
    fatigueSensitive: p.fatigueSensitive,
    calculationNotes: p.calculationNotes,
    limitations: p.limitations,
    knobs: {
      loadFactor: p.loadFactor,
      allowableStressRatio: p.allowableStressRatio,
      deflectionLimitRatio: p.deflectionLimitRatio,
    },
  };
}

const beamPresets = beamApplicationPresets.map(beamPresetToModule);

const CATEGORY_PRESETS: Record<string, ModuleApplicationPreset[]> = {
  structural: structuralApplicationPresets,
  "power-transmission": powerTransmissionApplicationPresets,
  machine: machineApplicationPresets,
  bearings: bearingsCategoryApplicationPresets,
  springs: springApplicationPresets,
  fasteners: fastenerApplicationPresets,
  materials: materialsApplicationPresets,
  pressure: pressureApplicationPresets,
  dynamics: dynamicsApplicationPresets,
  manufacturing: manufacturingApplicationPresets,
  "advanced-systems": advancedSystemsApplicationPresets,
  tools: toolsApplicationPresets,
};

const MODULE_PRESET_OVERRIDES: Partial<Record<string, ModuleApplicationPreset[]>> = {
  beams: beamPresets,
  bearings: rollingBearingApplicationPresets,
  "plain-bearings": plainBearingApplicationPresets,
  housing: bearingHousingApplicationPresets,
};

const moduleCategoryById = new Map(allModules.map((m) => [m.id, m.category]));

export function moduleSupportsApplicationPreset(moduleId: string): boolean {
  if (MODULES_WITHOUT_APPLICATION_PRESET.has(moduleId)) return false;
  if (MODULES_WITH_INLINE_APPLICATION.has(moduleId)) return false;
  return Boolean(moduleCategoryById.get(moduleId));
}

export function getPresetsForModule(moduleId: string): ModuleApplicationPreset[] {
  if (MODULE_PRESET_OVERRIDES[moduleId]) {
    return MODULE_PRESET_OVERRIDES[moduleId]!;
  }
  const category = moduleCategoryById.get(moduleId);
  if (!category) return toolsApplicationPresets;
  return CATEGORY_PRESETS[category] ?? toolsApplicationPresets;
}

export function getModuleApplicationPreset(
  moduleId: string,
  presetId: string
): ModuleApplicationPreset {
  const presets = getPresetsForModule(moduleId);
  return presets.find((p) => p.id === presetId) ?? presets[0]!;
}

export function getDefaultPresetId(moduleId: string, designCode: DesignCodeId): string {
  const presets = getPresetsForModule(moduleId);
  const matched = presets.find((p) => p.designCodes.includes(designCode));
  return matched?.id ?? presets[0]!.id;
}

export type GroupedApplicationPresets = {
  recommended: ModuleApplicationPreset[];
  other: ModuleApplicationPreset[];
};

export function groupPresetsByDesignCode(
  presets: ModuleApplicationPreset[],
  designCode: DesignCodeId
): GroupedApplicationPresets {
  const recommended = presets.filter((p) => p.designCodes.includes(designCode));
  const other = presets.filter((p) => !p.designCodes.includes(designCode));
  return { recommended, other };
}

export function formatPresetKnobs(preset: ModuleApplicationPreset): string[] {
  const lines: string[] = [];
  const { knobs } = preset;
  if (knobs.loadFactor != null && knobs.loadFactor !== 1) {
    lines.push(`Load factor ${knobs.loadFactor.toFixed(2)}`);
  }
  if (knobs.allowableStressRatio != null) {
    lines.push(`Allowable stress ${(knobs.allowableStressRatio * 100).toFixed(0)}% of yield`);
  }
  if (knobs.deflectionLimitRatio != null) {
    lines.push(`Deflection L/${knobs.deflectionLimitRatio}`);
  }
  if (knobs.targetSafetyFactor != null) {
    lines.push(`Target SF ${knobs.targetSafetyFactor.toFixed(2)}`);
  }
  if (knobs.serviceFactor != null) {
    lines.push(`Service factor ${knobs.serviceFactor.toFixed(2)}`);
  }
  return lines;
}

/** Beam module still uses BeamApplicationId in solvers — map preset id safely. */
export function asBeamApplicationId(presetId: string): BeamApplicationId {
  const valid = beamApplicationPresets.some((p) => p.id === presetId);
  return valid ? (presetId as BeamApplicationId) : "general_mechanics";
}

export { beamPresets };

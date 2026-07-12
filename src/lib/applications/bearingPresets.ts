/**
 * Rolling-bearing application presets define calculation standards / screening
 * knobs only. Bearing family and catalog designation stay user-selected.
 */

import type { ModuleApplicationPreset } from "./types";
import { ALL_DESIGN_CODES } from "./types";
import type { CatalogBearingType } from "@/data/catalogs/bearingCatalog";
import type { BearingReliability, LubricationClass } from "@/lib/machine/bearings/types";

/** Calculation defaults applied when a rolling-bearing preset is selected. */
export type BearingPresetDefaults = {
  /** ISO 281 reliability for a₁. */
  reliability?: BearingReliability;
  /** Legacy lubrication class when full VG inputs unused. */
  lubricationClass?: LubricationClass | "";
  /** Suggested shock factor Ks (user may override). */
  shockFactor?: number;
  /** Target static safety s₀ for screening. */
  targetStaticSafetyFactor?: number;
  /**
   * When true, prefer oil + contamination path so aSKF / κ / ηc are active
   * (does not change bearing type).
   */
  preferModifiedLife?: boolean;
};

const K = {
  iso281: { loadFactor: 1, serviceFactor: 1.1, targetSafetyFactor: 1.5 } as const,
  skfModified: { loadFactor: 1, serviceFactor: 1.15, targetSafetyFactor: 1.5 } as const,
  highReliability: { loadFactor: 1, serviceFactor: 1.2, targetSafetyFactor: 1.6 } as const,
  heavyDuty: { loadFactor: 1.35, serviceFactor: 1.4, targetSafetyFactor: 1.8 } as const,
  highSpeed: { loadFactor: 1, serviceFactor: 1.05, targetSafetyFactor: 1.4 } as const,
  staticEmphasis: { loadFactor: 1.2, serviceFactor: 1.3, targetSafetyFactor: 2.0 } as const,
};

/** Rolling-element bearing selection (`bearings` module) — standards / method only. */
export const rollingBearingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "iso281_general",
    label: "ISO 281 / ISO 76 baseline",
    description:
      "Basic rating life L₁₀ and static safety s₀ per ISO 281 / ISO 76. Use any bearing family.",
    designCodes: ["ISO", "EU", "INDICATIVE"],
    standards: ["ISO 281", "ISO 76"],
    calculationNotes: [
      "L₁₀ = a₁ · (C/P)^p with p = 3 (ball) or 10/3 (roller).",
      "Static check S₀ = C₀/P₀. Bearing type is chosen independently.",
    ],
    knobs: K.iso281,
  },
  {
    id: "skf_modified_life",
    label: "SKF / ISO 281 modified life",
    description:
      "SKF rating life Lnm with a₁, aSKF (κ, ηc, Pu/P) and lubrication correction. Any bearing type.",
    designCodes: ["ISO", "EU", "INDICATIVE"],
    standards: ["ISO 281:2007", "SKF Rolling Bearings Catalogue"],
    calculationNotes: [
      "Lnm = a₁ · aSKF · (C/P)^p.",
      "Requires lubricant VG, temperature, and contamination class for full aSKF.",
    ],
    knobs: K.skfModified,
  },
  {
    id: "iso281_high_reliability",
    label: "High reliability (a₁)",
    description:
      "ISO 281 life at elevated reliability (default 95–99% a₁). Pair with any catalog type.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281 Table 12 (a₁)"],
    calculationNotes: ["Raises reliability factor a₁ above the default 90% (a₁ = 1)."],
    knobs: K.highReliability,
  },
  {
    id: "iso76_static_emphasis",
    label: "Static / shock emphasis (ISO 76)",
    description:
      "Elevated static safety and shock factor for uncertain loads, vibration, or infrequent rotation.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 76", "ISO 281"],
    calculationNotes: [
      "Prefer S₀ screening when loads are uncertain or lubrication is not full-film.",
      "Applies higher target SF and suggested shock factor Ks — type remains free.",
    ],
    knobs: K.staticEmphasis,
  },
  {
    id: "heavy_duty_service",
    label: "Heavy duty / elevated SF",
    description:
      "Higher service and safety factors for continuous industrial duty. Any bearing family.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "ISO 76"],
    knobs: K.heavyDuty,
  },
  {
    id: "high_speed_screening",
    label: "High-speed screening",
    description:
      "Emphasizes limiting / reference speed margins and oil-friendly life factors. Type is free.",
    designCodes: ["ISO", "EU", "US", "INDICATIVE"],
    standards: ["ISO 281", "ISO 15312 context"],
    calculationNotes: ["Check n_lim/n and n_ref/n; prefer open or high-speed seals in catalog."],
    knobs: K.highSpeed,
  },
  {
    id: "indicative_screening",
    label: "Indicative / educational",
    description:
      "Light screening factors for teaching and early concept sizing — not for final design.",
    designCodes: ["INDICATIVE"],
    standards: ["ISO 281 (indicative)", "ISO 76 (indicative)"],
    limitations: ["Not a substitute for OEM catalog validation or project design codes."],
    knobs: { loadFactor: 1, serviceFactor: 1, targetSafetyFactor: 1.3 },
  },
];

/** Plain / hydrodynamic bearings — calculation method / duty knobs only. */
export const plainBearingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "hydrodynamic_iso_screening",
    label: "Hydrodynamic screening (general)",
    description:
      "Sommerfeld / Petroff-style journal screening. Select journal, thrust pad, or tilting pad independently.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["Sommerfeld number", "Shigley hydrodynamic bearings"],
    calculationNotes: ["Sets safety / service factors only — bearing type is free."],
    knobs: { loadFactor: 1, targetSafetyFactor: 2, serviceFactor: 1.2 },
  },
  {
    id: "api_turbo_journal",
    label: "Turbo / API journal context",
    description:
      "Elevated margins for turbomachinery journals. Does not lock pad count or diameter.",
    designCodes: ["US", "ISO"],
    standards: ["API 611 context", "API 617 bearing context"],
    knobs: { loadFactor: 1.1, targetSafetyFactor: 2.5, serviceFactor: 1.15 },
  },
  {
    id: "slow_heavy_journal",
    label: "Slow / heavy-load duty",
    description: "Low-speed heavy radial duty screening (mills, crushers). Type remains free.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["Hydrodynamic film theory", "Mining mill practice"],
    knobs: { loadFactor: 1.3, targetSafetyFactor: 2, serviceFactor: 1.35 },
  },
  {
    id: "thrust_pad_screening",
    label: "Thrust / axial film screening",
    description:
      "Higher SF for axial film supports (Michell / Kingsbury context). Choose thrust or tilting pad in the form.",
    designCodes: ["US", "ISO"],
    standards: ["Michell thrust bearing theory", "API 610 thrust context"],
    knobs: { loadFactor: 1.2, targetSafetyFactor: 2, serviceFactor: 1.25 },
  },
  {
    id: "tilting_pad_stability",
    label: "High-speed stability margins",
    description:
      "Conservative SF for high-speed rotor supports. Does not force tilting-pad geometry.",
    designCodes: ["US", "ISO"],
    standards: ["API 617", "ISO 7919 vibration context"],
    fatigueSensitive: true,
    knobs: { loadFactor: 1.05, targetSafetyFactor: 2.5, serviceFactor: 1.1 },
  },
  {
    id: "precision_hydrodynamic",
    label: "Precision / instrument film",
    description: "Tight film-control screening for test rigs and instrument spindles.",
    designCodes: ["INDICATIVE", "ISO"],
    standards: ["Precision bearing design handbooks"],
    knobs: { loadFactor: 1, serviceFactor: 1, targetSafetyFactor: 1.3 },
  },
];

/** Bearing housing — duty / SF context only (mount style stays user-selected). */
export const bearingHousingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "housing_general_iso",
    label: "General housing screening",
    description:
      "ISO / catalog housing bolt and body screening. Choose foot, flange, or split mount in the form.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF housing catalog", "ISO 3228 context"],
    calculationNotes: ["Does not select pillow-block vs flange geometry."],
    knobs: { loadFactor: 1, targetSafetyFactor: 2, serviceFactor: 1.2 },
  },
  {
    id: "housing_compact_envelope",
    label: "Compact envelope margins",
    description: "Slightly higher load factor when housing space is tight. Mount style is free.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF FNL / FY series context"],
    knobs: { loadFactor: 1.1, targetSafetyFactor: 2, serviceFactor: 1.15 },
  },
  {
    id: "housing_heavy_shock",
    label: "Heavy shock / contaminated duty",
    description: "Elevated SF for shock and dirty environments. Does not force split housing.",
    designCodes: ["US", "ISO"],
    standards: ["Split pillow block practice", "Mining OEM guides"],
    knobs: K.heavyDuty,
  },
  {
    id: "housing_precision_stiffness",
    label: "Precision / spindle stiffness",
    description: "Higher stiffness-oriented SF for precision spindle housings.",
    designCodes: ["ISO", "EU"],
    standards: ["Machine tool spindle housing practice"],
    knobs: { loadFactor: 1, serviceFactor: 1, targetSafetyFactor: 1.3 },
  },
  {
    id: "housing_maintainability",
    label: "Maintainability screening",
    description: "Service-oriented SF for process-plant housings. Mount geometry stays user-selected.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF SNL split plummer", "Process plant maintenance guides"],
    knobs: { loadFactor: 1.15, targetSafetyFactor: 1.8, serviceFactor: 1.2 },
  },
];

/** Category-level union for bearings suite (shown when no module override). */
export const bearingsCategoryApplicationPresets: ModuleApplicationPreset[] = [
  ...rollingBearingApplicationPresets.slice(0, 3),
  plainBearingApplicationPresets[0]!,
  bearingHousingApplicationPresets[0]!,
];

/** Calculation defaults only — never forces bearing type or designation. */
export const BEARING_PRESET_DEFAULTS: Record<string, BearingPresetDefaults> = {
  iso281_general: {
    reliability: 90,
    lubricationClass: "",
    shockFactor: 1,
    targetStaticSafetyFactor: 1,
    preferModifiedLife: false,
  },
  skf_modified_life: {
    reliability: 90,
    lubricationClass: "good",
    shockFactor: 1,
    targetStaticSafetyFactor: 1,
    preferModifiedLife: true,
  },
  iso281_high_reliability: {
    reliability: 95,
    shockFactor: 1,
    targetStaticSafetyFactor: 1.2,
    preferModifiedLife: true,
  },
  iso76_static_emphasis: {
    reliability: 90,
    shockFactor: 1.5,
    targetStaticSafetyFactor: 2,
    preferModifiedLife: false,
  },
  heavy_duty_service: {
    reliability: 90,
    shockFactor: 1.35,
    targetStaticSafetyFactor: 1.5,
    preferModifiedLife: true,
  },
  high_speed_screening: {
    reliability: 95,
    lubricationClass: "good",
    shockFactor: 1,
    targetStaticSafetyFactor: 1,
    preferModifiedLife: true,
  },
  indicative_screening: {
    reliability: 90,
    shockFactor: 1,
    targetStaticSafetyFactor: 1,
    preferModifiedLife: false,
  },
};

/** Plain bearing presets: knobs only (no geometry). */
export const PLAIN_BEARING_PRESET_DEFAULTS: Record<
  string,
  { targetSafetyFactor?: number; serviceFactor?: number; loadFactor?: number }
> = {
  hydrodynamic_iso_screening: { targetSafetyFactor: 2, serviceFactor: 1.2, loadFactor: 1 },
  api_turbo_journal: { targetSafetyFactor: 2.5, serviceFactor: 1.15, loadFactor: 1.1 },
  slow_heavy_journal: { targetSafetyFactor: 2, serviceFactor: 1.35, loadFactor: 1.3 },
  thrust_pad_screening: { targetSafetyFactor: 2, serviceFactor: 1.25, loadFactor: 1.2 },
  tilting_pad_stability: { targetSafetyFactor: 2.5, serviceFactor: 1.1, loadFactor: 1.05 },
  precision_hydrodynamic: { targetSafetyFactor: 1.3, serviceFactor: 1, loadFactor: 1 },
};

export function getBearingPresetDefaults(presetId: string): BearingPresetDefaults | undefined {
  return BEARING_PRESET_DEFAULTS[presetId];
}

export function getPlainBearingPresetDefaults(
  presetId: string
): { targetSafetyFactor?: number; serviceFactor?: number; loadFactor?: number } | undefined {
  return PLAIN_BEARING_PRESET_DEFAULTS[presetId];
}

/** Housing presets: knobs only (never force mount style). */
export const HOUSING_PRESET_DEFAULTS: Record<
  string,
  { targetSafetyFactor?: number; serviceFactor?: number; loadFactor?: number }
> = {
  housing_general_iso: { targetSafetyFactor: 2, serviceFactor: 1.2, loadFactor: 1 },
  housing_compact_envelope: { targetSafetyFactor: 2, serviceFactor: 1.15, loadFactor: 1.1 },
  housing_heavy_shock: { targetSafetyFactor: 1.8, serviceFactor: 1.4, loadFactor: 1.35 },
  housing_precision_stiffness: { targetSafetyFactor: 1.3, serviceFactor: 1, loadFactor: 1 },
  housing_maintainability: { targetSafetyFactor: 1.8, serviceFactor: 1.2, loadFactor: 1.15 },
};

export function getHousingPresetDefaults(
  presetId: string
): { targetSafetyFactor?: number; serviceFactor?: number; loadFactor?: number } | undefined {
  return HOUSING_PRESET_DEFAULTS[presetId];
}

/**
 * @deprecated Presets no longer map to bearing families. Kept for callers; always
 * returns the ISO 281 baseline so type changes do not rewrite the calculation method.
 */
export const FAMILY_RECOMMENDED_PRESET: Partial<Record<CatalogBearingType, string>> = {
  deep_groove: "iso281_general",
  angular_contact: "iso281_general",
  cylindrical_roller: "iso281_general",
  cylindrical_nj: "iso281_general",
  cylindrical_nup: "iso281_general",
  tapered_roller: "iso281_general",
  spherical_roller: "iso281_general",
  needle_roller: "iso281_general",
  self_aligning_ball: "iso281_general",
  thrust_ball: "iso281_general",
};

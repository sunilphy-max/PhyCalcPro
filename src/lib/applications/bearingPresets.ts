/**
 * Bearing suite application presets — per module and per family.
 * Maps to catalog profiles, default types, and screening knobs (ISO 281 / ISO 76 context).
 */

import type { ModuleApplicationPreset } from "./types";
import { ALL_DESIGN_CODES } from "./types";
import type {
  BearingApplicationProfile,
  BearingManufacturer,
  CatalogBearingType,
} from "@/data/catalogs/bearingCatalog";
import type { BearingReliability, LubricationClass } from "@/lib/machine/bearings/types";

export type BearingPresetDefaults = {
  catalogProfile: BearingApplicationProfile | "all";
  bearingType?: CatalogBearingType;
  manufacturer?: BearingManufacturer;
  reliability?: BearingReliability;
  lubricationClass?: LubricationClass | "";
};

const K = {
  radial: { loadFactor: 1, serviceFactor: 1.1, targetSafetyFactor: 1.5 } as const,
  combined: { loadFactor: 1.15, serviceFactor: 1.25, targetSafetyFactor: 1.5 } as const,
  shock: { loadFactor: 1.35, serviceFactor: 1.4, targetSafetyFactor: 1.8 } as const,
  highSpeed: { loadFactor: 1, serviceFactor: 1.05, targetSafetyFactor: 1.4 } as const,
  thrust: { loadFactor: 1.2, serviceFactor: 1.3, targetSafetyFactor: 1.6 } as const,
  precision: { loadFactor: 1, serviceFactor: 1, targetSafetyFactor: 1.3 } as const,
};

/** Rolling-element bearing selection (`bearings` module). */
export const rollingBearingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "iso281_general",
    label: "General ISO 281 screening",
    description: "Baseline rolling bearing life per ISO 281 / ISO 76 with representative catalog.",
    designCodes: ["ISO", "EU", "INDICATIVE"],
    standards: ["ISO 281", "ISO 76", "SKF Rolling Bearings Catalogue"],
    knobs: K.radial,
  },
  {
    id: "deep_groove_motor_fan",
    label: "Electric motor / fan (deep groove)",
    description: "Light/medium series ball bearings for horizontal motors, fans, and pumps.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "IEC 60034 context", "SKF 62xx/63xx"],
    knobs: K.radial,
  },
  {
    id: "deep_groove_sealed",
    label: "Contaminated environment (sealed)",
    description: "Sealed deep groove for dusty or wash-down duty — derated speed vs open.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "IP sealing context"],
    knobs: { ...K.radial, serviceFactor: 1.2 },
  },
  {
    id: "angular_spindle",
    label: "Machine tool spindle (angular contact)",
    description: "High-speed combined load — 72xx/73xx angular contact, oil lubrication screening.",
    designCodes: ["ISO", "EU", "INDICATIVE"],
    standards: ["ISO 281", "ISO 15312 context", "ABEC/P5 precision context"],
    knobs: K.highSpeed,
  },
  {
    id: "angular_locating",
    label: "Locating bearing (angular / duplex)",
    description: "Fixed end of shaft — back-to-back angular contact for axial location.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "Shigley Ch. 11 mounting"],
    knobs: K.combined,
  },
  {
    id: "tapered_gearbox",
    label: "Gearbox shaft (tapered roller)",
    description: "Combined radial and axial from helical/bevel gears — 302xx/303xx tapered.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "Timken / SKF tapered catalog"],
    knobs: K.combined,
  },
  {
    id: "tapered_wheel_end",
    label: "Wheel / heavy axle (tapered)",
    description: "Heavy radial and shock — medium tapered series with elevated static margin.",
    designCodes: ["US", "ISO"],
    standards: ["ISO 281", "SAE J2040 context"],
    knobs: K.shock,
  },
  {
    id: "spherical_mining",
    label: "Mining / crusher (spherical roller)",
    description: "Misalignment and shock — 222xx/223xx spherical roller.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "ISO 76", "CAT / mining practice"],
    knobs: K.shock,
  },
  {
    id: "spherical_paper",
    label: "Paper / process roll (spherical)",
    description: "Long rolls with alignment drift — spherical roller float/locate pairs.",
    designCodes: ["EU", "ISO"],
    standards: ["ISO 281", "Process roll mounting guides"],
    knobs: { ...K.shock, serviceFactor: 1.25 },
  },
  {
    id: "needle_compact",
    label: "Compact actuator (needle)",
    description: "Space-limited linear or rotary supports — drawn-cup needle bearings.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "HK / NA series"],
    knobs: { loadFactor: 1.1, serviceFactor: 1.15, targetSafetyFactor: 1.6 },
  },
  {
    id: "cylindrical_nu_float",
    label: "Floating end (NU cylindrical)",
    description: "Thermal expansion float — NU series non-locating cylindrical roller.",
    designCodes: ["ISO", "EU"],
    standards: ["ISO 281", "Shigley floating/locate pairs"],
    knobs: K.radial,
  },
  {
    id: "cylindrical_nj_locate",
    label: "Locating end (NJ cylindrical)",
    description: "Axial location with cylindrical roller — NJ series one-direction locate.",
    designCodes: ["ISO", "EU"],
    standards: ["ISO 281", "FAG NJ catalog"],
    knobs: K.combined,
  },
  {
    id: "cylindrical_nup_shaft",
    label: "Bidirectional locate (NUP)",
    description: "Shaft locate with axial loads both directions — NUP cylindrical roller.",
    designCodes: ["ISO", "EU"],
    standards: ["ISO 281", "SKF NUP catalog"],
    knobs: K.combined,
  },
  {
    id: "self_aligning_conveyor",
    label: "Conveyor / misalignment (self-aligning ball)",
    description: "Moderate shock with angular misalignment — 12xx/13xx self-aligning ball.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "Conveyor idler practice"],
    knobs: K.shock,
  },
  {
    id: "thrust_vertical",
    label: "Vertical shaft thrust (thrust ball)",
    description: "Pure axial load — 511xx/512xx thrust ball screening.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["ISO 281", "ISO 76 thrust"],
    knobs: K.thrust,
  },
  {
    id: "high_speed_precision",
    label: "High-speed precision (hybrid context)",
    description: "Spindles and turbomachinery — open angular/deep groove, oil reference speed.",
    designCodes: ["ISO", "US", "EU"],
    standards: ["ISO 281", "ISO 15312", "API 617 context"],
    fatigueSensitive: true,
    knobs: K.precision,
    limitations: ["Ceramic hybrid and super-precision grades not in catalog — screening only."],
  },
];

/** Plain / hydrodynamic bearings (`plain-bearings` module). */
export const plainBearingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "journal_general",
    label: "General journal bearing",
    description: "Hydrodynamic journal screening for industrial shafts.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["Sommerfeld number", "Shigley hydrodynamic bearings"],
    knobs: { loadFactor: 1, targetSafetyFactor: 2, serviceFactor: 1.2 },
  },
  {
    id: "journal_turbine",
    label: "Turbine / generator journal",
    description: "Large-diameter low-clearance journal for turbomachinery.",
    designCodes: ["US", "ISO"],
    standards: ["API 611 context", "TEMA / turbine bearing practice"],
    knobs: { loadFactor: 1.1, targetSafetyFactor: 2.5, serviceFactor: 1.15 },
  },
  {
    id: "journal_slow_heavy",
    label: "Slow heavy load journal",
    description: "Crushers, mills, and low-speed heavy radial load journals.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["Hydrodynamic film theory", "Mining mill practice"],
    knobs: { loadFactor: 1.3, targetSafetyFactor: 2, serviceFactor: 1.35 },
  },
  {
    id: "thrust_pad_vertical",
    label: "Vertical thrust pad",
    description: "Kingsbury-style thrust pad screening for vertical shafts.",
    designCodes: ["US", "ISO"],
    standards: ["Michell thrust bearing theory", "API 610 thrust context"],
    knobs: { loadFactor: 1.2, targetSafetyFactor: 2, serviceFactor: 1.25 },
  },
  {
    id: "tilting_pad_turbo",
    label: "Tilting pad (turbo)",
    description: "Multi-pad tilting journal for high-speed compressors and turbines.",
    designCodes: ["US", "ISO"],
    standards: ["API 617", "ISO 7919 vibration context"],
    fatigueSensitive: true,
    knobs: { loadFactor: 1.05, targetSafetyFactor: 2.5, serviceFactor: 1.1 },
  },
  {
    id: "hydrodynamic_precision",
    label: "Precision hydrodynamic",
    description: "Test rigs and instrument spindles with tight film control.",
    designCodes: ["INDICATIVE", "ISO"],
    standards: ["Precision bearing design handbooks"],
    knobs: K.precision,
  },
];

/** Bearing housing (`housing` module). */
export const bearingHousingApplicationPresets: ModuleApplicationPreset[] = [
  {
    id: "foot_mount_general",
    label: "Foot-mounted pillow block",
    description: "Standard SN/SAF-style foot mount bolt and body screening.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF housing catalog", "ISO 3228 context"],
    knobs: { loadFactor: 1, targetSafetyFactor: 2, serviceFactor: 1.2 },
  },
  {
    id: "flange_compact",
    label: "Flange housing (compact)",
    description: "Flange mount in tight envelopes — 4-bolt flange units.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF FNL / FY series context"],
    knobs: { loadFactor: 1.1, targetSafetyFactor: 2, serviceFactor: 1.15 },
  },
  {
    id: "housing_heavy_shock",
    label: "Heavy shock / mining housing",
    description: "Split plummer blocks for shock and contamination duty.",
    designCodes: ["US", "ISO"],
    standards: ["Split pillow block practice", "Mining OEM guides"],
    knobs: K.shock,
  },
  {
    id: "housing_spindle",
    label: "Precision spindle housing",
    description: "Rigid spindle housing with elevated stiffness and bolt margin.",
    designCodes: ["ISO", "EU"],
    standards: ["Machine tool spindle housing practice"],
    knobs: K.precision,
  },
  {
    id: "housing_split_maintenance",
    label: "Split housing (maintenance)",
    description: "Maintainable split housings for process industries.",
    designCodes: ALL_DESIGN_CODES,
    standards: ["SKF SNL split plummer", "Process plant maintenance guides"],
    knobs: { loadFactor: 1.15, targetSafetyFactor: 1.8, serviceFactor: 1.2 },
  },
];

/** Category-level union for bearings suite (shown when no module override). */
export const bearingsCategoryApplicationPresets: ModuleApplicationPreset[] = [
  ...rollingBearingApplicationPresets.slice(0, 4),
  plainBearingApplicationPresets[0]!,
  bearingHousingApplicationPresets[0]!,
];

export const BEARING_PRESET_DEFAULTS: Record<string, BearingPresetDefaults> = {
  iso281_general: { catalogProfile: "all", bearingType: "deep_groove", manufacturer: "SKF" },
  deep_groove_motor_fan: { catalogProfile: "general_radial", bearingType: "deep_groove", manufacturer: "SKF" },
  deep_groove_sealed: { catalogProfile: "general_radial", bearingType: "deep_groove", manufacturer: "SKF" },
  angular_spindle: {
    catalogProfile: "high_speed",
    bearingType: "angular_contact",
    manufacturer: "SKF",
    lubricationClass: "good",
    reliability: 95,
  },
  angular_locating: { catalogProfile: "locating_bearing", bearingType: "angular_contact", manufacturer: "SKF" },
  tapered_gearbox: { catalogProfile: "combined_loads", bearingType: "tapered_roller", manufacturer: "TIMKEN" },
  tapered_wheel_end: { catalogProfile: "heavy_shock", bearingType: "tapered_roller", manufacturer: "TIMKEN" },
  spherical_mining: { catalogProfile: "heavy_shock", bearingType: "spherical_roller", manufacturer: "SKF" },
  spherical_paper: { catalogProfile: "heavy_shock", bearingType: "spherical_roller", manufacturer: "FAG" },
  needle_compact: { catalogProfile: "space_limited", bearingType: "needle_roller", manufacturer: "NSK" },
  cylindrical_nu_float: { catalogProfile: "floating_bearing", bearingType: "cylindrical_roller", manufacturer: "SKF" },
  cylindrical_nj_locate: { catalogProfile: "locating_bearing", bearingType: "cylindrical_nj", manufacturer: "FAG" },
  cylindrical_nup_shaft: { catalogProfile: "combined_loads", bearingType: "cylindrical_nup", manufacturer: "SKF" },
  self_aligning_conveyor: { catalogProfile: "heavy_shock", bearingType: "self_aligning_ball", manufacturer: "SKF" },
  thrust_vertical: { catalogProfile: "pure_thrust", bearingType: "thrust_ball", manufacturer: "SKF" },
  high_speed_precision: {
    catalogProfile: "high_speed",
    bearingType: "angular_contact",
    manufacturer: "NSK",
    lubricationClass: "good",
    reliability: 95,
  },
};

export const PLAIN_BEARING_PRESET_DEFAULTS: Record<
  string,
  { bearingType?: "journal" | "thrust_pad" | "tilting_pad" }
> = {
  journal_general: { bearingType: "journal" },
  journal_turbine: { bearingType: "journal" },
  journal_slow_heavy: { bearingType: "journal" },
  thrust_pad_vertical: { bearingType: "thrust_pad" },
  tilting_pad_turbo: { bearingType: "tilting_pad" },
  hydrodynamic_precision: { bearingType: "journal" },
};

export function getBearingPresetDefaults(presetId: string): BearingPresetDefaults | undefined {
  return BEARING_PRESET_DEFAULTS[presetId];
}

export function getPlainBearingPresetDefaults(
  presetId: string
): { bearingType?: "journal" | "thrust_pad" | "tilting_pad" } | undefined {
  return PLAIN_BEARING_PRESET_DEFAULTS[presetId];
}

/** Recommended application preset id per rolling bearing family (catalog type). */
export const FAMILY_RECOMMENDED_PRESET: Partial<Record<CatalogBearingType, string>> = {
  deep_groove: "deep_groove_motor_fan",
  angular_contact: "angular_spindle",
  cylindrical_roller: "cylindrical_nu_float",
  cylindrical_nj: "cylindrical_nj_locate",
  cylindrical_nup: "cylindrical_nup_shaft",
  tapered_roller: "tapered_gearbox",
  spherical_roller: "spherical_mining",
  needle_roller: "needle_compact",
  self_aligning_ball: "self_aligning_conveyor",
  thrust_ball: "thrust_vertical",
};

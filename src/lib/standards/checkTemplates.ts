import type { DesignCodeId, ModuleCheckDefinition, StandardReference } from "./types";

function ref(
  body: string,
  document: string,
  clause?: string,
  edition?: string
): StandardReference {
  return { body, document, clause, edition };
}

export function checkDef(
  id: string,
  label: string,
  metricKind: ModuleCheckDefinition["metricKind"],
  refs: Partial<Record<DesignCodeId, StandardReference>>,
  implementation: Partial<Record<DesignCodeId, "implemented" | "planned" | "not_applicable">> = {}
): ModuleCheckDefinition {
  return { id, label, metricKind, standardRef: refs, implementation };
}

export const gearChecks: ModuleCheckDefinition[] = [
  checkDef(
    "bending_strength",
    "Bending strength safety factor",
    "safety_factor",
    {
      INDICATIVE: ref("Textbook", "Lewis bending stress", "σ = Ft / (b·m·Y)"),
      US: ref("AGMA", "2101-D04", "Ch. 5 bending strength"),
      EU: ref("DIN", "3990", "Bending stress"),
      ISO: ref("ISO", "6336-3", "Bending strength rating"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "contact_strength",
    "Contact (pitting) strength safety factor",
    "safety_factor",
    {
      INDICATIVE: ref("Textbook", "Hertzian contact approximation"),
      US: ref("AGMA", "2101-D04", "Ch. 5 surface durability"),
      EU: ref("DIN", "3990", "Hertzian pressure"),
      ISO: ref("ISO", "6336-2", "Surface durability"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "scuffing",
    "Scuffing safety factor",
    "safety_factor",
    {
      US: ref("AGMA", "2101-D04", "Scuffing criteria"),
      EU: ref("DIN", "3990", "Scuffing"),
      ISO: ref("ISO", "6336-20", "Scuffing"),
    },
    { US: "implemented", EU: "implemented", ISO: "implemented", INDICATIVE: "implemented" }
  ),
  checkDef(
    "bending_fatigue",
    "Bending fatigue safety factor",
    "safety_factor",
    {
      US: ref("AGMA", "2101-D04", "Bending fatigue"),
      EU: ref("DIN", "3990", "Fatigue"),
      ISO: ref("ISO", "6336-3", "Bending fatigue"),
    },
    { US: "implemented", EU: "implemented", ISO: "implemented", INDICATIVE: "implemented" }
  ),
  checkDef(
    "contact_fatigue",
    "Contact fatigue safety factor",
    "safety_factor",
    {
      US: ref("AGMA", "2101-D04", "Pitting resistance"),
      EU: ref("DIN", "3990", "Pitting"),
      ISO: ref("ISO", "6336-2", "Pitting resistance"),
    },
    { US: "implemented", EU: "implemented", ISO: "implemented", INDICATIVE: "implemented" }
  ),
  checkDef(
    "micropitting",
    "Micropitting safety factor",
    "safety_factor",
    {
      ISO: ref("ISO", "6336-22", "Micropitting"),
      EU: ref("DIN", "3990", "Micropitting"),
    },
    { ISO: "implemented", EU: "implemented", INDICATIVE: "implemented", US: "planned" }
  ),
];

export const beamChecks: ModuleCheckDefinition[] = [
  checkDef(
    "bending_stress",
    "Bending stress utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Euler-Bernoulli beam theory"),
      US: ref("ASME", "BTH-1", "Lifting beam stress screening"),
      EU: ref("EN", "13001", "Crane and industrial equipment structures"),
      ISO: ref("ISO", "8686", "Crane design principles and loads"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "shear_stress",
    "Shear utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Beam shear"),
      US: ref("ASME", "BTH-1", "Lifting beam shear screening"),
      EU: ref("EN", "13001", "Shear screening for crane structures"),
      ISO: ref("ISO", "8686", "Industrial lifting load effects"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "deflection_serviceability",
    "Deflection / serviceability limit",
    "deflection",
    {
      INDICATIVE: ref("Mechanics", "Elastic deflection"),
      US: ref("ASME", "BTH-1", "Serviceability by application"),
      EU: ref("EN", "13001", "Serviceability by crane class"),
      ISO: ref("ISO", "8686", "Serviceability by application"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "lateral_torsional_buckling",
    "Lateral-torsional buckling",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Elastic instability screening"),
      US: ref("ASME", "BTH-1", "Member stability by application"),
      EU: ref("EN", "13001", "Member stability by crane class"),
      ISO: ref("ISO", "8686", "Stability by application"),
    },
    { US: "implemented", EU: "implemented", ISO: "implemented", INDICATIVE: "implemented" }
  ),
];

export const compressionSpringChecks: ModuleCheckDefinition[] = [
  checkDef(
    "shear_stress",
    "Shear stress utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Spring shear", "τ = 8·F·D·Ks/(π·d³)"),
      US: ref("ASME", "B18.2.1", "Spring wire"),
      EU: ref("EN", "13906-1", "Compression springs"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented" }
  ),
  checkDef(
    "solid_height",
    "Solid height margin",
    "safety_factor",
    { INDICATIVE: ref("Mechanics", "Solid height") },
    { INDICATIVE: "implemented" }
  ),
];

export const vBeltChecks: ModuleCheckDefinition[] = [
  checkDef(
    "power_capacity",
    "Power capacity utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Flat/V-belt power", "P = T·ω"),
      US: ref("Gates", "Heavy-Duty V-Belt Drive Design Manual"),
    },
    { INDICATIVE: "implemented", US: "implemented" }
  ),
  checkDef(
    "wrap_angle",
    "Wrap angle on small pulley",
    "other",
    { INDICATIVE: ref("Mechanics", "Belt wrap", "≥ 120° recommended") },
    { INDICATIVE: "implemented" }
  ),
];

export const timingBeltChecks: ModuleCheckDefinition[] = [
  checkDef(
    "power_capacity",
    "Power capacity utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Timing belt power rating"),
      ISO: ref("ISO", "5294", "Synchronous belt drives"),
    },
    { INDICATIVE: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "shaft_load",
    "Shaft radial load estimate",
    "other",
    { INDICATIVE: ref("Mechanics", "Belt tension resultant") },
    { INDICATIVE: "implemented" }
  ),
];

export const keysSplinesChecks: ModuleCheckDefinition[] = [
  checkDef(
    "shear",
    "Key shear safety factor",
    "safety_factor",
    {
      INDICATIVE: ref("Mechanics", "Key shear", "τ = 2T/(d·b·L)"),
      ISO: ref("ISO", "3912", "Keys"),
      US: ref("Machinery's Handbook", "Keys and splines"),
    },
    { INDICATIVE: "implemented", ISO: "implemented", US: "implemented" }
  ),
  checkDef(
    "bearing",
    "Key bearing safety factor",
    "safety_factor",
    {
      INDICATIVE: ref("Mechanics", "Key bearing"),
      ISO: ref("ISO", "3912", "Keys"),
    },
    { INDICATIVE: "implemented", ISO: "implemented" }
  ),
];

export const genericIndicativeCheck = (
  id: string,
  label: string,
  metricKind: ModuleCheckDefinition["metricKind"] = "other"
): ModuleCheckDefinition =>
  checkDef(id, label, metricKind, { INDICATIVE: ref("PhyCalcPro", "Indicative model") }, {
    INDICATIVE: "implemented",
  });

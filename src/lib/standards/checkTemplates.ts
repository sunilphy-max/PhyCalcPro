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
    { US: "planned", EU: "planned", ISO: "planned" }
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
    { US: "planned", EU: "planned", ISO: "planned" }
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
    { US: "planned", EU: "planned", ISO: "planned" }
  ),
  checkDef(
    "micropitting",
    "Micropitting safety factor",
    "safety_factor",
    {
      ISO: ref("ISO", "6336-22", "Micropitting"),
      EU: ref("DIN", "3990", "Micropitting"),
    },
    { ISO: "planned", EU: "planned" }
  ),
];

export const beamChecks: ModuleCheckDefinition[] = [
  checkDef(
    "bending_stress",
    "Bending stress utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Euler-Bernoulli beam theory"),
      US: ref("AISC", "360-22", "Ch. F flexure"),
      EU: ref("EN", "1993-1-1", "Cl. 6.2.5"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "shear_stress",
    "Shear utilization",
    "utilization",
    {
      INDICATIVE: ref("Mechanics", "Beam shear"),
      US: ref("AISC", "360-22", "Ch. G shear"),
      EU: ref("EN", "1993-1-1", "Cl. 6.2.6"),
    },
    { INDICATIVE: "planned", US: "planned", EU: "planned" }
  ),
  checkDef(
    "deflection_serviceability",
    "Deflection / serviceability limit",
    "deflection",
    {
      INDICATIVE: ref("Mechanics", "Elastic deflection"),
      US: ref("AISC", "360-22", "Serviceability Appendix"),
      EU: ref("EN", "1993-1-1", "Serviceability limits"),
    },
    { INDICATIVE: "implemented", US: "implemented", EU: "implemented", ISO: "implemented" }
  ),
  checkDef(
    "lateral_torsional_buckling",
    "Lateral-torsional buckling",
    "utilization",
    {
      US: ref("AISC", "360-22", "Ch. F LTB"),
      EU: ref("EN", "1993-1-1", "Cl. 6.3.3"),
    },
    { US: "planned", EU: "planned" }
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

/**
 * Screening bushing / pad material table for plain bearings.
 */

export type PlainBearingMaterial = {
  id: string;
  label: string;
  family: "babbitt" | "bronze" | "steel" | "ptfe" | "plastic" | "graphite";
  /** Max specific pressure (Pa) continuous. */
  maxSpecificLoadPa: number;
  /** Max PV (Pa·m/s) screening. */
  maxPvPaMs: number;
  /** Max continuous temperature °C. */
  maxTempC: number;
  /** Recommended min film ratio h_min / Ra (screening). */
  minFilmRatio: number;
  notes: string;
};

export const PLAIN_BEARING_MATERIALS: PlainBearingMaterial[] = [
  {
    id: "babbitt_tin",
    label: "Tin babbitt (ASTM B23)",
    family: "babbitt",
    maxSpecificLoadPa: 5e6,
    maxPvPaMs: 1.75e6,
    maxTempC: 150,
    minFilmRatio: 2,
    notes: "Soft journal lining — good embedability.",
  },
  {
    id: "babbitt_lead",
    label: "Lead babbitt",
    family: "babbitt",
    maxSpecificLoadPa: 4e6,
    maxPvPaMs: 1.4e6,
    maxTempC: 130,
    minFilmRatio: 2,
    notes: "Lower cost babbitt; avoid for food contact.",
  },
  {
    id: "bronze_c932",
    label: "Leaded tin bronze C932",
    family: "bronze",
    maxSpecificLoadPa: 10e6,
    maxPvPaMs: 1.75e6,
    maxTempC: 180,
    minFilmRatio: 1.5,
    notes: "General machine bronze bushing.",
  },
  {
    id: "bronze_c954",
    label: "Aluminum bronze C954",
    family: "bronze",
    maxSpecificLoadPa: 14e6,
    maxPvPaMs: 2.1e6,
    maxTempC: 220,
    minFilmRatio: 1.5,
    notes: "Higher load / shock bronze.",
  },
  {
    id: "bronze_oilite",
    label: "Sintered oilite bronze",
    family: "bronze",
    maxSpecificLoadPa: 7e6,
    maxPvPaMs: 1.0e6,
    maxTempC: 90,
    minFilmRatio: 1,
    notes: "Self-lubricating; limited for continuous high speed.",
  },
  {
    id: "steel_hardened",
    label: "Hardened steel liner",
    family: "steel",
    maxSpecificLoadPa: 20e6,
    maxPvPaMs: 3e6,
    maxTempC: 250,
    minFilmRatio: 3,
    notes: "Requires clean oil and hard journal.",
  },
  {
    id: "ptfe_filled",
    label: "Filled PTFE",
    family: "ptfe",
    maxSpecificLoadPa: 5e6,
    maxPvPaMs: 0.5e6,
    maxTempC: 260,
    minFilmRatio: 1,
    notes: "Dry / boundary friendly; low PV continuous.",
  },
  {
    id: "ptfe_bronze",
    label: "PTFE-bronze composite",
    family: "ptfe",
    maxSpecificLoadPa: 8e6,
    maxPvPaMs: 1.2e6,
    maxTempC: 250,
    minFilmRatio: 1,
    notes: "Metal-backed PTFE liner.",
  },
  {
    id: "peek",
    label: "PEEK polymer",
    family: "plastic",
    maxSpecificLoadPa: 6e6,
    maxPvPaMs: 0.8e6,
    maxTempC: 240,
    minFilmRatio: 1,
    notes: "High-temp engineering plastic.",
  },
  {
    id: "nylon",
    label: "Nylon 6/6",
    family: "plastic",
    maxSpecificLoadPa: 3e6,
    maxPvPaMs: 0.35e6,
    maxTempC: 90,
    minFilmRatio: 1,
    notes: "Light duty bushings.",
  },
  {
    id: "graphited_bronze",
    label: "Graphite-plugged bronze",
    family: "graphite",
    maxSpecificLoadPa: 9e6,
    maxPvPaMs: 1.5e6,
    maxTempC: 300,
    minFilmRatio: 1.2,
    notes: "High-temp dry / mixed film.",
  },
  {
    id: "carbographite",
    label: "Carbon-graphite",
    family: "graphite",
    maxSpecificLoadPa: 4e6,
    maxPvPaMs: 0.7e6,
    maxTempC: 350,
    minFilmRatio: 1,
    notes: "Dry running at elevated temperature.",
  },
];

export function findPlainBearingMaterial(id: string): PlainBearingMaterial | undefined {
  return PLAIN_BEARING_MATERIALS.find((m) => m.id === id);
}

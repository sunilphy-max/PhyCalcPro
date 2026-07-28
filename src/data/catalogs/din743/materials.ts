/**
 * DIN 743-3 material strength catalog (screening lower-bound values).
 * Values are indicative of annex tables for reference diameter dB — not a licensed extract.
 */

import type { Din743HeatTreatment, Din743MaterialClass } from "./types";

export type Din743MaterialEntry = {
  id: string;
  designation: string;
  standardRef: string;
  materialClass: Din743MaterialClass;
  heatTreatment: Din743HeatTreatment;
  /** Reference diameter dB (mm) for tabulated strengths */
  dB_mm: number;
  /** Ultimate tensile strength σB / Rm (MPa) at dB */
  sigmaB_MPa: number;
  /** Yield strength σS / Re (MPa) at dB */
  sigmaS_MPa: number;
  /** Optional tabulated reversed bending fatigue σbW at dB (MPa); else derived */
  sigmaBW_MPa?: number;
  /** Optional reversed torsion fatigue τtW at dB (MPa); else derived */
  tauTW_MPa?: number;
  notes?: string;
};

/**
 * Common shaft steels with DIN 743-3 style lower-bound strengths at dB.
 * Fatigue limits default to σbW≈0.40·σB, τtW≈0.30·σB when not tabulated (DIN 743-3 guidance).
 */
export const DIN743_MATERIAL_CATALOG: Din743MaterialEntry[] = [
  {
    id: "S235JR",
    designation: "S235JR",
    standardRef: "EN 10025-2",
    materialClass: "structural",
    heatTreatment: "normalized",
    dB_mm: 16,
    sigmaB_MPa: 360,
    sigmaS_MPa: 235,
  },
  {
    id: "S355JR",
    designation: "S355JR",
    standardRef: "EN 10025-2",
    materialClass: "structural",
    heatTreatment: "normalized",
    dB_mm: 16,
    sigmaB_MPa: 470,
    sigmaS_MPa: 355,
  },
  {
    id: "C45E",
    designation: "C45E",
    standardRef: "EN 10083-2",
    materialClass: "heat_treatable",
    heatTreatment: "quenched_tempered",
    dB_mm: 16,
    sigmaB_MPa: 700,
    sigmaS_MPa: 490,
    sigmaBW_MPa: 340,
    tauTW_MPa: 210,
  },
  {
    id: "C45E-N",
    designation: "C45E (normalized)",
    standardRef: "EN 10083-2",
    materialClass: "heat_treatable",
    heatTreatment: "normalized",
    dB_mm: 16,
    sigmaB_MPa: 580,
    sigmaS_MPa: 305,
  },
  {
    id: "42CrMo4",
    designation: "42CrMo4",
    standardRef: "EN ISO 683-2",
    materialClass: "heat_treatable",
    heatTreatment: "quenched_tempered",
    dB_mm: 16,
    sigmaB_MPa: 1000,
    sigmaS_MPa: 900,
    sigmaBW_MPa: 480,
    tauTW_MPa: 290,
  },
  {
    id: "34CrNiMo6",
    designation: "34CrNiMo6",
    standardRef: "EN ISO 683-2",
    materialClass: "heat_treatable",
    heatTreatment: "quenched_tempered",
    dB_mm: 16,
    sigmaB_MPa: 1100,
    sigmaS_MPa: 900,
    sigmaBW_MPa: 520,
    tauTW_MPa: 310,
  },
  {
    id: "16MnCr5",
    designation: "16MnCr5",
    standardRef: "EN ISO 683-3",
    materialClass: "case_hardening",
    heatTreatment: "case_hardened",
    dB_mm: 16,
    sigmaB_MPa: 800,
    sigmaS_MPa: 590,
    sigmaBW_MPa: 400,
    tauTW_MPa: 240,
    notes: "Core strengths; surface hardness handled via KV / surface process.",
  },
  {
    id: "18CrNiMo7-6",
    designation: "18CrNiMo7-6",
    standardRef: "EN ISO 683-3",
    materialClass: "case_hardening",
    heatTreatment: "case_hardened",
    dB_mm: 16,
    sigmaB_MPa: 1100,
    sigmaS_MPa: 785,
    sigmaBW_MPa: 520,
    tauTW_MPa: 310,
  },
  {
    id: "31CrMoV9",
    designation: "31CrMoV9",
    standardRef: "EN ISO 683-5",
    materialClass: "nitriding",
    heatTreatment: "nitrided",
    dB_mm: 16,
    sigmaB_MPa: 1000,
    sigmaS_MPa: 800,
    sigmaBW_MPa: 480,
    tauTW_MPa: 290,
  },
  {
    id: "X5CrNi18-10",
    designation: "X5CrNi18-10 (1.4301)",
    standardRef: "EN 10088-3",
    materialClass: "stainless",
    heatTreatment: "normalized",
    dB_mm: 16,
    sigmaB_MPa: 500,
    sigmaS_MPa: 190,
  },
  {
    id: "30CrNiMo8",
    designation: "30CrNiMo8",
    standardRef: "EN ISO 683-2",
    materialClass: "heat_treatable",
    heatTreatment: "quenched_tempered",
    dB_mm: 16,
    sigmaB_MPa: 1250,
    sigmaS_MPa: 1050,
    sigmaBW_MPa: 560,
    tauTW_MPa: 340,
  },
  {
    id: "C60E",
    designation: "C60E",
    standardRef: "EN 10083-2",
    materialClass: "heat_treatable",
    heatTreatment: "quenched_tempered",
    dB_mm: 16,
    sigmaB_MPa: 800,
    sigmaS_MPa: 550,
    sigmaBW_MPa: 380,
    tauTW_MPa: 230,
  },
];

export function findDin743Material(idOrName: string): Din743MaterialEntry | undefined {
  const q = idOrName.trim().toLowerCase();
  return DIN743_MATERIAL_CATALOG.find(
    (m) => m.id.toLowerCase() === q || m.designation.toLowerCase() === q
  );
}

export function matchDin743MaterialFromUltimate(ultimatePa: number): Din743MaterialEntry {
  const suMpa = ultimatePa / 1e6;
  let best = DIN743_MATERIAL_CATALOG[0]!;
  let bestDiff = Infinity;
  for (const m of DIN743_MATERIAL_CATALOG) {
    const d = Math.abs(m.sigmaB_MPa - suMpa);
    if (d < bestDiff) {
      bestDiff = d;
      best = m;
    }
  }
  return best;
}

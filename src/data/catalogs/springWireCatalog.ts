/**
 * Spring wire stock catalog — EN 10270 / ASTM grades at standard diameters.
 * Used by Auto-design sweeps and optional catalog picker in check mode.
 */

import { SPRING_WIRE_DIAMETERS_MM } from "@/data/catalogs/standardSeries";
import { wireUltimateStrengthPa, type SpringWireType } from "@/lib/springs/shared/wireStrength";

export type SpringWireStandard = "EN10270-1" | "ASTM";

export type SpringWireCatalogEntry = {
  designation: string;
  standard: SpringWireStandard;
  grade: SpringWireType;
  diameterMm: number;
  diameterM: number;
  /** Computed Rm [Pa] from Shigley fit or tabulated override */
  tensileStrengthPa: number;
  /** Shear modulus G [Pa] — music/hard-drawn typical */
  shearModulusPa: number;
  /** Elastic modulus E [Pa] — for torsion springs */
  elasticModulusPa: number;
  densityKgM3: number;
};

const GRADE_MODULI: Record<
  Exclude<SpringWireType, "custom">,
  { G: number; E: number; standard: SpringWireStandard; label: string }
> = {
  music: { G: 81e9, E: 210e9, standard: "EN10270-1", label: "SH" },
  "hard-drawn": { G: 78.5e9, E: 205e9, standard: "ASTM", label: "HD" },
  "oil-tempered": { G: 77e9, E: 200e9, standard: "ASTM", label: "OT" },
  "chrome-vanadium": { G: 77e9, E: 200e9, standard: "ASTM", label: "CrV" },
  "chrome-silicon": { G: 77e9, E: 200e9, standard: "ASTM", label: "CrSi" },
};

const CATALOG_GRADES: Exclude<SpringWireType, "custom">[] = [
  "music",
  "hard-drawn",
  "oil-tempered",
  "chrome-vanadium",
  "chrome-silicon",
];

function buildCatalog(): SpringWireCatalogEntry[] {
  const entries: SpringWireCatalogEntry[] = [];
  for (const grade of CATALOG_GRADES) {
    const meta = GRADE_MODULI[grade];
    for (const diameterMm of SPRING_WIRE_DIAMETERS_MM) {
      if (diameterMm < 0.5) continue;
      const diameterM = diameterMm / 1000;
      const Rm = wireUltimateStrengthPa(grade, diameterM, 0);
      entries.push({
        designation: `${meta.standard}-${meta.label}-${diameterMm.toFixed(2).replace(/\.?0+$/, "")}`,
        standard: meta.standard,
        grade,
        diameterMm,
        diameterM,
        tensileStrengthPa: Rm,
        shearModulusPa: meta.G,
        elasticModulusPa: meta.E,
        densityKgM3: 7850,
      });
    }
  }
  return entries;
}

export const springWireCatalog: SpringWireCatalogEntry[] = buildCatalog();

export function findSpringWire(designation: string): SpringWireCatalogEntry | undefined {
  return springWireCatalog.find((e) => e.designation === designation);
}

export function springWiresByGrade(grade: SpringWireType): SpringWireCatalogEntry[] {
  if (grade === "custom") return [];
  return springWireCatalog.filter((e) => e.grade === grade);
}

export function springWireDiametersMm(grade?: SpringWireType): number[] {
  const pool = grade && grade !== "custom" ? springWiresByGrade(grade) : springWireCatalog;
  return [...new Set(pool.map((e) => e.diameterMm))].sort((a, b) => a - b);
}

/** Distinct wire diameters for design sweeps (mm), min 0.5 mm. */
export function designSweepWireDiametersMm(): number[] {
  return springWireDiametersMm().filter((d) => d >= 0.5);
}

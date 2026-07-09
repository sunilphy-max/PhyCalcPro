import { findMaterialById, shearModulus } from "@/data/materials";
import type { SpringWireType } from "@/lib/springs/shared/wireStrength";

export type SpringWireGradeModuli = {
  G: number;
  E: number;
  density: number;
  standard: "EN10270-1" | "ASTM";
  label: string;
};

const WIRE_MATERIAL_IDS: Record<Exclude<SpringWireType, "custom">, string> = {
  music: "spring-music-wire",
  "hard-drawn": "spring-hard-drawn",
  "oil-tempered": "spring-oil-tempered",
  "chrome-vanadium": "spring-crv",
  "chrome-silicon": "spring-crsi",
};

const WIRE_LABELS: Record<Exclude<SpringWireType, "custom">, { standard: "EN10270-1" | "ASTM"; label: string }> = {
  music: { standard: "EN10270-1", label: "SH" },
  "hard-drawn": { standard: "ASTM", label: "HD" },
  "oil-tempered": { standard: "ASTM", label: "OT" },
  "chrome-vanadium": { standard: "ASTM", label: "CrV" },
  "chrome-silicon": { standard: "ASTM", label: "CrSi" },
};

function moduliFromCatalog(id: string, fallback: { G: number; E: number; density: number }) {
  const m = findMaterialById(id);
  if (!m) return fallback;
  return {
    G: m.G ?? shearModulus(m),
    E: m.E,
    density: m.density,
  };
}

/** Unified wire grade moduli sourced from central materials catalog */
export const WIRE_GRADE_MODULI: Record<Exclude<SpringWireType, "custom">, SpringWireGradeModuli> =
  Object.fromEntries(
    (Object.keys(WIRE_MATERIAL_IDS) as Exclude<SpringWireType, "custom">[]).map((grade) => {
      const id = WIRE_MATERIAL_IDS[grade];
      const meta = WIRE_LABELS[grade];
      const fromCatalog = moduliFromCatalog(id, { G: 81e9, E: 207e9, density: 7850 });
      return [
        grade,
        {
          ...fromCatalog,
          standard: meta.standard,
          label: meta.label,
        },
      ];
    })
  ) as Record<Exclude<SpringWireType, "custom">, SpringWireGradeModuli>;

export function getWireGradeModuli(wireType: SpringWireType): SpringWireGradeModuli | null {
  if (wireType === "custom") return null;
  return WIRE_GRADE_MODULI[wireType];
}

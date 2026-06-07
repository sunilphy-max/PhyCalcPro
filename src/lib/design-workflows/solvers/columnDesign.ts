import { ROLLED_SECTIONS } from "@/lib/materials/rolled-sections/data";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import type { BucklingConfig } from "@/lib/structural/columns/types";

export type ColumnSectionCandidate = {
  designation: string;
  weight: number;
  I: number;
  area: number;
  safetyFactor: number;
  utilization: number;
};

export type ColumnDesignSearchResult = {
  best: ColumnSectionCandidate | null;
  ranked: ColumnSectionCandidate[];
};

export function searchColumnSections(
  base: Omit<BucklingConfig, "I" | "A">,
  targetSafetyFactor: number,
  limit = 12
): ColumnDesignSearchResult {
  const ranked: ColumnSectionCandidate[] = [];

  for (const [designation, section] of Object.entries(ROLLED_SECTIONS)) {
    try {
      const result = solveBucklingEngine({
        ...base,
        I: section.ix,
        A: section.area,
      });
      const utilization = targetSafetyFactor / Math.max(result.safetyFactor, 1e-9);
      ranked.push({
        designation,
        weight: section.weight,
        I: section.ix,
        area: section.area,
        safetyFactor: result.safetyFactor,
        utilization,
      });
    } catch {
      // Skip sections that fail validation for this load case.
    }
  }

  ranked.sort((a, b) => {
    const aPass = a.safetyFactor >= targetSafetyFactor;
    const bPass = b.safetyFactor >= targetSafetyFactor;
    if (aPass !== bPass) return aPass ? -1 : 1;
    if (aPass && bPass) return a.weight - b.weight;
    return b.safetyFactor - a.safetyFactor;
  });

  const passing = ranked.filter((item) => item.safetyFactor >= targetSafetyFactor);
  return {
    best: passing[0] ?? null,
    ranked: ranked.slice(0, limit),
  };
}

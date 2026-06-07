import { ROLLED_SECTIONS } from "@/lib/materials/rolled-sections/data";
import { solveBeamEngine } from "@/lib/structural/beams/engine";
import type { BeamConfig } from "@/lib/structural/beams/types";

export type BeamSectionCandidate = {
  designation: string;
  weight: number;
  I: number;
  c: number;
  stressUtilization: number;
  deflectionUtilization: number;
  utilization: number;
};

export type BeamDesignSearchResult = {
  best: BeamSectionCandidate | null;
  ranked: BeamSectionCandidate[];
};

export function searchBeamSections(
  config: BeamConfig,
  allowableStressPa: number,
  deflectionLimit: number,
  limit = 12
): BeamDesignSearchResult {
  const ranked: BeamSectionCandidate[] = [];

  for (const [designation, section] of Object.entries(ROLLED_SECTIONS)) {
    const c = section.depth / 2;
    try {
      const result = solveBeamEngine({
        ...config,
        I: section.ix,
        c,
        meshSegments: Math.max(20, config.meshSegments ?? 20),
      });
      const stressUtilization =
        allowableStressPa > 0 ? result.maxStress / allowableStressPa : Number.POSITIVE_INFINITY;
      const deflectionUtilization =
        deflectionLimit > 0 ? result.maxDeflection / deflectionLimit : Number.POSITIVE_INFINITY;
      const utilization = Math.max(stressUtilization, deflectionUtilization);
      ranked.push({
        designation,
        weight: section.weight,
        I: section.ix,
        c,
        stressUtilization,
        deflectionUtilization,
        utilization,
      });
    } catch {
      // Skip invalid geometry/load combinations for this section.
    }
  }

  ranked.sort((a, b) => {
    const aPass = a.utilization <= 1;
    const bPass = b.utilization <= 1;
    if (aPass !== bPass) return aPass ? -1 : 1;
    if (aPass && bPass) return a.weight - b.weight;
    return a.utilization - b.utilization;
  });

  const passing = ranked.filter((item) => item.utilization <= 1);
  return {
    best: passing[0] ?? null,
    ranked: ranked.slice(0, limit),
  };
}

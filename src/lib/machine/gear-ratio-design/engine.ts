import type { GearRatioDesignConfig, GearRatioDesignResult } from "./types";
export function solveGearRatioDesignEngine(c: GearRatioDesignConfig): GearRatioDesignResult {
  let best = { pinionTeeth: c.minPinionTeeth, gearTeeth: c.minPinionTeeth, actualRatio: 1, error: Infinity };
  for (let z1 = c.minPinionTeeth; z1 <= c.maxTeeth; z1++) {
    const z2 = Math.round(z1 * c.targetRatio);
    if (z2 > c.maxTeeth || z2 < z1) continue;
    const ratio = z2 / z1;
    const error = Math.abs(ratio - c.targetRatio);
    if (error < best.error) best = { pinionTeeth: z1, gearTeeth: z2, actualRatio: ratio, error };
  }
  return best;
}

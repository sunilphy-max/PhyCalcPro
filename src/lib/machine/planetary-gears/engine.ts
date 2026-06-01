import type { PlanetaryGearConfig, PlanetaryGearResult } from "./types";
export function solvePlanetaryGearEngine(c: PlanetaryGearConfig): PlanetaryGearResult {
  const zs = Math.max(10, Math.round(c.sunTeeth));
  const zp = Math.max(10, Math.round(c.planetTeeth));
  const zr = zs + 2 * zp;
  const actualRatio = 1 + zr / zs;
  const m = c.module;
  return { ringTeeth: zr, actualRatio, sunDiameter: m * zs, planetDiameter: m * zp, ringDiameter: m * zr, planetCount: Math.max(3, Math.floor(360 / (zp * 2))) };
}

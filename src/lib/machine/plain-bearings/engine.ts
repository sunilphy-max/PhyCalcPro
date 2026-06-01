import type { PlainBearingConfig, PlainBearingResult } from "./types";
export function solvePlainBearingEngine(c: PlainBearingConfig): PlainBearingResult {
  const r = c.diameter / 2;
  const cRad = c.clearance / 2;
  const omega = (2 * Math.PI * c.speed) / 60;
  const U = (omega * r) / cRad;
  const W = c.load / (c.length * c.diameter);
  const S = (c.viscosity * U) / W;
  const eccentricityRatio = Math.min(0.95, 1 / (1 + S));
  const minFilmThickness = cRad * (1 - eccentricityRatio);
  const powerLoss = c.viscosity * omega ** 2 * r ** 2 * c.length / cRad;
  const status = minFilmThickness > 0.00001 ? "adequate film (indicative)" : "boundary lubrication risk";
  return { sommerfeldNumber: S, eccentricityRatio, minFilmThickness, powerLoss, status };
}

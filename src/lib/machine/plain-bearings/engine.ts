import type { PlainBearingConfig, PlainBearingResult } from "./types";

function solveJournal(c: PlainBearingConfig): PlainBearingResult {
  const r = c.diameter / 2;
  const cRad = c.clearance / 2;
  const omega = (2 * Math.PI * c.speed) / 60;
  const U = (omega * r) / cRad;
  const W = c.load / (c.length * c.diameter);
  const S = (c.viscosity * U) / W;
  const eccentricityRatio = Math.min(0.95, 1 / (1 + S));
  const minFilmThickness = cRad * (1 - eccentricityRatio);
  const powerLoss = (c.viscosity * omega ** 2 * r ** 2 * c.length) / cRad;
  const status =
    minFilmThickness > 0.00001 ? "adequate film (indicative)" : "boundary lubrication risk";

  return {
    bearingType: "journal",
    sommerfeldNumber: S,
    eccentricityRatio,
    minFilmThickness,
    powerLoss,
    status,
  };
}

/** Flat thrust pad — unit load and film thickness screening. */
function solveThrustPad(c: PlainBearingConfig): PlainBearingResult {
  const ratio = c.padDiameterRatio ?? 2;
  const rOut = c.diameter / 2;
  const rIn = rOut / ratio;
  const padArea = Math.PI * (rOut ** 2 - rIn ** 2);
  const unitLoad = c.load / Math.max(padArea, 1e-12);
  const omega = (2 * Math.PI * c.speed) / 60;
  const meanRadius = (rOut + rIn) / 2;
  const surfaceSpeed = omega * meanRadius;
  const filmFactor = (c.viscosity * surfaceSpeed) / Math.max(unitLoad, 1);
  const minFilmThickness = Math.max(1e-6, c.clearance * Math.min(1, filmFactor * 0.01));
  const powerLoss = c.viscosity * omega ** 2 * meanRadius ** 2 * padArea / Math.max(c.clearance, 1e-9);
  const status =
    unitLoad < 3e6 && minFilmThickness > 5e-6
      ? "Thrust pad load and film adequate (indicative)"
      : "Review pad area, speed or lubricant viscosity";

  return {
    bearingType: "thrust_pad",
    sommerfeldNumber: filmFactor,
    eccentricityRatio: 0,
    minFilmThickness,
    powerLoss,
    unitLoad,
    status,
  };
}

/** Tilting-pad thrust — load split across pads with pivot factor. */
function solveTiltingPad(c: PlainBearingConfig): PlainBearingResult {
  const padCount = Math.max(3, Math.round(c.padCount ?? 6));
  const loadPerPad = c.load / padCount;
  const perPad = solveThrustPad({ ...c, load: loadPerPad, bearingType: "thrust_pad" });
  const pivotFactor = 1.15;
  const minFilmThickness = perPad.minFilmThickness * pivotFactor;

  return {
    ...perPad,
    bearingType: "tilting_pad",
    minFilmThickness,
    powerLoss: perPad.powerLoss * padCount,
    status: `${padCount}-pad tilting thrust: ${perPad.status}`,
  };
}

export function solvePlainBearingEngine(c: PlainBearingConfig): PlainBearingResult {
  if (c.bearingType === "thrust_pad") return solveThrustPad(c);
  if (c.bearingType === "tilting_pad") return solveTiltingPad(c);
  return solveJournal(c);
}

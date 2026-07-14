import type { PlainBearingConfig, PlainBearingResult } from "./types";
import {
  bearingTemperatureRiseC,
  eccentricityFromSommerfeld,
  recommendPlainJournalFits,
  sommerfeldNumber,
  specificLoadPa,
} from "./iso7902";
import { kinematicViscosityAtTemp } from "@/lib/machine/bearings/lubrication";

/**
 * Scale dynamic viscosity with temperature using Walther screening (ISO VG proxy).
 * Input viscosity is treated as the value at ambient (or stated reference) temperature.
 */
function viscosityAtOperatingTemp(
  viscosityPas: number,
  ambientTempC: number,
  operatingTempC: number
): number {
  const vgProxy = 68;
  const nuAmb = kinematicViscosityAtTemp(vgProxy, ambientTempC);
  const nuOp = kinematicViscosityAtTemp(vgProxy, operatingTempC);
  if (nuAmb <= 0) return viscosityPas;
  return Math.max(viscosityPas * (nuOp / nuAmb), viscosityPas * 0.05);
}

function solveJournalPass(c: PlainBearingConfig, viscosityPas: number): PlainBearingResult {
  const r = c.diameter / 2;
  const cRad = c.clearance / 2;
  const S = sommerfeldNumber({
    viscosityPas,
    speedRpm: c.speed,
    radialLoadN: c.load,
    diameterM: c.diameter,
    lengthM: c.length,
    radialClearanceM: cRad,
  });
  const eccentricityRatio = eccentricityFromSommerfeld(S);
  const minFilmThickness = cRad * (1 - eccentricityRatio);
  const omega = (2 * Math.PI * c.speed) / 60;
  const powerLoss = (viscosityPas * omega ** 2 * r ** 2 * c.length) / Math.max(cRad, 1e-12);
  const specLoad = specificLoadPa(c.load, c.diameter, c.length);
  const tempRise = bearingTemperatureRiseC(powerLoss, c.diameter, c.length);
  const ambient = c.ambientTempC ?? 40;
  const outletTempC = ambient + tempRise;
  const fits = recommendPlainJournalFits(c.diameter, c.speed);

  const filmOk = minFilmThickness > 5e-6;
  const loadOk = specLoad < 3.5e6;
  const tempOk = outletTempC < 120;
  const isSafe = filmOk && loadOk && tempOk;
  const designStatus: PlainBearingResult["designStatus"] = isSafe
    ? "safe"
    : filmOk || loadOk
      ? "warning"
      : "critical";

  const status = isSafe
    ? "ISO 7902 journal: adequate film, load and temperature (screening)"
    : !filmOk
      ? "Boundary lubrication risk — increase clearance, viscosity, or bearing length"
      : !loadOk
        ? "Specific load high — increase bearing area"
        : "Operating temperature high — improve cooling or lubricant";

  return {
    bearingType: "journal",
    sommerfeldNumber: S,
    eccentricityRatio,
    minFilmThickness,
    powerLoss,
    specificLoadPa: specLoad,
    temperatureRiseC: tempRise,
    outletTempC,
    shaftFit: fits.shaftFit,
    housingFit: fits.housingFit,
    minRecommendedClearanceUm: fits.minClearanceUm,
    status,
    designStatus,
    isSafe,
  };
}

function solveJournal(c: PlainBearingConfig): PlainBearingResult {
  const ambient = c.ambientTempC ?? 40;
  let mu = c.viscosity;
  let last = solveJournalPass(c, mu);
  // Light iterative ΔT ↔ viscosity (2–3 passes). Short-bearing / single-zone limits remain.
  for (let i = 0; i < 3; i++) {
    const meanFilmTemp = ambient + Math.max(last.temperatureRiseC ?? 0, 0) * 0.5;
    mu = viscosityAtOperatingTemp(c.viscosity, ambient, meanFilmTemp);
    last = solveJournalPass(c, mu);
  }
  return last;
}

/** ISO 12131 thrust pad — unit load and film thickness screening. */
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
  const minFilmThickness = Math.max(1e-6, c.clearance * Math.min(1, filmFactor * 0.015));
  const powerLoss =
    (c.viscosity * omega ** 2 * meanRadius ** 2 * padArea) / Math.max(c.clearance, 1e-9);
  const tempRise = bearingTemperatureRiseC(powerLoss, c.diameter, c.diameter * 0.3);
  const isSafe = unitLoad < 2.5e6 && minFilmThickness > 8e-6;

  return {
    bearingType: "thrust_pad",
    sommerfeldNumber: filmFactor,
    eccentricityRatio: 0,
    minFilmThickness,
    powerLoss,
    unitLoad,
    temperatureRiseC: tempRise,
    outletTempC: (c.ambientTempC ?? 40) + tempRise,
    status: isSafe
      ? "ISO 12131 thrust pad: load and film adequate (screening)"
      : "Review pad area, speed or lubricant viscosity",
    designStatus: isSafe ? "safe" : unitLoad < 3e6 ? "warning" : "critical",
    isSafe,
  };
}

/** ISO 12130 tilting-pad thrust. */
function solveTiltingPad(c: PlainBearingConfig): PlainBearingResult {
  const padCount = Math.max(3, Math.round(c.padCount ?? 6));
  const loadPerPad = c.load / padCount;
  const perPad = solveThrustPad({ ...c, load: loadPerPad, bearingType: "thrust_pad" });
  const pivotFactor = 1.12;
  const minFilmThickness = perPad.minFilmThickness * pivotFactor;

  return {
    ...perPad,
    bearingType: "tilting_pad",
    minFilmThickness,
    powerLoss: perPad.powerLoss * padCount,
    status: `${padCount}-pad tilting thrust (ISO 12130): ${perPad.status}`,
    isSafe: perPad.isSafe && minFilmThickness > 6e-6,
    designStatus: perPad.isSafe ? "safe" : perPad.designStatus,
  };
}

export function solvePlainBearingEngine(c: PlainBearingConfig): PlainBearingResult {
  if (c.bearingType === "thrust_pad") return solveThrustPad(c);
  if (c.bearingType === "tilting_pad") return solveTiltingPad(c);
  return solveJournal(c);
}

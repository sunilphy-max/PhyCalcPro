import type { PlainBearingConfig, PlainBearingResult } from "./types";
import {
  bearingTemperatureRiseC,
  eccentricityFromSommerfeld,
  petroffPowerLossW,
  recommendPlainJournalFits,
  sommerfeldNumber,
  specificLoadPa,
} from "./iso7902";
import { kinematicViscosityAtTemp } from "@/lib/machine/bearings/lubrication";
import {
  findPlainBearingOil,
  oilDynamicViscosityPas,
} from "@/data/catalogs/plainBearingOils";
import { findPlainBearingMaterial } from "@/data/catalogs/plainBearingMaterials";

/**
 * Scale dynamic viscosity with temperature using Walther screening (ISO VG proxy).
 * Input viscosity is treated as the value at ambient (or stated reference) temperature.
 */
function viscosityAtOperatingTemp(
  viscosityPas: number,
  ambientTempC: number,
  operatingTempC: number,
  oilId?: string
): number {
  if (oilId) {
    const oil = findPlainBearingOil(oilId);
    if (oil) return oilDynamicViscosityPas(oil, operatingTempC);
  }
  const vgProxy = 68;
  const nuAmb = kinematicViscosityAtTemp(vgProxy, ambientTempC);
  const nuOp = kinematicViscosityAtTemp(vgProxy, operatingTempC);
  if (nuAmb <= 0) return viscosityPas;
  return Math.max(viscosityPas * (nuOp / nuAmb), viscosityPas * 0.05);
}

function resolveBaseViscosity(c: PlainBearingConfig, ambient: number): number {
  if (c.oilId) {
    const oil = findPlainBearingOil(c.oilId);
    if (oil) return oilDynamicViscosityPas(oil, ambient);
  }
  return c.viscosity;
}

function applyMaterialLimits(
  result: PlainBearingResult,
  c: PlainBearingConfig,
  surfaceSpeedMs: number
): PlainBearingResult {
  const mat =
    (c.materialId ? findPlainBearingMaterial(c.materialId) : undefined) ??
    (c.material === "babbitt"
      ? findPlainBearingMaterial("babbitt_tin")
      : c.material === "bronze"
        ? findPlainBearingMaterial("bronze_c932")
        : c.material === "ptfe"
          ? findPlainBearingMaterial("ptfe_filled")
          : c.material === "steel"
            ? findPlainBearingMaterial("steel_hardened")
            : undefined);

  const pv = (result.specificLoadPa ?? result.unitLoad ?? 0) * surfaceSpeedMs;
  let { isSafe, designStatus, status } = result;
  if (mat) {
    const loadLimit = mat.maxSpecificLoadPa;
    const loadOk = (result.specificLoadPa ?? result.unitLoad ?? 0) <= loadLimit;
    const pvOk = pv <= mat.maxPvPaMs;
    const tempOk = (result.outletTempC ?? 0) <= mat.maxTempC;
    if (!loadOk || !pvOk || !tempOk) {
      isSafe = false;
      designStatus = !loadOk || !pvOk ? "critical" : "warning";
      status = !loadOk
        ? `Specific load exceeds ${mat.label} limit (${(loadLimit / 1e6).toFixed(1)} MPa)`
        : !pvOk
          ? `PV exceeds ${mat.label} screening limit`
          : `Outlet T exceeds ${mat.label} max ${mat.maxTempC} °C`;
    }
  }
  return {
    ...result,
    pvPaMs: pv,
    oilId: c.oilId,
    materialId: mat?.id ?? c.materialId,
    isSafe,
    designStatus,
    status,
  };
}

function solveJournalPass(c: PlainBearingConfig, viscosityPas: number): PlainBearingResult {
  const cRad = c.clearance / 2;
  const ld = c.length / Math.max(c.diameter, 1e-12);
  const S = sommerfeldNumber({
    viscosityPas,
    speedRpm: c.speed,
    radialLoadN: c.load,
    diameterM: c.diameter,
    lengthM: c.length,
    radialClearanceM: cRad,
  });
  const eccentricityRatio = eccentricityFromSommerfeld(S, ld);
  const minFilmThickness = cRad * (1 - eccentricityRatio);
  // Petroff concentric viscous loss (screening). Eccentric operation increases
  // friction modestly; apply a light ε uplift so heavily loaded journals run hotter.
  const concentricLoss = petroffPowerLossW({
    viscosityPas,
    speedRpm: c.speed,
    diameterM: c.diameter,
    lengthM: c.length,
    radialClearanceM: cRad,
  });
  const powerLoss = concentricLoss * (1 + 0.35 * eccentricityRatio);
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
    ? `ISO 7902 journal (L/D=${ld.toFixed(2)}): adequate film, load and temperature (screening)`
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
    lengthOverDiameter: ld,
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
  const omega = (2 * Math.PI * c.speed) / 60;
  const surfaceSpeed = omega * (c.diameter / 2);

  // Explicit viscosity is the operating-film value — do not invent a VG proxy derate.
  // Catalog oils (oilId) get Walther/temp iteration from ambient → mean film temperature.
  if (!c.oilId) {
    return applyMaterialLimits(solveJournalPass(c, c.viscosity), c, surfaceSpeed);
  }

  let mu = resolveBaseViscosity(c, ambient);
  let last = solveJournalPass(c, mu);
  for (let i = 0; i < 3; i++) {
    const meanFilmTemp = ambient + Math.max(last.temperatureRiseC ?? 0, 0) * 0.5;
    mu = viscosityAtOperatingTemp(resolveBaseViscosity(c, ambient), ambient, meanFilmTemp, c.oilId);
    last = solveJournalPass(c, mu);
  }
  return applyMaterialLimits(last, c, surfaceSpeed);
}

function solveThrustPad(c: PlainBearingConfig): PlainBearingResult {
  const ratio = c.padDiameterRatio ?? 2;
  const rOut = c.diameter / 2;
  const rIn = rOut / ratio;
  const padArea = Math.PI * (rOut ** 2 - rIn ** 2);
  const unitLoad = c.load / Math.max(padArea, 1e-12);
  const omega = (2 * Math.PI * c.speed) / 60;
  const meanRadius = (rOut + rIn) / 2;
  const surfaceSpeed = omega * meanRadius;
  const mu = resolveBaseViscosity(c, c.ambientTempC ?? 40);
  const filmFactor = (mu * surfaceSpeed) / Math.max(unitLoad, 1);
  const minFilmThickness = Math.max(1e-6, c.clearance * Math.min(1, filmFactor * 0.015));
  const powerLoss = (mu * omega ** 2 * meanRadius ** 2 * padArea) / Math.max(c.clearance, 1e-9);
  const tempRise = bearingTemperatureRiseC(powerLoss, c.diameter, c.diameter * 0.3);
  const isSafe = unitLoad < 2.5e6 && minFilmThickness > 8e-6;

  const result: PlainBearingResult = {
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
  return applyMaterialLimits(result, c, surfaceSpeed);
}

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

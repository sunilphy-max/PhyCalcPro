import { describe, expect, it } from "vitest";
import {
  calculateAiso,
  estimateFatigueLoadLimitN,
  ratedViscosityNu1,
  resolveModifiedLifeFactors,
  viscosityRatio,
} from "./iso281Life";
import { kinematicViscosityAtTemp } from "./lubrication";
import { splitLocatingFloatingLoads, splitPairedLoads } from "./pairedLoads";
import { equivalentLoadFromSpectrum } from "./variableLoad";
import { equivalentLoadFromRadialAxial } from "./equivalentLoad";
import { solveBearingEngine } from "./engine";

const LEGACY_MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 35000,
  staticRatingFactor: 15000,
  allowableLife: 10000,
};

describe("ISO 281 modified life", () => {
  it("computes κ and aISO from viscosity inputs", () => {
    const nu1 = ratedViscosityNu1(32.5, 1500);
    const kappa = viscosityRatio(68, nu1);
    expect(kappa).toBeGreaterThan(0);
    const aIso = calculateAiso({ kappa, eC: 0.5, puOverP: 0.02 });
    expect(aIso).toBeGreaterThan(0.1);
    expect(aIso).toBeLessThanOrEqual(50);
  });

  it("estimates Pu from C", () => {
    expect(estimateFatigueLoadLimitN(40000, "deep_groove")).toBeCloseTo(1000);
    expect(estimateFatigueLoadLimitN(40000, "tapered_roller")).toBeCloseTo(1200);
  });

  it("reduces aISO at poor lubrication", () => {
    const good = resolveModifiedLifeFactors({
      kinematicViscosityCst: 100,
      meanDiameterMm: 32.5,
      speedRpm: 1500,
      contamination: "high_clean",
      fatigueLoadLimitN: 1000,
      equivalentLoadN: 5000,
      bearingType: "deep_groove",
    });
    const poor = resolveModifiedLifeFactors({
      kinematicViscosityCst: 2,
      meanDiameterMm: 32.5,
      speedRpm: 1500,
      contamination: "heavy_contamination",
      fatigueLoadLimitN: 1000,
      equivalentLoadN: 5000,
      bearingType: "deep_groove",
    });
    expect(poor.aIso).toBeLessThan(good.aIso);
  });

  it("computes viscosity at temperature from ISO VG", () => {
    const nu70 = kinematicViscosityAtTemp(68, 70);
    expect(nu70).toBeLessThan(68);
    expect(nu70).toBeGreaterThan(5);
  });
});

describe("paired bearings", () => {
  it("splits Fa for back-to-back pair", () => {
    const stations = splitPairedLoads(5000, 2000, "back_to_back");
    expect(stations).toHaveLength(2);
    expect(stations[0]!.radialLoad).toBeCloseTo(2500);
    expect(stations[0]!.axialLoad).toBeCloseTo(1000);
  });

  it("splits locating + floating loads", () => {
    const stations = splitLocatingFloatingLoads(6000, 1500);
    expect(stations[0]!.axialLoad).toBeCloseTo(1500);
    expect(stations[1]!.axialLoad).toBe(0);
    expect(stations[0]!.radialLoad).toBeCloseTo(3000);
  });

  it("uses minimum station life for paired system", () => {
    const res = solveBearingEngine({
      radialLoad: 5000,
      axialLoad: 3000,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1,
      bearingType: "angular_contact",
      designation: "7205",
      arrangement: "back_to_back",
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      material: LEGACY_MATERIAL,
    });
    expect(res.pairedStations?.length).toBe(2);
    expect(res.modifiedLife).toBeGreaterThan(0);
  });
});

describe("variable load spectrum", () => {
  it("computes ISO 281-1 equivalent load", () => {
    const P = equivalentLoadFromSpectrum(
      [
        { durationFraction: 0.7, radialLoad: 5000, axialLoad: 0 },
        { durationFraction: 0.3, radialLoad: 8000, axialLoad: 0 },
      ],
      "deep_groove",
      (Fr, Fa) => equivalentLoadFromRadialAxial(Fr, Fa, "deep_groove")
    );
    expect(P).toBeGreaterThan(5000);
    expect(P).toBeLessThan(8000);
  });
});

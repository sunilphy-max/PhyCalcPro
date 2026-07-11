import { describe, expect, it } from "vitest";
import { calculateRelubricationInterval } from "./relubrication";
import { calculateThermalEquilibrium } from "./thermalEquilibrium";
import { systemLifeFromStations, weibullSystemLifeHours } from "./pairedLoads";
import { solveBearingEngine } from "./engine";

const MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 35000,
  staticRatingFactor: 15000,
  allowableLife: 10000,
};

describe("relubrication interval", () => {
  it("returns finite grease interval", () => {
    const res = calculateRelubricationInterval({
      speedRpm: 1800,
      meanDiameterMm: 40,
      operatingTempC: 70,
      dynamicUtilization: 0.08,
      bearingType: "deep_groove",
      lubricantType: "grease",
      contamination: "normal_clean",
    });
    expect(res.intervalHours).toBeGreaterThan(100);
    expect(res.status).toBeDefined();
  });

  it("shortens interval at high temperature", () => {
    const cool = calculateRelubricationInterval({
      speedRpm: 3000,
      meanDiameterMm: 50,
      operatingTempC: 70,
      dynamicUtilization: 0.1,
      bearingType: "deep_groove",
      lubricantType: "grease",
    });
    const hot = calculateRelubricationInterval({
      speedRpm: 3000,
      meanDiameterMm: 50,
      operatingTempC: 100,
      dynamicUtilization: 0.1,
      bearingType: "deep_groove",
      lubricantType: "grease",
    });
    expect(hot.intervalHours).toBeLessThan(cool.intervalHours);
  });
});

describe("thermal equilibrium", () => {
  it("computes ΔT from friction power", () => {
    const res = calculateThermalEquilibrium({
      equivalentLoadN: 5000,
      meanDiameterMm: 40,
      speedRpm: 3000,
      bearingType: "deep_groove",
      ambientTempC: 20,
      lubricantType: "oil",
      isoVgGrade: 68,
    });
    expect(res.powerLossW).toBeGreaterThan(0);
    expect(res.equilibriumTempC).toBeGreaterThan(res.ambientTempC);
    expect(res.viscosityCst).toBeGreaterThan(0);
  });
});

describe("Weibull system life", () => {
  it("is less than or equal to the weaker station", () => {
    const Lsys = weibullSystemLifeHours([20000, 30000]);
    expect(Lsys).toBeLessThan(20000);
    expect(Lsys).toBeGreaterThan(10000);
  });

  it("systemLifeFromStations exposes Weibull", () => {
    const sys = systemLifeFromStations([
      {
        station: { index: 0, radialLoad: 3000, axialLoad: 1000, dynamicRatingMultiplier: 1 },
        equivalentLoad: 3500,
        staticEquivalentLoad: 3000,
        basicLifeHours: 25000,
        modifiedLifeHours: 20000,
      },
      {
        station: { index: 1, radialLoad: 3000, axialLoad: 0, dynamicRatingMultiplier: 1 },
        equivalentLoad: 3000,
        staticEquivalentLoad: 3000,
        basicLifeHours: 40000,
        modifiedLifeHours: 35000,
      },
    ]);
    expect(sys.weibullSystemLifeHours).toBeLessThan(sys.modifiedLifeHours);
  });
});

describe("engine integration", () => {
  it("returns thermal equilibrium and relubrication", () => {
    const res = solveBearingEngine({
      radialLoad: 5000,
      axialLoad: 1000,
      speed: 1800,
      lifeHours: 20000,
      safetyFactor: 1.2,
      bearingType: "deep_groove",
      designation: "6208",
      lubricantType: "grease",
      isoVgGrade: 100,
      operatingTempC: 70,
      contamination: "normal_clean",
      useThermalEquilibrium: true,
      material: MATERIAL,
    });
    expect(res.thermalEquilibrium).toBeDefined();
    expect(res.relubrication?.intervalHours).toBeGreaterThan(0);
    expect(res.powerLossW).toBeGreaterThan(0);
  });

  it("uses shaft station reactions for locating/floating", () => {
    const res = solveBearingEngine({
      radialLoad: 8000,
      axialLoad: 2000,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1.2,
      bearingType: "deep_groove",
      designation: "6208",
      mountingSystem: "locating_floating",
      locatingBearingType: "deep_groove",
      floatingBearingType: "cylindrical_roller",
      stationRadialLoadsN: [5500, 2500],
      bearingSpanMm: 420,
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      material: MATERIAL,
    });
    expect(res.pairedStations?.[0]?.radialLoad).toBeCloseTo(5500);
    expect(res.pairedStations?.[1]?.radialLoad).toBeCloseTo(2500);
    expect(res.pairedStations?.[1]?.axialLoad).toBe(0);
    expect(res.weibullSystemLifeHours).toBeGreaterThan(0);
  });
});

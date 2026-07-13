import { describe, expect, it } from "vitest";
import { diagnoseBearing } from "./diagnosis";
import type { BearingResult } from "./types";

function baseResult(overrides: Partial<BearingResult> = {}): BearingResult {
  return {
    radialLoad: 5000,
    axialLoad: 1000,
    equivalentLoad: 5500,
    staticEquivalentLoad: 6000,
    requiredDynamicRating: 12000,
    requiredStaticRating: 8000,
    expectedLife: 10000,
    modifiedLife: 8000,
    expectedLifeRevolutions: 1e9,
    dynamicLoadRatingN: 15000,
    staticLoadRatingN: 12000,
    limitingSpeedRpm: 12000,
    lifeExponent: 3,
    a1: 1,
    aIso: 0.8,
    modifiedLifeFactors: { kappa: 0.3, nuCst: 20, nu1Cst: 15, eC: 0.5, puOverP: 0.1, aIso: 1, fatigueLoadLimitN: 1000 },
    dynamicUtilization: 0.37,
    staticSafetyFactor: 2,
    speedMargin: 2,
    lifeUtilization: 0.5,
    safetyFactor: 1.5,
    bearingType: "deep_groove",
    designation: "6205",
    geometry: { boreMm: 25, outerDiameterMm: 52, widthMm: 15 },
    referenceSpeedMargin: null,
    designStatus: "safe",
    isSafe: true,
    governingFailureMode: "Life utilization",
    material: { name: "steel", dynamicRatingFactor: 1, staticRatingFactor: 1, allowableLife: 1 },
    arrangement: "single",
    minimumRadialLoadN: 100,
    minLoadSatisfied: true,
    frictionTorqueNm: 0.05,
    powerLossW: 50,
    temperatureDeratingFactor: 1,
    lifeMethod: "iso281",
    ...overrides,
  };
}

describe("diagnoseBearing", () => {
  it("flags dynamic overload when P/C exceeds 1", () => {
    const result = baseResult({ dynamicUtilization: 1.2, lifeUtilization: 1.1, designStatus: "critical" });
    const diagnosis = diagnoseBearing(result, {
      radialLoad: 8000,
      axialLoad: 2000,
      speed: 3000,
      bearingType: "deep_groove",
      manufacturer: "SKF",
      applicationProfile: "all",
      arrangement: "single",
      lubricantType: "oil",
      contamination: "normal_clean",
      operatingTempC: 70,
    });
    expect(diagnosis.overallRisk).toBe("high");
    expect(diagnosis.findings.some((f) => f.category === "overload" && f.level === "high")).toBe(true);
  });

  it("suggests catalog replacements", () => {
    const result = baseResult({ dynamicUtilization: 1.1, requiredDynamicRating: 20000 });
    const diagnosis = diagnoseBearing(result, {
      radialLoad: 8000,
      axialLoad: 2000,
      speed: 1800,
      bearingType: "deep_groove",
      manufacturer: "SKF",
      applicationProfile: "all",
      arrangement: "single",
      lubricantType: "oil",
      contamination: "normal_clean",
      operatingTempC: 70,
    });
    expect(diagnosis.replacements.length).toBeGreaterThan(0);
  });
});

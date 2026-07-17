import { describe, expect, it } from "vitest";
import { diagnosePlainBearing } from "./diagnosis";
import { solvePlainBearingEngine } from "./engine";
import type { PlainBearingConfig, PlainBearingResult } from "./types";

const baseJournal: PlainBearingConfig = {
  bearingType: "journal",
  load: 1500,
  speed: 600,
  diameter: 0.08,
  length: 0.1,
  clearance: 1.2e-4,
  viscosity: 0.04,
};

/** Synthetic adequate result — isolates diagnosis thresholds from Raimondi–Boyd scatter. */
const adequateResult: PlainBearingResult = {
  bearingType: "journal",
  sommerfeldNumber: 0.4,
  eccentricityRatio: 0.35,
  minFilmThickness: 25e-6,
  powerLoss: 40,
  specificLoadPa: 1.8e5,
  temperatureRiseC: 12,
  outletTempC: 52,
  shaftFit: "h7",
  housingFit: "H8",
  minRecommendedClearanceUm: 30,
  status: "adequate film, load and temperature (screening)",
  designStatus: "safe",
  isSafe: true,
};

describe("diagnosePlainBearing", () => {
  it("reports low risk for an adequate journal", () => {
    const diagnosis = diagnosePlainBearing(adequateResult, baseJournal);
    expect(diagnosis.overallRisk).toBe("low");
    expect(diagnosis.findings.every((f) => f.level !== "high")).toBe(true);
    expect(diagnosis.summary.toLowerCase()).toMatch(/within|typical|adequate|film/);
  });

  it("flags starved film under heavy load", () => {
    const config: PlainBearingConfig = {
      bearingType: "journal",
      load: 120000,
      speed: 300,
      diameter: 0.04,
      length: 0.03,
      clearance: 1.5e-5,
      viscosity: 0.005,
    };
    const result = solvePlainBearingEngine(config);
    const diagnosis = diagnosePlainBearing(result, config);
    expect(diagnosis.overallRisk).not.toBe("low");
    expect(diagnosis.findings.some((f) => f.category === "film" || f.category === "overload")).toBe(
      true
    );
    expect(diagnosis.adjustments.length).toBeGreaterThan(0);
  });

  it("flags thermal risk for hot thrust pad", () => {
    const config: PlainBearingConfig = {
      bearingType: "thrust_pad",
      load: 40000,
      speed: 3600,
      diameter: 0.08,
      length: 0.02,
      clearance: 4e-5,
      viscosity: 0.02,
      padDiameterRatio: 2,
    };
    const result = solvePlainBearingEngine(config);
    const diagnosis = diagnosePlainBearing(result, config);
    expect(diagnosis.findings.length).toBeGreaterThan(0);
  });
});

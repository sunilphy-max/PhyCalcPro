import { describe, expect, it } from "vitest";
import {
  eccentricityFromSommerfeld,
  petroffPowerLossW,
  sommerfeldNumber,
} from "./iso7902";
import { solvePlainBearingEngine } from "./engine";

describe("plain bearing ISO 7902 screening", () => {
  it("maps low Sommerfeld to high eccentricity (Raimondi–Boyd direction)", () => {
    const low = eccentricityFromSommerfeld(0.01, 1);
    const high = eccentricityFromSommerfeld(1, 1);
    expect(low).toBeGreaterThan(high);
    expect(low).toBeGreaterThan(0.85);
    expect(high).toBeLessThan(0.35);
  });

  it("matches indicative journal regression loads for S and film", () => {
    const result = solvePlainBearingEngine({
      bearingType: "journal",
      load: 20000,
      speed: 1200,
      diameter: 0.05,
      length: 0.04,
      clearance: 0.00005,
      viscosity: 0.03,
    });
    const S = sommerfeldNumber({
      viscosityPas: 0.03,
      speedRpm: 1200,
      radialLoadN: 20000,
      diameterM: 0.05,
      lengthM: 0.04,
      radialClearanceM: 0.000025,
    });
    expect(result.sommerfeldNumber).toBeCloseTo(S, 12);
    expect(result.eccentricityRatio).toBeGreaterThan(0.9);
    expect(result.minFilmThickness).toBeCloseTo(0.000025 * (1 - result.eccentricityRatio), 12);
    expect(result.powerLoss).toBeGreaterThan(10);
    expect(result.powerLoss).toBeLessThan(200);
  });

  it("uses Petroff-scale power loss (not the old r²/c blow-up)", () => {
    const p = petroffPowerLossW({
      viscosityPas: 0.03,
      speedRpm: 1200,
      diameterM: 0.05,
      lengthM: 0.04,
      radialClearanceM: 0.000025,
    });
    expect(p).toBeGreaterThan(50);
    expect(p).toBeLessThan(120);
  });
});

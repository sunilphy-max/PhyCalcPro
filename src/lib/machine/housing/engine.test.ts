import { describe, expect, it } from "vitest";
import { solveHousingEngine } from "./engine";

describe("solveHousingEngine", () => {
  it("computes bolt loads for pillow block mount", () => {
    const res = solveHousingEngine({
      boreDiameter: 0.04,
      radialLoad: 5000,
      axialLoad: 1000,
      speed: 1500,
      mountStyle: "pillow_block",
      boltCount: 4,
      boltCircleDiameter: 0.12,
      yieldStress: 250e6,
    });
    expect(res.boltTensionPerBolt).toBeGreaterThan(0);
    expect(res.boltShearPerBolt).toBeCloseTo(1275, 0);
    expect(res.bodySafetyFactor).toBeGreaterThan(1);
    expect(res.recommendedBoltSize).toMatch(/^M\d+/);
  });
});

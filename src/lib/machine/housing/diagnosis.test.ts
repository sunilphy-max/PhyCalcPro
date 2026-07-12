import { describe, expect, it } from "vitest";
import { diagnoseHousing } from "./diagnosis";
import { solveHousingEngine } from "./engine";
import type { HousingConfig } from "./types";

const base: HousingConfig = {
  boreDiameter: 0.04,
  radialLoad: 5000,
  axialLoad: 500,
  speed: 1500,
  mountStyle: "pillow_block",
  boltCount: 4,
  boltCircleDiameter: 0.12,
  yieldStress: 250e6,
};

describe("diagnoseHousing", () => {
  it("reports low or medium risk for a typical pillow block", () => {
    const result = solveHousingEngine(base);
    const diagnosis = diagnoseHousing(result, base);
    expect(result.bodySafetyFactor).toBeGreaterThan(1);
    expect(["low", "medium"]).toContain(diagnosis.overallRisk);
  });

  it("flags body overload under heavy radial load", () => {
    const config: HousingConfig = {
      ...base,
      radialLoad: 2e5,
      boltCircleDiameter: 0.08,
      yieldStress: 200e6,
    };
    const result = solveHousingEngine(config);
    const diagnosis = diagnoseHousing(result, config);
    expect(diagnosis.overallRisk).not.toBe("low");
    expect(diagnosis.findings.some((f) => f.category === "body")).toBe(true);
    expect(diagnosis.adjustments.length).toBeGreaterThan(0);
  });
});

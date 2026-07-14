import { describe, expect, it } from "vitest";
import { solvePlainBearingEngine } from "./engine";
import { explainPlainBearingRecommendation } from "./recommendationAdvisor";

describe("plain bearing recommendation advisor", () => {
  it("explains journal L/D, film, and cost band", () => {
    const config = {
      bearingType: "journal" as const,
      diameter: 0.05,
      length: 0.05,
      clearance: 75e-6,
      load: 3000,
      speed: 1500,
      viscosity: 0.04,
      ambientTempC: 40,
    };
    const result = solvePlainBearingEngine(config);
    const advisor = explainPlainBearingRecommendation(result, config);
    expect(advisor.narrative.length).toBeGreaterThan(40);
    expect(advisor.reasons.length).toBeGreaterThan(2);
    expect(advisor.costBand).toBe("Low");
    expect(advisor.summary).toMatch(/journal|S =|film|cost/i);
  });
});

describe("plain bearing ΔT iteration", () => {
  it("returns finite outlet temperature after viscosity iteration", () => {
    const result = solvePlainBearingEngine({
      bearingType: "journal",
      diameter: 0.08,
      length: 0.08,
      clearance: 100e-6,
      load: 8000,
      speed: 3000,
      viscosity: 0.06,
      ambientTempC: 40,
    });
    expect(result.outletTempC).toBeGreaterThan(40);
    expect(Number.isFinite(result.sommerfeldNumber)).toBe(true);
    expect(result.minFilmThickness).toBeGreaterThan(0);
  });
});

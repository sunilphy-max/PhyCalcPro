import { describe, expect, it } from "vitest";
import { solveHousingEngine } from "./engine";
import { buildMountedBom } from "./mountedBom";
import { explainHousingRecommendation } from "./recommendationAdvisor";

describe("housing recommendation advisor", () => {
  it("includes SKU, body SF, bolts, and seal notes", () => {
    const config = {
      mountStyle: "pillow_block" as const,
      boreDiameter: 0.05,
      radialLoad: 5000,
      axialLoad: 500,
      boltCircleDiameter: 0.14,
      boltCount: 4,
      yieldStress: 250e6,
      speed: 1500,
    };
    const result = solveHousingEngine(config);
    const bom = buildMountedBom({
      boreMm: 50,
      seriesClassPrefer: "SNL",
    });
    const advisor = explainHousingRecommendation(result, config, bom);
    expect(advisor.narrative).toMatch(/mm bore/i);
    expect(advisor.reasons.some((r) => /Body/i.test(r))).toBe(true);
    expect(advisor.reasons.some((r) => /Seal/i.test(r))).toBe(true);
    expect(["Low", "Medium", "High"]).toContain(advisor.costBand);
  });
});

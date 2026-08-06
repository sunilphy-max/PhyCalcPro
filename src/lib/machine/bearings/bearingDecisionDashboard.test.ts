import { describe, expect, it } from "vitest";
import {
  buildBearingDecisionDashboard,
  buildOperatingEnvelope,
  reliabilityLifeCurve,
  reliabilityPercentFromA1,
} from "./bearingDecisionDashboard";
import type { BearingResult } from "./types";

function baseResult(overrides: Partial<BearingResult> = {}): BearingResult {
  return {
    radialLoad: 4500,
    axialLoad: 1200,
    equivalentLoad: 5100,
    staticEquivalentLoad: 4800,
    requiredDynamicRating: 60000,
    requiredStaticRating: 10000,
    expectedLife: 25000,
    modifiedLife: 42000,
    expectedLifeRevolutions: 1e9,
    dynamicLoadRatingN: 70000,
    staticLoadRatingN: 36000,
    limitingSpeedRpm: 12000,
    lifeExponent: 3,
    a1: 0.62,
    aIso: 1.2,
    modifiedLifeFactors: {
      kappa: 1.4,
      nuCst: 68,
      nu1Cst: 48,
      eC: 0.5,
      puOverP: 0.05,
      aIso: 1.2,
      fatigueLoadLimitN: 1750,
    },
    dynamicUtilization: 0.68,
    staticSafetyFactor: 2.4,
    speedMargin: 2.5,
    referenceSpeedMargin: 2.0,
    lifeUtilization: 20000 / 42000,
    safetyFactor: 1.5,
    bearingType: "deep_groove",
    designation: "6308",
    geometry: { boreMm: 40, outerDiameterMm: 90, widthMm: 23 },
    designStatus: "safe",
    isSafe: true,
    governingFailureMode: "All checks pass",
    material: {
      name: "Steel",
      dynamicRatingFactor: 1,
      staticRatingFactor: 1,
      allowableLife: 10000,
    },
    arrangement: "single",
    minimumRadialLoadN: 100,
    minLoadSatisfied: true,
    frictionTorqueNm: 0.1,
    powerLossW: 20,
    temperatureDeratingFactor: 1,
    lifeMethod: "iso281",
    lifeSafetyFactor: 42000 / 20000,
    ...overrides,
  };
}

describe("bearingDecisionDashboard", () => {
  it("builds status strip metrics with green life / utilization", () => {
    const dash = buildBearingDecisionDashboard(baseResult());
    expect(dash.metrics).toHaveLength(8);
    expect(dash.meetsTargetLife).toBe(true);
    expect(dash.metrics.find((m) => m.id === "life")?.tone).toBe("safe");
    expect(dash.metrics.find((m) => m.id === "dyn")?.value).toContain("68%");
    expect(dash.governingLimitation).toBe("All checks pass");
    expect(dash.limitingMargin).toBeGreaterThan(1);
  });

  it("flags life fail and recommends a lever", () => {
    const dash = buildBearingDecisionDashboard(
      baseResult({
        modifiedLife: 8000,
        lifeUtilization: 2.5,
        lifeSafetyFactor: 0.4,
        designStatus: "critical",
        governingFailureMode: "Modified rating life Lnm",
        modifiedLifeFactors: {
          kappa: 0.3,
          nuCst: 10,
          nu1Cst: 40,
          eC: 0.3,
          puOverP: 0.02,
          aIso: 0.4,
          fatigueLoadLimitN: 1000,
        },
        aIso: 0.4,
      })
    );
    expect(dash.meetsTargetLife).toBe(false);
    expect(dash.bestLever).toBe("better_lubrication");
    expect(dash.bestLeverAnswer.toLowerCase()).toContain("κ");
  });

  it("maps a1 to reliability percent", () => {
    expect(reliabilityPercentFromA1(1)).toBe(90);
    expect(reliabilityPercentFromA1(0.62)).toBe(95);
  });

  it("builds reliability vs life curve", () => {
    const curve = reliabilityLifeCurve(baseResult());
    expect(curve.reliabilityPercent.length).toBeGreaterThan(3);
    expect(curve.lifeHours[0]).toBeGreaterThan(curve.lifeHours[curve.lifeHours.length - 1]!);
  });

  it("builds Fr/Fa envelope with duty capacity", () => {
    const env = buildOperatingEnvelope(baseResult());
    expect(env.frN.length).toBeGreaterThan(5);
    expect(env.allowPN).toBeGreaterThan(0);
  });
});

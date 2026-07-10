import { describe, expect, it } from "vitest";
import {
  calculateSkfRatingLife,
  skfRatingLifeHours,
  skfRatingLifeMillionRevolutions,
} from "./skfRatingLife";

describe("SKF rating life (Product Select alignment)", () => {
  it("matches Lnm = a1·aSKF·(C/P)^p for ball bearing", () => {
    const lnm = skfRatingLifeMillionRevolutions({
      a1: 1,
      aSkf: 1,
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      lifeExponent: 3,
    });
    // (14/5)^3 = 21.952
    expect(lnm).toBeCloseTo(21.952, 2);
  });

  it("converts Lnm to hours per SKF formula Lnmh = 10^6·Lnm/(60·n)", () => {
    const hours = skfRatingLifeHours(21.952, 1500);
    // 21.952e6 / (60*1500) ≈ 243.9 h
    expect(hours).toBeCloseTo(243.9, 0);
  });

  it("reduces modified life when κ is low and contamination is high", () => {
    const good = calculateSkfRatingLife({
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      kinematicViscosityCst: 80,
      meanDiameterMm: 38.5,
      contamination: "high_clean",
    });
    const poor = calculateSkfRatingLife({
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      kinematicViscosityCst: 3,
      meanDiameterMm: 38.5,
      contamination: "heavy_contamination",
    });
    expect(poor.aSkf).toBeLessThan(good.aSkf);
    expect(poor.lnmHours).toBeLessThan(good.lnmHours);
    expect(poor.lnmHours).toBeLessThan(poor.basicL10Hours);
  });

  it("returns basic L10 when lubrication inputs omitted (aSKF = 1)", () => {
    const res = calculateSkfRatingLife({
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      meanDiameterMm: 38.5,
    });
    expect(res.aSkf).toBe(1);
    expect(res.lnmHours).toBeCloseTo(res.basicL10Hours, 6);
  });

  it("uses roller exponent 10/3 for tapered roller", () => {
    const ball = skfRatingLifeMillionRevolutions({
      a1: 1,
      aSkf: 1,
      dynamicRatingN: 58000,
      equivalentLoadN: 20000,
      lifeExponent: 3,
    });
    const roller = skfRatingLifeMillionRevolutions({
      a1: 1,
      aSkf: 1,
      dynamicRatingN: 58000,
      equivalentLoadN: 20000,
      lifeExponent: 10 / 3,
    });
    expect(roller).toBeGreaterThan(ball);
  });
});

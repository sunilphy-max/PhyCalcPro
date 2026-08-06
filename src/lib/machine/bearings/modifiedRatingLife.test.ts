import { describe, expect, it } from "vitest";
import {
  calculateModifiedRatingLife,
  modifiedRatingLifeHours,
  modifiedRatingLifeMillionRevolutions,
} from "./modifiedRatingLife";

describe("PhyCalcPro modified rating life (ISO 281)", () => {
  it("matches Lnm = a1·aISO·(C/P)^p for ball bearing", () => {
    const lnm = modifiedRatingLifeMillionRevolutions({
      a1: 1,
      aIso: 1,
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      lifeExponent: 3,
    });
    expect(lnm).toBeCloseTo(21.952, 3);
  });

  it("converts Lnm to hours per Lnmh = 10^6·Lnm/(60·n)", () => {
    const hours = modifiedRatingLifeHours(21.952, 1500);
    expect(hours).toBeCloseTo(243.911, 2);
  });

  it("reduces aISO when lubrication / contamination is harsh", () => {
    const good = calculateModifiedRatingLife({
      dynamicRatingN: 28000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      kinematicViscosityCst: 100,
      meanDiameterMm: 52.5,
      contamination: "high_clean",
    });
    const poor = calculateModifiedRatingLife({
      dynamicRatingN: 28000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      kinematicViscosityCst: 10,
      meanDiameterMm: 52.5,
      contamination: "heavy_contamination",
    });
    expect(poor.aIso).toBeLessThan(good.aIso);
    expect(poor.lnmHours).toBeLessThan(good.lnmHours);
  });

  it("returns basic L10 when lubrication inputs omitted (aISO = 1)", () => {
    const res = calculateModifiedRatingLife({
      dynamicRatingN: 14000,
      equivalentLoadN: 5000,
      speedRpm: 1500,
      a1: 1,
      bearingType: "deep_groove",
      meanDiameterMm: 52.5,
    });
    expect(res.aIso).toBe(1);
    expect(res.lnmHours).toBeCloseTo(res.basicL10Hours, 5);
  });

  it("uses higher life exponent for roller bearings", () => {
    const ball = modifiedRatingLifeMillionRevolutions({
      a1: 1,
      aIso: 1,
      dynamicRatingN: 10000,
      equivalentLoadN: 5000,
      lifeExponent: 3,
    });
    const roller = modifiedRatingLifeMillionRevolutions({
      a1: 1,
      aIso: 1,
      dynamicRatingN: 10000,
      equivalentLoadN: 5000,
      lifeExponent: 10 / 3,
    });
    expect(roller).toBeGreaterThan(ball);
  });
});

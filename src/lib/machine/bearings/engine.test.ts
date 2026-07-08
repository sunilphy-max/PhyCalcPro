import { describe, expect, it } from "vitest";
import { solveBearingEngine } from "./engine";
import { calculateBearingEquivalentLoad } from "./solver";
import { calculateStaticEquivalentLoad as p0 } from "./staticLoad";
import { rankCatalogBearings } from "./catalogSelection";

const LEGACY_MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 35000,
  staticRatingFactor: 15000,
  allowableLife: 10000,
};

describe("bearing ISO 281 regression", () => {
  it("matches indicative benchmark for required C", () => {
    const res = solveBearingEngine({
      radialLoad: 6200,
      axialLoad: 0,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1.5,
      bearingType: "deep_groove",
      material: { ...LEGACY_MATERIAL, dynamicRatingFactor: 1, staticRatingFactor: 1 },
      dynamicLoadRatingN: 35000,
      staticLoadRatingN: 15000,
    });
    expect(res.equivalentLoad).toBeCloseTo(6200, 0);
    expect(res.requiredDynamicRating).toBeCloseTo(113_129, -2);
  });

  it("applies X/Y when Fa/Fr exceeds e", () => {
    const P = calculateBearingEquivalentLoad({
      radialLoad: 5000,
      axialLoad: 2000,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1,
      bearingType: "deep_groove",
      material: LEGACY_MATERIAL,
    });
    expect(P).toBeGreaterThan(5000);
  });

  it("computes static safety from catalog C0", () => {
    const res = solveBearingEngine({
      radialLoad: 6200,
      axialLoad: 500,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1.5,
      bearingType: "deep_groove",
      designation: "6205",
      material: LEGACY_MATERIAL,
    });
    expect(res.staticSafetyFactor).toBeGreaterThan(1);
    expect(res.staticLoadRatingN).toBe(7800);
  });

  it("flags speed margin when operating above catalog limit", () => {
    const res = solveBearingEngine({
      radialLoad: 2000,
      axialLoad: 0,
      speed: 15000,
      lifeHours: 10000,
      safetyFactor: 1,
      bearingType: "deep_groove",
      designation: "6205",
      material: LEGACY_MATERIAL,
    });
    expect(res.speedMargin).not.toBeNull();
    expect(res.speedMargin!).toBeLessThan(1);
    expect(res.isSafe).toBe(false);
  });

  it("ranks catalog bearings by dynamic utilization", () => {
    const ranked = rankCatalogBearings({
      bearingType: "deep_groove",
      requiredDynamicRatingN: 20000,
      speedRpm: 1500,
      manufacturer: "SKF",
    });
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every((r) => r.entry.manufacturer === "SKF")).toBe(true);
    expect(ranked[0]!.dynamicUtilization).toBeLessThanOrEqual(
      ranked[1]?.dynamicUtilization ?? Infinity
    );
  });

  it("filters catalog ranking by manufacturer", () => {
    const skf = rankCatalogBearings({
      bearingType: "deep_groove",
      requiredDynamicRatingN: 14800,
      speedRpm: 1200,
      manufacturer: "SKF",
    });
    const nsk = rankCatalogBearings({
      bearingType: "deep_groove",
      requiredDynamicRatingN: 14800,
      speedRpm: 1200,
      manufacturer: "NSK",
    });
    expect(skf.every((r) => r.entry.manufacturer === "SKF")).toBe(true);
    expect(nsk.every((r) => r.entry.manufacturer === "NSK")).toBe(true);
    expect(skf.some((r) => r.entry.designation === "6205")).toBe(true);
    expect(nsk.some((r) => r.entry.designation === "NSK 6205")).toBe(true);
  });
});

describe("ISO 76 static load", () => {
  it("P0 = Fr when Fa/Fr is low", () => {
    expect(p0(5000, 100, "deep_groove")).toBe(5000);
  });
});

import { describe, expect, it } from "vitest";
import {
  A1_BY_RELIABILITY,
  explainEquivalentLoad,
  solveBearingLifeTool,
} from "./bearingLifeTool";

describe("explainEquivalentLoad", () => {
  it("uses Fr when Fa/Fr ≤ e for deep groove", () => {
    const out = explainEquivalentLoad(5000, 1000, "deep_groove", { X: 0.56, Y: 1.6, e: 0.3 });
    expect(out.regime).toBe("Fr");
    expect(out.P).toBeCloseTo(5000);
    expect(out.notes.some((n) => n.includes("Fa/Fr"))).toBe(true);
  });

  it("uses X·Fr + Y·Fa when Fa/Fr > e", () => {
    const out = explainEquivalentLoad(5000, 2500, "deep_groove", { X: 0.56, Y: 1.6, e: 0.3 });
    expect(out.regime).toBe("XFr+YFa");
    expect(out.P).toBeCloseTo(0.56 * 5000 + 1.6 * 2500);
  });

  it("uses Fa for thrust bearings", () => {
    const out = explainEquivalentLoad(1000, 8000, "thrust_ball");
    expect(out.regime).toBe("thrust");
    expect(out.P).toBeCloseTo(8000);
  });
});

describe("solveBearingLifeTool", () => {
  it("returns L10 and Lnm hours with a1 for 90% reliability", () => {
    const result = solveBearingLifeTool({
      bearingType: "deep_groove",
      dynamicRatingN: 14000,
      staticRatingN: 7800,
      radialLoadN: 2000,
      axialLoadN: 500,
      speedRpm: 1800,
      reliabilityPercent: 90,
      meanDiameterMm: 32.5,
      kinematicViscosityCst: 68,
      contamination: "normal_clean",
    });

    expect(A1_BY_RELIABILITY[90]).toBe(1);
    expect(result.a1).toBe(1);
    expect(result.equivalentLoadN).toBeGreaterThan(0);
    expect(result.basicLifeHours).toBeGreaterThan(0);
    expect(result.modifiedLifeHours).toBeGreaterThan(0);
    expect(result.dynamicUtilization).toBeGreaterThan(0);
    expect(result.staticSafetyFactor).not.toBeNull();
  });

  it("reduces life at 99% reliability via a1", () => {
    const base = {
      bearingType: "deep_groove" as const,
      dynamicRatingN: 28000,
      radialLoadN: 3000,
      axialLoadN: 0,
      speedRpm: 1500,
      meanDiameterMm: 40,
      kinematicViscosityCst: 100,
      contamination: "normal_clean" as const,
    };
    const at90 = solveBearingLifeTool({ ...base, reliabilityPercent: 90 });
    const at99 = solveBearingLifeTool({ ...base, reliabilityPercent: 99 });
    expect(at99.a1).toBeLessThan(at90.a1);
    expect(at99.basicLifeHours).toBeLessThan(at90.basicLifeHours);
  });
});

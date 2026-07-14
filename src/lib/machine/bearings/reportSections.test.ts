import { describe, expect, it } from "vitest";
import { solveBearingEngine } from "./engine";
import { buildBearingReportSections } from "./reportSections";

describe("buildBearingReportSections", () => {
  it("emits design summary, ISO 281 factors, and recommendation", () => {
    const result = solveBearingEngine({
      radialLoad: 2000,
      axialLoad: 200,
      speed: 1800,
      lifeHours: 20000,
      safetyFactor: 1.5,
      bearingType: "deep_groove",
      designation: "6205",
      dynamicLoadRatingN: 14000,
      staticLoadRatingN: 7800,
      limitingSpeedRpm: 15000,
      boreMm: 25,
      outerDiameterMm: 52,
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      material: {
        name: "Bearing steel",
        dynamicRatingFactor: 1,
        staticRatingFactor: 1,
        allowableLife: 1e6,
      },
    });

    const sections = buildBearingReportSections(result, {
      summary: "6205 preferred",
      narrative: "Deep groove selected for life and cost.",
      reasons: ["Life SF adequate", "Cost Low"],
      costBand: "Low",
    });
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("design_summary");
    expect(ids).toContain("domain_factors");
    expect(ids).toContain("recommendation");
    const iso = sections.find((s) => s.id === "domain_factors");
    expect(iso?.rows.some((r) => String(r.parameter).includes("aSKF"))).toBe(true);
  });
});

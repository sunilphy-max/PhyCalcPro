import { describe, expect, it } from "vitest";
import {
  bearingCatalog,
  bearingsOfType,
  bearingsOfUnitSystem,
  findBearing,
  isRollerBearingType,
  isThrustBearingType,
} from "@/data/catalogs/bearingCatalog";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";

describe("bearing catalog datasheet expansion", () => {
  it("stores datasheet Pu on every catalog entry", () => {
    expect(bearingCatalog.length).toBeGreaterThan(500);
    expect(bearingCatalog.every((e) => e.fatigueLoadLimitN != null && e.fatigueLoadLimitN > 0)).toBe(
      true
    );
    const withDatasheet = bearingCatalog.filter((e) => e.fatigueLoadLimitFromDatasheet);
    expect(withDatasheet.length).toBeGreaterThan(100);
  });

  it("includes toroidal, thrust roller, and deeper needle families", () => {
    expect(bearingsOfType("toroidal_roller").length).toBeGreaterThan(0);
    expect(bearingsOfType("thrust_cylindrical_roller").length).toBeGreaterThan(0);
    expect(bearingsOfType("thrust_spherical_roller").length).toBeGreaterThan(0);
    expect(bearingsOfType("needle_roller").length).toBeGreaterThanOrEqual(15);
  });

  it("includes a dedicated inch catalog (MITCalc Module II class)", () => {
    const inch = bearingsOfUnitSystem("inch");
    expect(inch.length).toBeGreaterThanOrEqual(10);
    expect(inch.some((e) => e.series === "R")).toBe(true);
    expect(inch.some((e) => e.series === "LM" || e.series === "HM")).toBe(true);
    expect(inch.every((e) => e.boreIn != null)).toBe(true);
    expect(findBearing("R 4")?.unitSystem).toBe("inch");
    expect(findBearing("R 4")?.fatigueLoadLimitFromDatasheet).toBe(true);
  });

  it("wires catalog Pu into aISO via the engine", () => {
    const entry = findBearing("6205");
    expect(entry?.fatigueLoadLimitN).toBeDefined();
    expect(entry?.fatigueLoadLimitFromDatasheet).toBe(true);

    const result = solveBearingEngine({
      radialLoad: 3000,
      axialLoad: 500,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1.5,
      bearingType: "deep_groove",
      designation: entry!.designation,
      material: { name: "", dynamicRatingFactor: 1, staticRatingFactor: 1, allowableLife: 1 },
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
    });

    expect(result.modifiedLifeFactors?.fatigueLoadLimitN).toBe(entry!.fatigueLoadLimitN);
  });

  it("classifies roller vs thrust helpers correctly", () => {
    expect(isRollerBearingType("thrust_ball")).toBe(false);
    expect(isRollerBearingType("thrust_cylindrical_roller")).toBe(true);
    expect(isThrustBearingType("thrust_spherical_roller")).toBe(true);
    expect(isThrustBearingType("deep_groove")).toBe(false);
  });
});

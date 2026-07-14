import { describe, expect, it } from "vitest";
import {
  ANGULAR_CONTACT_FA_FR_THRESHOLD,
  costBandFromIndex,
  explainBearingRecommendation,
} from "./recommendationAdvisor";
import type { RankedBearing } from "./catalogSelection";
import type { BearingCatalogEntry } from "@/data/catalogs/bearingCatalog";

const MATERIAL_RESULT = {
  bearingType: "deep_groove" as const,
  modifiedLife: 48000,
  expectedLife: 20000,
  lifeUtilization: 0.42,
  lifeSafetyFactor: 2.4,
  designStatus: "safe" as const,
  staticSafetyFactor: 2.8,
  dynamicUtilization: 0.55,
  speedMargin: 1.8,
  designation: "6206-2RS1",
};

function makeEntry(partial: Partial<BearingCatalogEntry> & Pick<BearingCatalogEntry, "designation" | "manufacturer">): BearingCatalogEntry {
  return {
    type: "deep_groove",
    boreMm: 30,
    outerDiameterMm: 62,
    widthMm: 16,
    dynamicRatingN: 19500,
    staticRatingN: 11200,
    limitingSpeedRpm: 11000,
    sealType: "sealed",
    clearance: "CN",
    series: "62",
    costIndex: 1.05,
    ...partial,
  } as BearingCatalogEntry;
}

function ranked(entry: BearingCatalogEntry, util = 0.55): RankedBearing {
  return {
    entry,
    dynamicUtilization: util,
    staticUtilization: 0.35,
    speedMargin: 1.8,
    passes: true,
  };
}

describe("recommendationAdvisor", () => {
  it("maps cost index to Low / Medium / High bands", () => {
    expect(costBandFromIndex(1.0)).toBe("Low");
    expect(costBandFromIndex(1.15)).toBe("Medium");
    expect(costBandFromIndex(1.4)).toBe("High");
  });

  it("explains deep groove + sealed pick for low Fa/Fr and contamination", () => {
    const primary = ranked(
      makeEntry({ designation: "6206-2RS1", manufacturer: "SKF", sealType: "sealed", costIndex: 1.05 })
    );
    const alt = ranked(
      makeEntry({
        designation: "6206DDU",
        manufacturer: "NSK",
        sealType: "sealed",
        costIndex: 1.12,
      }),
      0.58
    );

    const advisor = explainBearingRecommendation({
      primary,
      alternatives: [alt],
      result: MATERIAL_RESULT,
      radialLoadN: 5000,
      axialLoadN: 800,
      requiredLifeHours: 20000,
      contamination: "typical_contamination",
      preferredManufacturer: "SKF",
    });

    expect(advisor.costBand).toBe("Low");
    expect(advisor.narrative.toLowerCase()).toContain("deep groove");
    expect(advisor.narrative.toLowerCase()).toMatch(/axial load ratio|fa\/fr/);
    expect(advisor.narrative.toLowerCase()).toContain("sealed");
    expect(advisor.narrative).toMatch(/2\.4/);
    expect(advisor.reasons.some((r) => r.includes("Fa/Fr"))).toBe(true);
    expect(advisor.alternativeNotes[0]?.designation).toBe("6206DDU");
    expect(5000 > 0 && 800 / 5000 < ANGULAR_CONTACT_FA_FR_THRESHOLD).toBe(true);
  });

  it("flags elevated Fa/Fr on deep groove", () => {
    const primary = ranked(
      makeEntry({ designation: "6208", manufacturer: "SKF", sealType: "open", costIndex: 1.0 })
    );
    const advisor = explainBearingRecommendation({
      primary,
      alternatives: [],
      result: { ...MATERIAL_RESULT, designation: "6208", modifiedLife: 25000, lifeSafetyFactor: 1.2 },
      radialLoadN: 4000,
      axialLoadN: 2000,
      requiredLifeHours: 20000,
      contamination: "high_clean",
    });
    expect(advisor.narrative.toLowerCase()).toMatch(/angular-contact|threshold/);
  });
});

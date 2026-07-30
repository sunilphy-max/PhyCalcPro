import { describe, expect, it } from "vitest";
import { geometricBonus, materialBoundaries, worstCaseBonusSize } from "./bonus";
import { solveGdtStackEngine } from "./engine";
import type { GdtStackConfig } from "./types";
import { parseIsoFitDesignation, validateDrawingExtract } from "./schema";

describe("GD&T bonus", () => {
  it("computes MMC/LMC boundaries for internal vs external features", () => {
    const hole = {
      id: "h1",
      nominal: 0.01,
      upperLimit: 0.0101,
      lowerLimit: 0.01,
      isInternal: true,
    };
    const pin = {
      id: "p1",
      nominal: 0.01,
      upperLimit: 0.01,
      lowerLimit: 0.0099,
      isInternal: false,
    };
    expect(materialBoundaries(hole)).toEqual({ mmc: 0.01, lmc: 0.0101 });
    expect(materialBoundaries(pin)).toEqual({ mmc: 0.01, lmc: 0.0099 });
  });

  it("gives max MMC bonus at LMC", () => {
    const hole = {
      id: "h1",
      nominal: 0.01,
      upperLimit: 0.0101,
      lowerLimit: 0.01,
      isInternal: true,
    };
    const atLmc = worstCaseBonusSize(hole, "MMC");
    expect(atLmc).toBe(0.0101);
    expect(geometricBonus(hole, "MMC", atLmc)).toBeCloseTo(0.0001, 12);
    expect(geometricBonus(hole, "RFS", atLmc)).toBe(0);
  });
});

describe("solveGdtStackEngine", () => {
  it("applies position@MMC worst-case bonus to half-zone", () => {
    const config: GdtStackConfig = {
      features: [
        {
          id: "hole1",
          nominal: 0.01,
          upperLimit: 0.0101,
          lowerLimit: 0.01,
          isInternal: true,
        },
      ],
      frames: [
        {
          id: "fcf1",
          characteristic: "position",
          zoneValue: 0.00005,
          isDiameterZone: true,
          materialCondition: "MMC",
          datumRefs: [{ datumId: "A" }],
          featureOfSizeId: "hole1",
        },
      ],
      datums: [{ id: "A", type: "plane" }],
      contributors: [
        {
          id: "c1",
          sense: 1,
          axis: "X",
          source: { kind: "fcf", fcfId: "fcf1" },
        },
      ],
      useWorstCaseBonus: true,
      monteCarloSamples: 0,
    };
    // zone 0.05mm + bonus 0.1mm = 0.15mm → half = 0.075mm = 7.5e-5 m
    const res = solveGdtStackEngine(config);
    expect(res.contributors[0]!.specifiedTolerance).toBeCloseTo(0.000025, 12);
    expect(res.contributors[0]!.effectiveTolerance).toBeCloseTo(0.000075, 12);
    expect(res.worstCase).toBeCloseTo(0.000075, 12);
    expect(res.rss).toBeCloseTo(0.000075, 12);
  });

  it("sums size + RFS position for WC/RSS", () => {
    const config: GdtStackConfig = {
      features: [
        {
          id: "len1",
          nominal: 0.02,
          upperLimit: 0.02005,
          lowerLimit: 0.01995,
          isInternal: false,
        },
      ],
      frames: [
        {
          id: "fcf1",
          characteristic: "position",
          zoneValue: 0.0001,
          materialCondition: "RFS",
          datumRefs: [{ datumId: "A" }],
        },
      ],
      datums: [{ id: "A", type: "plane" }],
      contributors: [
        {
          id: "c1",
          sense: 1,
          axis: "X",
          source: { kind: "size", featureOfSizeId: "len1" },
        },
        {
          id: "c2",
          sense: 1,
          axis: "X",
          source: { kind: "fcf", fcfId: "fcf1" },
        },
      ],
    };
    const res = solveGdtStackEngine(config);
    expect(res.worstCase).toBeCloseTo(0.0001, 12);
    expect(res.rss).toBeCloseTo(Math.SQRT1_2 * 0.0001, 10);
  });

  it("includes datum shift at MMC", () => {
    const config: GdtStackConfig = {
      features: [
        {
          id: "datumHole",
          nominal: 0.01,
          upperLimit: 0.0102,
          lowerLimit: 0.01,
          isInternal: true,
        },
      ],
      frames: [
        {
          id: "fcf1",
          characteristic: "position",
          zoneValue: 0.0001,
          materialCondition: "RFS",
          datumRefs: [{ datumId: "B", materialCondition: "MMC" }],
        },
      ],
      datums: [
        { id: "A", type: "plane" },
        { id: "B", type: "axis" },
      ],
      contributors: [
        {
          id: "c1",
          sense: 1,
          axis: "X",
          source: { kind: "fcf", fcfId: "fcf1" },
        },
        {
          id: "c2",
          sense: 1,
          axis: "X",
          source: {
            kind: "datumShift",
            datumId: "B",
            featureOfSizeId: "datumHole",
          },
        },
      ],
    };
    const res = solveGdtStackEngine(config);
    // half position 0.00005 + full size tol datum shift 0.0002
    expect(res.worstCase).toBeCloseTo(0.00025, 12);
  });
});

describe("schema helpers", () => {
  it("parses ISO fit designations", () => {
    expect(parseIsoFitDesignation("H7/g6")).toEqual({
      holeLetter: "H",
      holeGrade: 7,
      shaftLetter: "g",
      shaftGrade: 6,
    });
    expect(parseIsoFitDesignation("F8")).toEqual({
      holeLetter: "F",
      holeGrade: 8,
    });
  });

  it("validates drawing extract JSON", () => {
    const extract = validateDrawingExtract({
      fitCallouts: [{ id: "1", nominal: 0.05, designation: "H7/g6" }],
      dimensions: [{ id: "d1", nominal: 0.1, upperDeviation: 0.001, lowerDeviation: -0.001 }],
    });
    expect(extract.fitCallouts[0]?.holeLetter).toBe("H");
    expect(extract.fitCallouts[0]?.shaftLetter).toBe("g");
    expect(extract.dimensions).toHaveLength(1);
  });
});

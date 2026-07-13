import { describe, expect, it } from "vitest";
import { calculateDefectFrequencies } from "./defectFrequencies";
import { calculateGreaseService } from "./greaseLife";
import { calculateAdjustedReferenceSpeed } from "./adjustedReferenceSpeed";
import { calculateEnergyCo2 } from "./energyCo2";
import { buildMountedBom } from "@/lib/machine/housing/mountedBom";
import { HOUSING_CATALOG, housingsForBoreMm } from "@/data/catalogs/housing";

describe("defectFrequencies", () => {
  it("computes BPFO/BPFI/BSF/FTF with BPFI > BPFO", () => {
    const r = calculateDefectFrequencies({
      speedRpm: 1800,
      bearingType: "deep_groove",
      boreMm: 25,
      outerDiameterMm: 52,
    });
    expect(r.shaftHz).toBeCloseTo(30, 5);
    expect(r.bpfiHz).toBeGreaterThan(r.bpfoHz);
    expect(r.ftfHz).toBeLessThan(r.shaftHz);
    expect(r.bsfHz).toBeGreaterThan(0);
    expect(r.rollingElementCount).toBeGreaterThan(5);
  });
});

describe("greaseLife", () => {
  it("separates sealed grease life from open relubrication", () => {
    const sealed = calculateGreaseService({
      speedRpm: 1500,
      meanDiameterMm: 38.5,
      operatingTempC: 70,
      dynamicUtilization: 0.2,
      bearingType: "deep_groove",
      lubricantType: "grease",
      sealed: true,
      contamination: "normal_clean",
    });
    const open = calculateGreaseService({
      speedRpm: 1500,
      meanDiameterMm: 38.5,
      operatingTempC: 70,
      dynamicUtilization: 0.2,
      bearingType: "deep_groove",
      lubricantType: "grease",
      sealed: false,
      contamination: "normal_clean",
    });
    expect(sealed.mode).toBe("grease_life");
    expect(sealed.greaseLifeHours).toBeGreaterThan(0);
    expect(open.mode).toBe("relubrication");
    expect(open.relubricationIntervalHours).toBeGreaterThan(0);
    expect(sealed.greaseLifeHours!).toBeGreaterThan(open.relubricationIntervalHours!);
  });
});

describe("adjustedReferenceSpeed", () => {
  it("reduces n_adj under heavy load vs light load", () => {
    const light = calculateAdjustedReferenceSpeed({
      speedRpm: 1500,
      referenceSpeedRpm: 12000,
      dynamicUtilization: 0.05,
      lubricantType: "oil",
      kappa: 2,
    });
    const heavy = calculateAdjustedReferenceSpeed({
      speedRpm: 1500,
      referenceSpeedRpm: 12000,
      dynamicUtilization: 0.3,
      lubricantType: "grease",
      sealed: true,
      kappa: 0.4,
    });
    expect(heavy.nAdjRpm).toBeLessThan(light.nAdjRpm);
    expect(light.nAdjMargin).toBeGreaterThan(1);
  });
});

describe("energyCo2", () => {
  it("scales CO2 with power and hours", () => {
    const r = calculateEnergyCo2({ powerLossW: 100, operatingHoursPerYear: 6000 });
    expect(r.annualEnergyKwh).toBeCloseTo(600, 5);
    expect(r.annualCo2Kg).toBeCloseTo(600 * 0.45, 5);
  });
});

describe("housing catalog + mounted BOM", () => {
  it("has SNL/UCP/FY/SAF screening SKUs", () => {
    expect(HOUSING_CATALOG.length).toBeGreaterThanOrEqual(15);
    expect(housingsForBoreMm(50).length).toBeGreaterThan(0);
  });

  it("builds BOM with bearing housing seal grease", () => {
    const bom = buildMountedBom({
      boreMm: 50,
      bearingDesignation: "6205",
      housingSku: "SNL 50",
      seal: "labyrinth",
    });
    expect(bom).not.toBeNull();
    expect(bom!.lines.some((l) => l.kind === "bearing")).toBe(true);
    expect(bom!.lines.some((l) => l.kind === "housing")).toBe(true);
    expect(bom!.lines.some((l) => l.kind === "seal")).toBe(true);
    expect(bom!.lines.some((l) => l.kind === "grease")).toBe(true);
  });
});

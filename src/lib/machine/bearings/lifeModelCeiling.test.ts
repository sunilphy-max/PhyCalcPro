import { describe, expect, it } from "vitest";
import { calculateMisalignmentFactors } from "./misalignmentFactors";
import { calculateIso16281Screen, clearanceLoadFactor } from "./iso16281Screen";
import { calculateStressLifeFactor } from "./stressLifeScreen";
import { hybridCeramicFactors } from "./hybridCeramic";
import { resolveLifeModelCeiling } from "./advancedLife";
import { solveBearingDesign } from "./solver";
import { normalizeHandoffParams } from "@/lib/design-workflows/handoffParamRegistry";

const BASE_MATERIAL = {
  name: "steel",
  dynamicRatingFactor: 14800,
  staticRatingFactor: 7800,
  allowableLife: 20000,
};

describe("misalignmentFactors", () => {
  it("self-aligning tolerates larger angles than deep groove", () => {
    const sa = calculateMisalignmentFactors({
      bearingType: "self_aligning_ball",
      misalignmentAngleMrad: 10,
    });
    const dg = calculateMisalignmentFactors({
      bearingType: "deep_groove",
      misalignmentAngleMrad: 10,
    });
    expect(sa.capacityMrad).toBeGreaterThan(dg.capacityMrad);
    expect(dg.aMis).toBeLessThan(sa.aMis);
  });

  it("takes max of manual and station slopes", () => {
    const r = calculateMisalignmentFactors({
      bearingType: "deep_groove",
      misalignmentAngleMrad: 1,
      stationSlopesMrad: [0.5, 3],
    });
    expect(r.angleMrad).toBe(3);
  });
});

describe("iso16281Screen", () => {
  it("tight clearance increases f_clearance", () => {
    expect(clearanceLoadFactor(2, 25)).toBeGreaterThan(clearanceLoadFactor(20, 25));
  });

  it("raises P under misalignment vs base ISO 281 P", () => {
    const screen = calculateIso16281Screen({
      bearingType: "deep_groove",
      equivalentLoadN: 5000,
      radialLoadN: 5000,
      axialLoadN: 500,
      boreMm: 25,
      speedRpm: 1500,
      clearance: "C2",
      misalignmentAngleMrad: 5,
    });
    expect(screen.PadjN).toBeGreaterThan(screen.PbaseN);
    expect(screen.fMisalign).toBeGreaterThan(1);
  });
});

describe("stressLifeScreen", () => {
  it("reduces a_stress at high pressure / poor film vs good conditions", () => {
    const poor = calculateStressLifeFactor({
      bearingType: "deep_groove",
      equivalentLoadN: 12000,
      dynamicRatingN: 14800,
      meanDiameterMm: 38.5,
      kappa: 0.3,
      eC: 0.1,
      puOverP: 0.05,
    });
    const good = calculateStressLifeFactor({
      bearingType: "deep_groove",
      equivalentLoadN: 2000,
      dynamicRatingN: 14800,
      meanDiameterMm: 38.5,
      kappa: 3,
      eC: 0.8,
      puOverP: 1,
    });
    expect(poor.aStress).toBeLessThan(good.aStress);
    expect(poor.note.toLowerCase()).toContain("not skf gblm");
  });
});

describe("hybridCeramic", () => {
  it("hybrid raises life and speed factors vs steel", () => {
    const steel = hybridCeramicFactors("steel");
    const hybrid = hybridCeramicFactors("hybrid_ceramic");
    expect(hybrid.lifeFactor).toBeGreaterThan(steel.lifeFactor);
    expect(hybrid.speedFactor).toBeGreaterThan(steel.speedFactor);
  });
});

describe("life model ceiling integration", () => {
  const baseConfig = {
    radialLoad: 3000,
    axialLoad: 500,
    speed: 1500,
    lifeHours: 20000,
    safetyFactor: 1.5,
    bearingType: "deep_groove" as const,
    dynamicLoadRatingN: 14800,
    staticLoadRatingN: 7800,
    fatigueLoadLimitN: 335,
    boreMm: 25,
    outerDiameterMm: 52,
    lubricantType: "oil" as const,
    isoVgGrade: 68,
    operatingTempC: 70,
    contamination: "normal_clean" as const,
    material: BASE_MATERIAL,
  };

  it("ISO 16281 screen reduces Lnm vs ISO 281 under tilt", () => {
    const iso281 = solveBearingDesign({ ...baseConfig, lifeMethod: "iso281" });
    const screen = solveBearingDesign({
      ...baseConfig,
      lifeMethod: "iso16281_screen",
      misalignmentAngleMrad: 6,
      clearance: "C2",
    });
    expect(screen.equivalentLoad).toBeGreaterThan(iso281.equivalentLoad);
    expect(screen.modifiedLife).toBeLessThan(iso281.modifiedLife);
    expect(screen.lifeMethod).toBe("iso16281_screen");
    expect(screen.advancedLifeFactors?.fMisalign).toBeGreaterThan(1);
  });

  it("stress-life screen can reduce Lnm vs ISO 281 at high P/C", () => {
    const heavy = {
      ...baseConfig,
      radialLoad: 10000,
      axialLoad: 2000,
    };
    const iso281 = solveBearingDesign({ ...heavy, lifeMethod: "iso281" });
    const stress = solveBearingDesign({ ...heavy, lifeMethod: "stress_life_screen" });
    expect(stress.advancedLifeFactors?.aStress).toBeLessThan(1.2);
    expect(stress.modifiedLife).toBeLessThanOrEqual(iso281.modifiedLife * 1.01);
    expect(stress.advancedLifeFactors?.note.toLowerCase()).toContain("not skf gblm");
  });

  it("hybrid ceramic increases Lnm vs steel baseline", () => {
    const steel = solveBearingDesign({
      ...baseConfig,
      rollingElementMaterial: "steel",
    });
    const hybrid = solveBearingDesign({
      ...baseConfig,
      rollingElementMaterial: "hybrid_ceramic",
    });
    expect(hybrid.modifiedLife).toBeGreaterThan(steel.modifiedLife);
    expect(hybrid.advancedLifeFactors?.hybridLifeFactor).toBeGreaterThan(1);
  });

  it("resolveLifeModelCeiling defaults to iso281 with aAdvanced=1 when steel and no tilt", () => {
    const r = resolveLifeModelCeiling({
      config: { ...baseConfig, lifeMethod: "iso281" },
      equivalentLoadN: 3000,
      dynamicRatingN: 14800,
      meanDiameterMm: 38.5,
      kappa: 1.5,
      eC: 0.5,
      puOverP: 0.1,
    });
    expect(r.lifeMethod).toBe("iso281");
    expect(r.aAdvanced).toBe(1);
    expect(r.equivalentLoadForLifeN).toBe(3000);
  });
});

describe("shaft slope handoff keys", () => {
  it("preserves slope params through normalize", () => {
    const n = normalizeHandoffParams({
      radialLoad: 1000,
      station0Slope: 0.001,
      station1Slope: 0.002,
      maxBearingSlope: 0.002,
    });
    expect(n.station0Slope).toBe(0.001);
    expect(n.maxBearingSlope).toBe(0.002);
  });
});

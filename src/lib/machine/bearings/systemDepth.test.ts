import { describe, expect, it } from "vitest";
import { calculateThermalExpansion } from "./thermalExpansion";
import { calculateDuplexStiffness, effectiveAxialWithPreload } from "./duplexStiffness";
import { calculateArrangementAnalysis } from "./arrangementAnalysis";
import { solveBearingEngine } from "./engine";

const MATERIAL = {
  name: "Steel",
  dynamicRatingFactor: 35000,
  staticRatingFactor: 15000,
  allowableLife: 10000,
};

describe("thermal expansion float", () => {
  it("computes required float from span and ΔT", () => {
    const res = calculateThermalExpansion({
      spanMm: 500,
      operatingTempC: 80,
      ambientTempC: 20,
      availableFloatMm: 1,
    });
    expect(res.deltaTempK).toBeCloseTo(60);
    expect(res.requiredFloatMm).toBeGreaterThan(0);
    expect(res.status).toBeDefined();
  });

  it("flags insufficient float", () => {
    const res = calculateThermalExpansion({
      spanMm: 2000,
      operatingTempC: 120,
      availableFloatMm: 0.05,
    });
    expect(res.status).toBe("insufficient");
  });
});

describe("duplex preload and stiffness", () => {
  it("O has higher moment stiffness than X", () => {
    const base = {
      dynamicRatingN: 30000,
      meanDiameterMm: 40,
      preloadClass: "medium" as const,
      bearingType: "angular_contact" as const,
    };
    const o = calculateDuplexStiffness({ ...base, arrangement: "back_to_back" });
    const x = calculateDuplexStiffness({ ...base, arrangement: "face_to_face" });
    expect(o.momentStiffnessNmPerMrad).toBeGreaterThan(x.momentStiffnessNmPerMrad);
    expect(o.preloadForceN).toBeGreaterThan(0);
  });

  it("adds preload to effective axial", () => {
    expect(effectiveAxialWithPreload(2000, 1000, "back_to_back")).toBeCloseTo(3000);
  });
});

describe("arrangement analysis object", () => {
  it("returns preload, stiffness, δa, thermal, and O/X/T rigidity comparison", () => {
    const analysis = calculateArrangementAnalysis({
      arrangement: "back_to_back",
      dynamicRatingN: 30000,
      meanDiameterMm: 40,
      preloadClass: "medium",
      bearingType: "angular_contact",
      externalAxialLoadN: 2000,
      effectiveAxialLoadN: 3500,
      operatingTempC: 80,
      ambientTempC: 20,
      spanMm: 80,
    });
    expect(analysis.preloadForceN).toBeGreaterThan(0);
    expect(analysis.axialStiffnessNPerUm).toBeGreaterThan(0);
    expect(analysis.axialDisplacement.underExternalFaUm).toBeCloseTo(
      2000 / analysis.axialStiffnessNPerUm,
      5
    );
    expect(analysis.thermal).not.toBeNull();
    expect(analysis.thermal!.thermalGrowthUm).toBeGreaterThan(0);
    expect(analysis.rigidityComparison).toHaveLength(3);
    const o = analysis.rigidityComparison.find((r) => r.arrangement === "back_to_back")!;
    const x = analysis.rigidityComparison.find((r) => r.arrangement === "face_to_face")!;
    expect(o.isSelected).toBe(true);
    expect(o.momentStiffnessNmPerMrad).toBeGreaterThan(x.momentStiffnessNmPerMrad);
    expect(o.momentStiffnessRatioVsO).toBeCloseTo(1);
  });

  it("flags high axial displacement when Fa/Ka is large", () => {
    const analysis = calculateArrangementAnalysis({
      arrangement: "face_to_face",
      dynamicRatingN: 5000,
      meanDiameterMm: 25,
      preloadClass: "none",
      bearingType: "angular_contact",
      externalAxialLoadN: 8000,
    });
    expect(analysis.axialDisplacement.status).not.toBe("ok");
    expect(analysis.status).not.toBe("ok");
  });
});

describe("locating + floating system", () => {
  it("sizes two stations with thermal check", () => {
    const res = solveBearingEngine({
      radialLoad: 6000,
      axialLoad: 1500,
      speed: 1500,
      lifeHours: 20000,
      safetyFactor: 1.2,
      bearingType: "deep_groove",
      designation: "6208",
      mountingSystem: "locating_floating",
      locatingBearingType: "deep_groove",
      floatingBearingType: "cylindrical_roller",
      bearingSpanMm: 450,
      availableFloatMm: 1.2,
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      material: MATERIAL,
    });
    expect(res.pairedStations?.length).toBe(2);
    expect(res.pairedStations?.[0]?.role).toBe("locating");
    expect(res.pairedStations?.[1]?.role).toBe("floating");
    expect(res.pairedStations?.[1]?.axialLoad).toBe(0);
    expect(res.thermalExpansion).toBeDefined();
    expect(res.lifeSafetyFactor).toBeGreaterThan(0);
  });
});

describe("duplex O with preload", () => {
  it("returns arrangement analysis and paired stations", () => {
    const res = solveBearingEngine({
      radialLoad: 4000,
      axialLoad: 2000,
      speed: 2000,
      lifeHours: 20000,
      safetyFactor: 1.2,
      bearingType: "angular_contact",
      designation: "7205 B",
      arrangement: "back_to_back",
      preloadClass: "light",
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      material: MATERIAL,
    });
    expect(res.arrangementAnalysis).toBeDefined();
    expect(res.arrangementAnalysis!.arrangementLabel).toContain("O");
    expect(res.arrangementAnalysis!.axialDisplacementUm).toBeGreaterThan(0);
    expect(res.arrangementAnalysis!.rigidityComparison).toHaveLength(3);
    expect(res.duplexStiffness).toBeDefined();
    expect(res.duplexStiffness!.arrangementLabel).toContain("O");
    expect(res.pairedStations?.length).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { solveFatigueEngine } from "./engine";

describe("Marin factors vs Shigley (10th ed.) worked values", () => {
  it("surface factor ka = 4.51·Su^-0.265 ≈ 0.798 for machined steel, Su = 690 MPa", () => {
    // Shigley Example 6-3 style: ka = 4.51·(690)^-0.265 = 0.798
    const result = solveFatigueEngine({
      alternatingStress: 100e6,
      meanStress: 0,
      ultimateStrength: 690e6,
      enduranceLimit: 100e6,
      surfaceFinish: "machined",
      loadType: "bending",
    });
    expect(result.surfaceFactor).toBeGreaterThan(0.798 * 0.99);
    expect(result.surfaceFactor).toBeLessThan(0.798 * 1.01);
  });

  it("size factor kb = (d/7.62)^-0.107 ≈ 0.858 for d = 32 mm in bending", () => {
    const result = solveFatigueEngine({
      alternatingStress: 100e6,
      meanStress: 0,
      ultimateStrength: 690e6,
      enduranceLimit: 100e6,
      surfaceFinish: "ground",
      loadType: "bending",
      characteristicDiameter: 0.032,
    });
    expect(result.sizeFactor).toBeGreaterThan(0.858 * 0.99);
    expect(result.sizeFactor).toBeLessThan(0.858 * 1.01);
  });

  it("load factor kc = 0.85 axial, 0.59 torsion, 1.0 bending (Shigley Eq. 6-26)", () => {
    const base = {
      alternatingStress: 100e6,
      meanStress: 0,
      ultimateStrength: 690e6,
      enduranceLimit: 100e6,
      surfaceFinish: "ground" as const,
    };
    expect(solveFatigueEngine({ ...base, loadType: "axial" }).loadFactor).toBe(0.85);
    expect(solveFatigueEngine({ ...base, loadType: "torsion" }).loadFactor).toBe(0.59);
    expect(solveFatigueEngine({ ...base, loadType: "bending" }).loadFactor).toBe(1.0);
  });
});

describe("mean-stress corrections (textbook closed forms)", () => {
  // Use ground finish + bending + no diameter so all Marin factors stay near 1
  // (ka = 1.58·520^-0.085 = 0.928).
  const base = {
    ultimateStrength: 520e6,
    enduranceLimit: 260e6,
    surfaceFinish: "ground" as const,
    loadType: "bending" as const,
  };
  const ka = Math.min(1, 1.58 * Math.pow(520, -0.085));
  const Se = 260e6 * ka;

  it("modified Goodman allowable: Sa_allow = Se·(1 − Sm/Su)", () => {
    const result = solveFatigueEngine({
      ...base,
      alternatingStress: 120e6,
      meanStress: 30e6,
      meanStressMethod: "goodman",
    });
    const expected = Se * (1 - 30 / 520);
    expect(result.allowableStress).toBeCloseTo(expected, -3);
    expect(result.safetyFactor).toBeCloseTo(expected / 120e6, 5);
  });

  it("Gerber allowable: Sa_allow = Se·(1 − (Sm/Su)²)", () => {
    const result = solveFatigueEngine({
      ...base,
      alternatingStress: 120e6,
      meanStress: 30e6,
      meanStressMethod: "gerber",
    });
    const expected = Se * (1 - (30 / 520) ** 2);
    expect(result.allowableStress).toBeCloseTo(expected, -3);
  });
});

describe("Basquin S-N life prediction (Shigley Eqs. 6-14 to 6-16)", () => {
  const base = {
    meanStress: 0,
    ultimateStrength: 520e6,
    enduranceLimit: 260e6,
    surfaceFinish: "ground" as const,
    loadType: "bending" as const,
  };
  const ka = Math.min(1, 1.58 * Math.pow(520, -0.085));
  const Se = 260e6 * ka;

  it("predicts infinite life when amplitude is below the endurance limit", () => {
    const result = solveFatigueEngine({ ...base, alternatingStress: Se * 0.9 });
    expect(result.infiniteLife).toBe(true);
  });

  it("matches the closed-form Basquin cycle count above the endurance limit", () => {
    const sigma = Se * 1.4;
    const result = solveFatigueEngine({ ...base, alternatingStress: sigma });
    const f = 0.9;
    const a = (f * 520e6) ** 2 / Se;
    const b = -Math.log10((f * 520e6) / Se) / 3;
    const expectedCycles = Math.pow(sigma / a, 1 / b);
    expect(result.infiniteLife).toBe(false);
    expect(result.predictedCycles).toBeGreaterThan(expectedCycles * 0.99);
    expect(result.predictedCycles).toBeLessThan(expectedCycles * 1.01);
  });
});

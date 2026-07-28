import { describe, expect, it } from "vitest";
import { solveShaftEngine } from "./engine";
import { simplySupportedSupports } from "./loadVector";
import { shoulderFilletKtBending } from "./stressConcentration";

const STEEL = {
  name: "Steel",
  E: 210e9,
  G: 80e9,
  density: 7850,
  yieldStress: 250e6,
  ultimateStrength: 690e6,
};

describe("shaft FEM regression", () => {
  it("matches indicative benchmark (fixed-left, mid-span loads)", () => {
    const res = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: STEEL,
      loads: [{ position: 0.5, torque: 100, bendingMoment: 200 }],
      meshSegments: 20,
    });
    expect(res.maxStress).toBeCloseTo(17_759_752, -3);
    expect(res.safetyFactor).toBeCloseTo(14.08, 1);
    expect(res.keysDesign).not.toBeNull();
    expect(res.keysDesign!.width).toBeGreaterThan(0);
    expect(res.fatigueConcentrationFactor.length).toBe(res.x.length);
  });

  it("simply supported center force: M_max ≈ FL/4", () => {
    const L = 1;
    const F = 1000;
    const res = solveShaftEngine({
      geometry: { diameter: 0.04, length: L },
      material: STEEL,
      loads: [{ position: L / 2, transverseForce: F }],
      supports: simplySupportedSupports(L),
      meshSegments: 40,
    });
    expect(res.maxBendingMoment).toBeGreaterThan((F * L) / 4 * 0.9);
    expect(res.maxBendingMoment).toBeLessThan((F * L) / 4 * 1.1);
  });

  it("computes positive critical speed for supported shaft", () => {
    const res = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: STEEL,
      loads: [],
      supports: simplySupportedSupports(1),
      meshSegments: 30,
    });
    expect(res.criticalSpeed).toBeGreaterThan(100);
    expect(res.criticalSpeedModes.length).toBeGreaterThanOrEqual(1);
  });

  it("shoulder fillet Kt increases with stress concentration", () => {
    const kt = shoulderFilletKtBending(0.06, 0.04, 0.002);
    expect(kt).toBeGreaterThan(1.2);
  });

  it("fatigue SF and Goodman detail when operating rpm is set", () => {
    const res = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: STEEL,
      loads: [{ position: 0.5, torque: 100, bendingMoment: 200 }],
      operatingRpm: 1500,
      meshSegments: 30,
      stressFeatures: [
        { position: 0.5, type: "keyway", keywayStyle: "sled_runner" },
        {
          position: 0.25,
          type: "retaining_ring",
          grooveDepth: 0.0015,
          grooveWidth: 0.002,
          axialRetentionLoad: 2000,
        },
      ],
      fatigue: {
        enabled: true,
        surfaceFinish: "machined",
        alternatingTorqueFraction: 0.2,
        useNotchSensitivity: true,
      },
    });
    expect(res.fatigueSafetyFactor).not.toBeNull();
    expect(res.fatigueSafetyFactor!).toBeGreaterThan(1);
    expect(res.fatigueDetail).not.toBeNull();
    expect(res.fatigueDetail!.goodmanMean.length).toBeGreaterThan(10);
    expect(res.retainingRingChecks.length).toBe(1);
    expect(res.bearingLifeScreens.length).toBeGreaterThan(0);
  });

  it("end-milled keyway raises Kt vs sled-runner", () => {
    const base = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: STEEL,
      loads: [{ position: 0.5, torque: 100, bendingMoment: 200 }],
      stressFeatures: [{ position: 0.5, type: "keyway", keywayStyle: "sled_runner" }],
      meshSegments: 30,
    });
    const endMilled = solveShaftEngine({
      geometry: { diameter: 0.05, length: 1 },
      material: STEEL,
      loads: [{ position: 0.5, torque: 100, bendingMoment: 200 }],
      stressFeatures: [{ position: 0.5, type: "keyway", keywayStyle: "end_milled" }],
      meshSegments: 30,
    });
    expect(Math.max(...endMilled.stressConcentrationFactor)).toBeGreaterThan(
      Math.max(...base.stressConcentrationFactor)
    );
  });
});

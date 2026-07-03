import { describe, expect, it } from "vitest";
import { solveTorsionSpringEngine } from "./engine";
import { torsionCurvatureFactor } from "../shared/helicalCommon";

describe("torsion spring engine", () => {
  it("computes rate k = E·d⁴/(64·D·n)", () => {
    const d = 0.002;
    const D = 0.02;
    const n = 8;
    const E = 210e9;
    const res = solveTorsionSpringEngine({
      wireDiameter: d,
      meanDiameter: D,
      activeCoils: n,
      legLength: 0.03,
      deflectionAngleDeg: 90,
      modulus: E,
      ultimateStrength: 1400e6,
    });
    const expected = (E * d ** 4) / (64 * D * n);
    expect(res.springRate).toBeCloseTo(expected, 0);
  });

  it("applies curvature factor to bending stress", () => {
    const res = solveTorsionSpringEngine({
      wireDiameter: 0.002,
      meanDiameter: 0.02,
      activeCoils: 8,
      legLength: 0.03,
      deflectionAngleDeg: 90,
      modulus: 210e9,
      ultimateStrength: 1400e6,
    });
    const C = 10;
    const Kb = torsionCurvatureFactor(C);
    const M = res.torque;
    const plain = (32 * M) / (Math.PI * 0.002 ** 3);
    expect(res.bendingStress).toBeCloseTo(Kb * plain, 1);
  });

  it("uses wire type size-effect for allowable stress", () => {
    const res = solveTorsionSpringEngine({
      wireDiameter: 0.002,
      meanDiameter: 0.02,
      activeCoils: 8,
      legLength: 0.03,
      deflectionAngleDeg: 45,
      modulus: 210e9,
      ultimateStrength: 500e6,
      wireType: "music",
    });
    expect(res.wireUltimateStrength).toBeGreaterThan(500e6);
    expect(res.safetyFactor).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";
import { solveCompositeEngine } from "./engine";

describe("composite laminate screening", () => {
  it("computes Tsai-Hill utilization and angle-transformed modulus", () => {
    const res = solveCompositeEngine({
      fiberVolumeFraction: 0.6,
      fiberModulus: 230000,
      matrixModulus: 3500,
      fiberStrength: 3500,
      matrixStrength: 80,
      fiberDensity: 1800,
      matrixDensity: 1200,
      fiberPoisson: 0.22,
      matrixPoisson: 0.35,
      plyAngleDeg: 45,
      appliedStress: 500,
    });
    expect(res.E_atPlyAngle).toBeGreaterThan(0);
    expect(res.tsaiHillUtilization).toBeGreaterThan(0);
  });
});

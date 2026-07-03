import { describe, expect, it } from "vitest";
import { solvePressureVesselEngine } from "./engine";

describe("pressure vessel FEM", () => {
  it("hoop stress increases with internal pressure", () => {
    const res = solvePressureVesselEngine({
      radius: 0.5,
      thickness: 0.01,
      length: 2,
      pressure: 2e6,
      E: 210e9,
      A: 0.01,
      segments: 8,
    });
    expect(res.maxHoopStress).toBeGreaterThan(1e6);
  });
});

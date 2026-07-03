import { describe, expect, it } from "vitest";
import { solveBeamEngine } from "./engine";

describe("beam FEM", () => {
  it("simply supported central load: M_max ≈ PL/4", () => {
    const P = 10000;
    const L = 5;
    const res = solveBeamEngine({
      length: L,
      E: 210e9,
      I: 5e-5,
      A: 0.01,
      c: 0.1,
      support: "simply_supported",
      meshSegments: 20,
      applicationId: "general",
      loads: [{ id: "p1", type: "point", value: P, position: L / 2 }],
    });
    expect(res.maxMoment).toBeGreaterThan((P * L) / 4 * 0.95);
    expect(res.maxMoment).toBeLessThan((P * L) / 4 * 1.05);
  });
});

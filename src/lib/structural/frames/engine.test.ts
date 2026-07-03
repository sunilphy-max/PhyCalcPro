import { describe, expect, it } from "vitest";
import { solveFrameEngine } from "./engine";

describe("frame FEM", () => {
  it("returns finite displacements for portal frame", () => {
    const res = solveFrameEngine({
      span: 6,
      height: 3,
      segments: 4,
      A: 0.01,
      I: 8e-5,
      E: 210e9,
      load: 50000,
    });
    expect(res.maxDisplacement).toBeGreaterThan(0);
    expect(res.maxMoment).toBeGreaterThan(0);
  });
});

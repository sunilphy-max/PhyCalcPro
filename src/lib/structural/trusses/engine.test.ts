import { describe, expect, it } from "vitest";
import { solveTrussEngine } from "./engine";

describe("truss FEM", () => {
  it("returns member forces for Warren truss", () => {
    const res = solveTrussEngine({
      span: 10,
      height: 2,
      panels: 4,
      A: 0.005,
      E: 210e9,
      load: 100000,
    });
    expect(res.maxForce).toBeGreaterThan(0);
    expect(res.maxDisplacement).toBeGreaterThan(0);
  });
});

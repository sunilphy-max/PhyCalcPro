import { describe, expect, it } from "vitest";
import { solveWeldEngine } from "./engine";

describe("weld engine", () => {
  it("computes throat stress and safety factor", () => {
    const res = solveWeldEngine({
      weldType: "fillet",
      weldSize: 6,
      weldLength: 100,
      weldCount: 2,
      shearForce: 50000,
      axialForce: 10000,
      material: { name: "E70", strength: 490, yieldStress: 400 },
    });
    expect(res.resultantStress).toBeGreaterThan(0);
    expect(res.safetyFactorOverall).toBeGreaterThan(1);
  });
});

import { describe, expect, it } from "vitest";
import { solveBoltPattern } from "./boltPattern";

describe("bolt pattern", () => {
  it("distributes shear across four bolts", () => {
    const res = solveBoltPattern({
      boltCount: 4,
      patternRadius: 0.05,
      shearForce: 40000,
      axialForce: 5000,
      positions: [
        { x: 0.05, y: 0 },
        { x: -0.05, y: 0 },
        { x: 0, y: 0.05 },
        { x: 0, y: -0.05 },
      ],
    });
    expect(res.maxBoltForce).toBeGreaterThanOrEqual(res.meanBoltForce);
    expect(res.bolts).toHaveLength(4);
  });
});

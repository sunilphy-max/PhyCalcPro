import { describe, expect, it } from "vitest";
import { solveImpactEngine } from "./engine";

describe("impact SDOF engine", () => {
  it("SDOF peak force exceeds time-averaged force for elastic impact", () => {
    const res = solveImpactEngine({
      mass: 100,
      velocityChange: 2,
      impactDuration: 10,
      crossSectionArea: 500,
      yieldStrength: 250,
      dampingRatio: 0.05,
    });
    expect(res.sdofPeakForce).toBeGreaterThan(res.averageForce);
    expect(res.dynamicAmplification).toBeGreaterThan(1);
    expect(res.kineticEnergy).toBeGreaterThan(0);
    expect(res.energyAbsorbed).toBeGreaterThan(0);
  });
});

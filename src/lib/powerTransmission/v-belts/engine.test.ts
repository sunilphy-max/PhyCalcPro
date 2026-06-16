import { describe, expect, it } from "vitest";
import { normalizePowerKw } from "./catalog";
import { solveVBeltDrive } from "./engine";
import { designVBeltDrive } from "@/lib/design-workflows/solvers/vbeltDesign";

describe("solveVBeltDrive", () => {
  it("computes ratio 2 for 100 mm / 200 mm pulleys", () => {
    const result = solveVBeltDrive({
      power: normalizePowerKw(15, "hp"),
      speedDriver: 1750,
      speedDriven: 875,
      diameterDriver: 0.1,
      diameterDriven: 0.2,
      centerDistance: 0.5,
      serviceFactor: 1.2,
      beltFactor: 0.18,
      frictionCoeff: 0.5,
      beltSection: "B",
    });

    expect(result.ratio).toBeCloseTo(2, 5);
    expect(result.speedRatioFromRpm).toBeCloseTo(2, 5);
    expect(result.drivenSpeed).toBeCloseTo(875, 1);
    expect(result.numberOfBelts).toBeGreaterThanOrEqual(1);
    expect(result.tightSideTension).toBeGreaterThan(result.slackSideTension);
    expect(result.radialLoadDriver).toBeGreaterThan(0);
  });

  it("designs a drive for 15 HP at 1750/875 rpm", () => {
    const powerKw = normalizePowerKw(15, "hp");
    const design = designVBeltDrive({
      powerKw,
      speedDriver: 1750,
      speedDriven: 875,
      serviceFactor: 1.2,
      centerDistance: 0.5,
      beltSection: "B",
    });

    expect(design.best).not.toBeNull();
    expect(design.best!.powerUtilization).toBeLessThanOrEqual(1.05);
    expect(design.best!.wrapAngleDriver).toBeGreaterThanOrEqual(120);
  });
});

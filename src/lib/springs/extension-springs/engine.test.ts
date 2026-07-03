import { describe, expect, it } from "vitest";
import { solveExtensionSpringEngine } from "./engine";

describe("extension spring engine", () => {
  const base = {
    wireDiameter: 0.002,
    meanDiameter: 0.02,
    activeCoils: 10,
    freeLength: 0.06,
    deflection: 0.015,
    modulus: 81e9,
    ultimateStrength: 1400e6,
    wireType: "music" as const,
  };

  it("force at extension = Fi + k·x", () => {
    const res = solveExtensionSpringEngine({ ...base, initialTension: 5 });
    expect(res.forceAtExtension).toBeCloseTo(5 + res.maxLoad, 1);
  });

  it("hook stress exceeds body stress when hook factor > 1", () => {
    const res = solveExtensionSpringEngine({ ...base, hookType: "crossover", initialTension: 3 });
    expect(res.hookShearStress).toBeGreaterThan(res.bodyShearStress);
    expect(res.hookSafetyFactor).toBeLessThan(res.bodySafetyFactor);
  });

  it("validates initial tension against manufacturable limit", () => {
    const res = solveExtensionSpringEngine({ ...base, initialTension: 5000 });
    expect(res.initialTensionValid).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { solveScrewFEM } from "./femSolver";
import type { PowerScrewConfig } from "./types";

/**
 * Benchmark: Shigley's Mechanical Engineering Design (10th ed.), Example 8-1.
 * Square-thread power screw, major diameter 32 mm, pitch 4 mm, double thread
 * (lead 8 mm), F = 6.4 kN, f = 0.08. Published results (thread only, no collar):
 *   dm = 30 mm, raising torque TR = 15.94 N·m,
 *   thread efficiency e = F·l/(2π·TR) = 51.2/(2π·15.94) ≈ 0.511.
 */
describe("power screw solver vs Shigley Example 8-1", () => {
  const config: PowerScrewConfig = {
    screwType: "power_screw",
    threadType: "square",
    majorDiameter: 0.032,
    pitch: 0.004,
    lead: 0.008,
    length: 1.0,
    axialForce: 6400,
    frictionCoefficient: 0.08,
    starts: 2,
  };

  const result = solveScrewFEM(config);

  it("computes the pitch (mean) diameter dm = 30 mm", () => {
    expect(result.pitchDiameter).toBeCloseTo(0.03, 6);
  });

  it("computes the raising torque TR = 15.94 N·m", () => {
    expect(result.torque).toBeGreaterThan(15.94 * 0.99);
    expect(result.torque).toBeLessThan(15.94 * 1.01);
  });

  it("computes thread efficiency ~51.1%", () => {
    expect(result.efficiency).toBeGreaterThan(51.1 * 0.99);
    expect(result.efficiency).toBeLessThan(51.1 * 1.01);
  });

  it("uses the Shigley tensile-stress area, not the thread annulus", () => {
    // A_t = (π/4)·((dp + dr)/2)² = (π/4)·(0.029)² = 6.605e-4 m²
    const expectedArea = (Math.PI / 4) * 0.029 ** 2;
    const tensileStress = result.compressiveStress;
    expect(tensileStress).toBeCloseTo(6400 / expectedArea, -2);
  });

  it("computes a physically meaningful whirling critical speed", () => {
    // Simply supported shaft, core d_r = 28 mm, L = 1 m, steel:
    // ω = (π/L)²·√(E·I/(ρ·A)) → N ≈ 3.41e3 rpm
    expect(result.criticalSpeed).toBeGreaterThan(3410 * 0.98);
    expect(result.criticalSpeed).toBeLessThan(3410 * 1.02);
  });

  it("reports a Goodman fatigue safety factor lower than the static factor", () => {
    expect(result.fatigueSafetyFactor).toBeGreaterThan(0);
    expect(result.fatigueSafetyFactor).toBeLessThan(result.safetyFactor);
  });
});

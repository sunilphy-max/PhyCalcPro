import { describe, expect, it } from "vitest";
import { solveGearDesign, getLewisFormFactor } from "./solver";
import type { GearConfig } from "./types";

/**
 * Benchmark: metric Lewis bending equation σ = Wt/(b·m·Y) (Shigley Ch. 14,
 * Eq. 14-2 metric form) with hand-computed values:
 *   P = 15 kW @ 1200 rpm → T = 60·15000/(2π·1200) = 119.366 N·m
 *   d = m·z = 3 mm · 20 = 60 mm → Wt = 2T/d = 3978.87 N
 *   Y = 0.484 − 2.87/20 = 0.3405
 *   σ = 3978.87/(0.025·0.003·0.3405) = 155.8 MPa
 */
describe("spur gear Lewis bending vs hand calculation", () => {
  const config: GearConfig = {
    power: 15000,
    speed: 1200,
    module: 0.003,
    pinionTeeth: 20,
    gearRatio: 2,
    faceWidth: 0.025,
    material: { name: "steel", E: 210e9, yieldStress: 250e6, poisson: 0.3 },
  };

  const result = solveGearDesign(config);

  it("computes torque T = 119.37 N·m", () => {
    expect(result.torque).toBeCloseTo(119.366, 2);
  });

  it("computes tangential force Wt = 3978.9 N", () => {
    expect(result.tangentialForce).toBeCloseTo(3978.87, 0);
  });

  it("computes Lewis form factor Y = 0.3405 for 20 teeth", () => {
    expect(getLewisFormFactor(20)).toBeCloseTo(0.3405, 4);
  });

  it("computes bending stress 155.8 MPa and SF = 1.605", () => {
    expect(result.bendingStress / 1e6).toBeGreaterThan(155.8 * 0.995);
    expect(result.bendingStress / 1e6).toBeLessThan(155.8 * 1.005);
    expect(result.safetyFactor).toBeCloseTo(1.6046, 3);
  });

  it("computes pitch line velocity v = π·d·n/60 = 3.77 m/s", () => {
    expect(result.pitchLineVelocity).toBeCloseTo((Math.PI * 0.06 * 1200) / 60, 3);
  });

  it("grounds contact fatigue limit in the ISO 6336-5 hardness fit", () => {
    // Su ≈ 1.5·250 = 375 MPa → HB ≈ 375/3.45 = 108.7 → σ_H,lim = 2·HB + 200 = 417.4 MPa
    expect(result.contactFatigueSafetyFactor * result.contactStress / 1e6).toBeCloseTo(417.4, 0);
  });
});

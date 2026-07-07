import { describe, expect, it } from "vitest";
import { solveMotorEngine } from "./engine";

describe("solveMotorEngine", () => {
  it("computes rated torque from power and speed", () => {
    const res = solveMotorEngine({
      power: 7500,
      poles: 4,
      lineFrequencyHz: 60,
      serviceClass: "continuous",
      startingTorqueFactor: 2,
      efficiency: 0.9,
      powerFactor: 0.85,
    });
    expect(res.synchronousSpeedRpm).toBe(1800);
    expect(res.ratedSpeedRpm).toBeGreaterThan(1700);
    expect(res.ratedSpeedRpm).toBeLessThan(1800);
    expect(res.ratedTorque).toBeCloseTo(41, 0);
    expect(res.startingTorque).toBeCloseTo(82, 0);
    expect(res.electricalPower).toBeCloseTo(7500 / 0.9, 1);
    expect(res.isSafe).toBe(true);
  });

  it("assigns indicative frame class for small motor", () => {
    const res = solveMotorEngine({
      power: 1500,
      poles: 4,
      lineFrequencyHz: 50,
      serviceClass: "continuous",
      startingTorqueFactor: 1.8,
      efficiency: 0.88,
      powerFactor: 0.82,
    });
    expect(res.iecFrame).toBe("71");
    expect(res.serviceFactor).toBe(1.1);
  });
});

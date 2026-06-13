import { describe, expect, it } from "vitest";
import { aiscE3CriticalStressPa, ec3BucklingChi } from "./columns";

describe("AISC 360 §E3 column curve", () => {
  it("inelastic branch: Fy/Fe = 1 gives Fcr = 0.658·Fy", () => {
    const fy = 345e6;
    expect(aiscE3CriticalStressPa(fy, fy)).toBeCloseTo(0.658 * fy, -3);
  });

  it("elastic branch: Fy/Fe > 2.25 gives Fcr = 0.877·Fe", () => {
    const fy = 345e6;
    const fe = 100e6; // Fy/Fe = 3.45 > 2.25
    expect(aiscE3CriticalStressPa(fy, fe)).toBeCloseTo(0.877 * fe, -3);
  });

  it("branches meet continuously at Fy/Fe = 2.25", () => {
    const fy = 345e6;
    const fe = fy / 2.25;
    const inelastic = Math.pow(0.658, 2.25) * fy;
    expect(aiscE3CriticalStressPa(fy, fe)).toBeCloseTo(inelastic, -3);
    // 0.658^2.25 ≈ 0.39 ≈ 0.877/2.25 — the curves are designed to meet
    expect(inelastic / (0.877 * fe)).toBeGreaterThan(0.99);
    expect(inelastic / (0.877 * fe)).toBeLessThan(1.01);
  });

  it("stocky column limit: Fe → ∞ gives Fcr → Fy", () => {
    expect(aiscE3CriticalStressPa(345e6, 1e15)).toBeCloseTo(345e6, -4);
  });
});

describe("EN 1993-1-1 §6.3.1.2 buckling reduction χ (curve c, α = 0.49)", () => {
  it("χ = 1 below the plateau (λ̄ ≤ 0.2)", () => {
    const fy = 235e6;
    const fe = fy / 0.04; // λ̄ = 0.2
    expect(ec3BucklingChi(fy, fe)).toBe(1);
  });

  it("χ ≈ 0.540 at λ̄ = 1.0 (published curve c value)", () => {
    const fy = 235e6;
    const fe = fy; // λ̄ = 1.0
    const chi = ec3BucklingChi(fy, fe);
    expect(chi).toBeGreaterThan(0.540 * 0.99);
    expect(chi).toBeLessThan(0.540 * 1.01);
  });

  it("χ ≈ 0.3145 at λ̄ = 1.5 (published curve c value)", () => {
    const fy = 235e6;
    const fe = fy / 2.25; // λ̄ = 1.5
    const chi = ec3BucklingChi(fy, fe);
    expect(chi).toBeGreaterThan(0.3145 * 0.99);
    expect(chi).toBeLessThan(0.3145 * 1.01);
  });
});

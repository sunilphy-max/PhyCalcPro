import { describe, expect, it } from "vitest";
import { solveCompressionSpringEngine, wireUltimateStrengthPa } from "./engine";

/**
 * Benchmark: closed-form helical compression spring equations
 * (Shigley Ch. 10, EN 13906-1): k = G·d⁴/(8·D³·N), τ = Kw·8·F·D/(π·d³),
 * Kw (Wahl) = (4C−1)/(4C−4) + 0.615/C, τ_zul = 0.56·Rm.
 * Hand-computed for d = 4 mm, D = 32 mm, N = 10, G = 80.77 GPa:
 *   k = 80.77e9·(0.004)⁴ / (8·(0.032)³·10) = 7887 N/m
 *   C = 8 → Kw = 1.1840
 *   F at 20 mm deflection = 157.7 N → τ = 237.8 MPa
 */
describe("compression spring engine vs closed-form hand calculation", () => {
  const result = solveCompressionSpringEngine({
    wireDiameter: 0.004,
    meanDiameter: 0.032,
    activeCoils: 10,
    freeLength: 0.06,
    modulus: 80.77e9,
    deflection: 0.02,
    ultimateStrength: 1200e6,
  });

  it("computes spring rate k ≈ 7887 N/m", () => {
    const expected = (80.77e9 * 0.004 ** 4) / (8 * 0.032 ** 3 * 10);
    expect(result.springRate).toBeCloseTo(expected, 0);
    expect(result.springRate / 7887).toBeGreaterThan(0.99);
    expect(result.springRate / 7887).toBeLessThan(1.01);
  });

  it("computes Wahl factor 1.184 at C = 8", () => {
    expect(result.wahlFactor).toBeCloseTo(1.184, 3);
  });

  it("computes Wahl-corrected shear stress ≈ 237.8 MPa at 20 mm deflection", () => {
    expect(result.shearStress / 1e6).toBeGreaterThan(237.8 * 0.99);
    expect(result.shearStress / 1e6).toBeLessThan(237.8 * 1.01);
  });

  it("computes solid height Ls = (N + 2)·d = 48 mm", () => {
    expect(result.solidHeight).toBeCloseTo(0.048, 6);
  });

  it("applies the EN 13906-1 static allowable τ_zul = 0.56·Rm", () => {
    expect(result.allowableShearStress).toBeCloseTo(0.56 * 1200e6, -3);
    expect(result.safetyFactor).toBeCloseTo((0.56 * 1200e6) / result.shearStress, 4);
  });

  it("flags no buckling risk for L0/D = 1.875 (buckle-proof below 5.26)", () => {
    expect(result.slenderness).toBeCloseTo(0.06 / 0.032, 4);
    expect(result.bucklingRisk).toBe(false);
  });
});

describe("wire strength size-effect fit (Shigley Table 10-4)", () => {
  it("music wire 2 mm: Sut = 2211/2^0.145 ≈ 2000 MPa", () => {
    const sut = wireUltimateStrengthPa("music", 0.002, 0);
    expect(sut / 1e6).toBeGreaterThan(1995);
    expect(sut / 1e6).toBeLessThan(2005);
  });

  it("hard-drawn 4 mm: Sut = 1783/4^0.19 ≈ 1369 MPa", () => {
    const sut = wireUltimateStrengthPa("hard-drawn", 0.004, 0);
    const expected = 1783 / Math.pow(4, 0.19);
    expect(sut / 1e6).toBeCloseTo(expected, 0);
  });

  it("custom type falls back to the supplied ultimate strength", () => {
    expect(wireUltimateStrengthPa("custom", 0.004, 1500e6)).toBe(1500e6);
    expect(wireUltimateStrengthPa(undefined, 0.004, 1500e6)).toBe(1500e6);
  });
});

describe("surge frequency", () => {
  it("matches f = ½·√(k/m_active) for fixed ends", () => {
    const result = solveCompressionSpringEngine({
      wireDiameter: 0.004,
      meanDiameter: 0.032,
      activeCoils: 10,
      freeLength: 0.06,
      modulus: 80.77e9,
      deflection: 0.02,
      ultimateStrength: 1200e6,
    });
    const wireMass = ((Math.PI * 0.004 ** 2) / 4) * (Math.PI * 0.032 * 10) * 7850;
    const expected = 0.5 * Math.sqrt(result.springRate / wireMass);
    expect(result.naturalFrequency).toBeCloseTo(expected, 1);
  });
});

import { describe, expect, it } from "vitest";
import {
  zoneFactorZH,
  elasticFactorZE,
  approxContactRatio,
  contactRatioFactorZeps,
  formFactorYFS,
  bendingContactRatioFactorYeps,
  dynamicFactorKV,
  runIso6336Rating,
} from "./iso6336";

describe("ISO 6336 factor functions vs published values", () => {
  it("Z_H = 2.495 for 20° spur gears (ISO 6336-2)", () => {
    expect(zoneFactorZH()).toBeCloseTo(2.4946, 3);
  });

  it("Z_E = 189.8 √MPa for steel/steel (E = 206 GPa, ν = 0.3)", () => {
    // Published ISO 6336-2 / AGMA value for steel pinion + steel gear
    const ze = elasticFactorZE(206e9, 0.3);
    expect(ze / Math.sqrt(1e6)).toBeGreaterThan(189.8 * 0.995);
    expect(ze / Math.sqrt(1e6)).toBeLessThan(189.8 * 1.005);
  });

  it("ε_α ≈ 1.63 for z1 = 20, z2 = 40 (Niemann approximation)", () => {
    const eps = approxContactRatio(20, 40);
    expect(eps).toBeCloseTo(1.88 - 3.2 * (1 / 20 + 1 / 40), 6);
    expect(eps).toBeGreaterThan(1.6);
    expect(eps).toBeLessThan(1.7);
  });

  it("Z_ε = √((4 − ε)/3): 0.889 at ε = 1.63", () => {
    expect(contactRatioFactorZeps(1.63)).toBeCloseTo(Math.sqrt(2.37 / 3), 4);
  });

  it("Y_FS = 3.47 + 13.2/z: 4.13 at z = 20", () => {
    expect(formFactorYFS(20)).toBeCloseTo(4.13, 2);
  });

  it("Y_ε = 0.25 + 0.75/ε: 0.71 at ε = 1.63", () => {
    expect(bendingContactRatioFactorYeps(1.63)).toBeCloseTo(0.25 + 0.75 / 1.63, 4);
  });

  it("K_V (AGMA curve, Qv = 7) is 1 at rest and grows with velocity", () => {
    expect(dynamicFactorKV(0, 7)).toBeCloseTo(1, 6);
    const kv5 = dynamicFactorKV(5, 7);
    const kv20 = dynamicFactorKV(20, 7);
    expect(kv5).toBeGreaterThan(1.1);
    expect(kv20).toBeGreaterThan(kv5);
    expect(kv20).toBeLessThan(2);
  });
});

describe("full ISO 6336 rating sanity (15 kW spur set)", () => {
  const rating = runIso6336Rating({
    tangentialForceN: 3978.87,
    faceWidthM: 0.025,
    moduleM: 0.003,
    z1: 20,
    z2: 40,
    pinionDiameterM: 0.06,
    pitchVelocityMs: 3.77,
    ePa: 210e9,
    poisson: 0.3,
    ultimatePa: 700e6, // ~HB 203 through-hardened steel
  });

  it("computes contact stress in the physically expected range (0.5–2 GPa)", () => {
    expect(rating.contactStressPa).toBeGreaterThan(0.5e9);
    expect(rating.contactStressPa).toBeLessThan(2e9);
  });

  it("contact stress matches the hand-evaluated ISO 6336-2 expression", () => {
    const f = rating.factors;
    const u = 2;
    const loadIntensity =
      (3978.87 / (0.025 * 0.06)) * ((u + 1) / u) * f.KA * f.KV * f.KHbeta;
    const expected = f.ZH * f.ZE * f.Zeps * Math.sqrt(loadIntensity);
    expect(rating.contactStressPa).toBeCloseTo(expected, -3);
  });

  it("bending stress matches the hand-evaluated ISO 6336-3 expression", () => {
    const f = rating.factors;
    const expected =
      (3978.87 / (0.025 * 0.003)) * f.YFS * f.Yeps * f.KA * f.KV * f.KHbeta;
    expect(rating.bendingStressPa).toBeCloseTo(expected, -3);
  });

  it("allowables follow the through-hardened fits (σ_H,lim = 2HB+200 MPa)", () => {
    const hb = 700 / 3.45;
    expect(rating.allowableContactStressPa / 1e6).toBeCloseTo(2 * hb + 200, 0);
    expect(rating.allowableBendingStressPa / 1e6).toBeCloseTo(0.84 * hb + 340, 0);
  });
});

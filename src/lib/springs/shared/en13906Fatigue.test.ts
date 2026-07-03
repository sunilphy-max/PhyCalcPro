import { describe, expect, it } from "vitest";
import {
  en13906LifeFactor,
  en13906ShearFatigueCheck,
  en13906CharacteristicShearFatigue,
} from "./en13906Fatigue";

describe("en13906Fatigue", () => {
  it("reduces allowable amplitude with mean stress (Goodman)", () => {
    const Rm = 1400e6;
    const tauK0 = en13906CharacteristicShearFatigue(Rm, 0.002, 1);
    const staticAllow = 0.56 * Rm;
    const res = en13906ShearFatigueCheck({
      tauMax: 400e6,
      tauMin: 200e6,
      ultimateStrength: Rm,
      wireDiameterM: 0.002,
      staticAllowableShear: staticAllow,
      loadCycles: 1e7,
      enabled: true,
    });
    expect(res.stressAmplitude).toBeCloseTo(100e6, -5);
    expect(res.allowableAmplitude).toBeLessThan(tauK0);
    expect(res.fatigueSafetyFactor).toBeGreaterThan(0);
  });

  it("applies life factor for shorter life", () => {
    const long = en13906ShearFatigueCheck({
      tauMax: 300e6,
      tauMin: 0,
      ultimateStrength: 1400e6,
      wireDiameterM: 0.002,
      staticAllowableShear: 0.56 * 1400e6,
      loadCycles: 1e7,
      enabled: true,
    });
    const short = en13906ShearFatigueCheck({
      tauMax: 300e6,
      tauMin: 0,
      ultimateStrength: 1400e6,
      wireDiameterM: 0.002,
      staticAllowableShear: 0.56 * 1400e6,
      loadCycles: 1e4,
      enabled: true,
    });
    expect(short.allowableAmplitude).toBeLessThan(long.allowableAmplitude);
    expect(en13906LifeFactor(1e4)).toBeLessThan(en13906LifeFactor(1e7));
  });
});

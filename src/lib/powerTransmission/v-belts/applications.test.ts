import { describe, expect, it } from "vitest";
import {
  buildApplicationInsights,
  getApplicationProfile,
  resolveApplicationServiceFactor,
} from "./applications";
import { normalizePowerKw } from "./catalog";
import { solveVBeltDrive } from "./engine";

describe("VBelt applications", () => {
  it("assigns pump service factor in typical range", () => {
    const resolved = resolveApplicationServiceFactor(
      { applicationId: "pump", subTypeId: "centrifugal", operatingHoursPerDay: 24 },
      1.2,
      false
    );
    const profile = getApplicationProfile("pump");
    expect(resolved.factor).toBeGreaterThanOrEqual(profile.serviceFactorMin);
    expect(resolved.factor).toBeLessThanOrEqual(profile.serviceFactorMax);
    expect(resolved.source).toBe("application");
  });

  it("adds compressor-specific recommendations", () => {
    const base = solveVBeltDrive({
      power: normalizePowerKw(15, "hp"),
      speedDriver: 1750,
      speedDriven: 875,
      diameterDriver: 0.1,
      diameterDriven: 0.2,
      centerDistance: 0.5,
      serviceFactor: 1.5,
      beltFactor: 0.18,
      frictionCoeff: 0.5,
      beltSection: "B",
    });
    const insights = buildApplicationInsights(
      base,
      { applicationId: "compressor", subTypeId: "reciprocating", operatingHoursPerDay: 16 },
      1.7,
      "application"
    );
    expect(insights.applicationLabel).toBe("Compressor");
    expect(insights.recommendations.some((r) => r.includes("starting torque"))).toBe(true);
    expect(insights.estimatedBeltLifeHours).toBeGreaterThan(0);
  });
});

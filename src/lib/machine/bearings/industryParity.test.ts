import { describe, expect, it } from "vitest";
import { estimateFriction } from "./auxiliaryChecks";
import { recommendBearingFits, thermalClearanceChangeUm } from "./fitsClearance";
import { buildInterchangeCandidates } from "./interchangeTable";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import { eccentricityFromSommerfeld } from "@/lib/machine/plain-bearings/iso7902";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import { solveHousingEngine } from "@/lib/machine/housing/engine";
import { oilDynamicViscosityPas, findPlainBearingOil } from "@/data/catalogs/plainBearingOils";

describe("industry parity physics", () => {
  it("Mrr/Msl friction includes seal and grease churn factors", () => {
    const open = estimateFriction({
      equivalentLoadN: 5000,
      meanDiameterMm: 40,
      speedRpm: 1500,
      bearingType: "deep_groove",
      dynamicRatingN: 14000,
      lubricantType: "oil",
    });
    const sealedGrease = estimateFriction({
      equivalentLoadN: 5000,
      meanDiameterMm: 40,
      speedRpm: 1500,
      bearingType: "deep_groove",
      sealed: true,
      dynamicRatingN: 14000,
      lubricantType: "grease",
    });
    expect(open.model).toBe("skf_mrr_msl_screening");
    expect(open.rollingTorqueNm).toBeGreaterThan(0);
    expect(sealedGrease.frictionTorqueNm).toBeGreaterThan(open.frictionTorqueNm);
    expect(sealedGrease.greaseChurnFactor).toBeGreaterThan(1);
  });

  it("ring temperature differential changes operating clearance", () => {
    const cool = recommendBearingFits({
      boreMm: 25,
      radialLoadN: 3000,
      speedRpm: 1500,
      mountingRole: "either",
      clearance: "CN",
      ambientTempC: 20,
      innerRingTempC: 40,
      outerRingTempC: 35,
    });
    const hotInner = recommendBearingFits({
      boreMm: 25,
      radialLoadN: 3000,
      speedRpm: 1500,
      mountingRole: "either",
      clearance: "CN",
      ambientTempC: 20,
      innerRingTempC: 90,
      outerRingTempC: 40,
    });
    expect(hotInner.estimatedOperatingClearanceUm).toBeLessThan(cool.estimatedOperatingClearanceUm);
    expect(thermalClearanceChangeUm({ boreMm: 25, innerRingTempC: 90, outerRingTempC: 40 })).toBeGreaterThan(
      0
    );
  });

  it("builds cross-OEM interchange candidates for 6205", () => {
    const entry = findBearing("6205");
    expect(entry).toBeTruthy();
    const rows = buildInterchangeCandidates(entry!);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.entry.boreMm === entry!.boreMm)).toBe(true);
  });

  it("Raimondi–Boyd ε increases for shorter L/D at same S", () => {
    const S = 0.2;
    const eShort = eccentricityFromSommerfeld(S, 0.25);
    const eLong = eccentricityFromSommerfeld(S, 1.5);
    expect(eShort).toBeGreaterThan(eLong);
  });

  it("plain oil catalog drives temperature-dependent viscosity", () => {
    const oil = findPlainBearingOil("vg68");
    expect(oil).toBeTruthy();
    const mu40 = oilDynamicViscosityPas(oil!, 40);
    const mu80 = oilDynamicViscosityPas(oil!, 80);
    expect(mu80).toBeLessThan(mu40);

    const result = solvePlainBearingEngine({
      bearingType: "journal",
      diameter: 0.05,
      length: 0.04,
      clearance: 80e-6,
      load: 2500,
      speed: 1800,
      viscosity: 0.04,
      oilId: "vg68",
      materialId: "bronze_c932",
      ambientTempC: 40,
    });
    expect(result.lengthOverDiameter).toBeCloseTo(0.8, 1);
    expect(result.pvPaMs).toBeGreaterThan(0);
    expect(result.oilId).toBe("vg68");
  });

  it("housing reports body and bolt utilization", () => {
    const res = solveHousingEngine({
      boreDiameter: 0.05,
      radialLoad: 5000,
      axialLoad: 800,
      speed: 1500,
      mountStyle: "pillow_block",
      boltCount: 4,
      boltCircleDiameter: 0.14,
      yieldStress: 250e6,
    });
    expect(res.bodyUtilization).toBeGreaterThan(0);
    expect(res.boltUtilization).toBeGreaterThan(0);
    expect(res.bodyUtilization).toBeCloseTo(1 / res.bodySafetyFactor, 5);
  });
});

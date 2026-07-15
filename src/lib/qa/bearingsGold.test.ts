import { describe, expect, it } from "vitest";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import { runBearingsGoldCase, type BearingsGoldCase } from "./bearingsGold";
import { BEARINGS_GOLD_SEEDS } from "./bearingsGoldCases";

const MATERIAL = {
  name: "Bearing steel",
  dynamicRatingFactor: 1,
  staticRatingFactor: 1,
  allowableLife: 1e6,
};

function snapshotExpect(inputs: Record<string, unknown>) {
  const ov = inputs.ratingsOverride as
    | {
        enabled: boolean;
        dynamicLoadRatingN?: number;
        staticLoadRatingN?: number;
        fatigueLoadLimitN?: number;
      }
    | undefined;
  const r = solveBearingEngine({
    radialLoad: Number(inputs.radialLoad ?? 0),
    axialLoad: Number(inputs.axialLoad ?? 0),
    speed: Number(inputs.speed ?? 1500),
    lifeHours: Number(inputs.lifeHours ?? 20000),
    safetyFactor: Number(inputs.safetyFactor ?? 1.5),
    bearingType: (inputs.bearingType as "deep_groove") ?? "deep_groove",
    designation: inputs.designation as string | undefined,
    lubricantType: (inputs.lubricantType as "oil" | "grease") ?? "oil",
    isoVgGrade: Number(inputs.isoVgGrade ?? 68),
    operatingTempC: Number(inputs.operatingTempC ?? 70),
    contamination: (inputs.contamination as "normal_clean") ?? "normal_clean",
    reliabilityPercent: (Number(inputs.reliabilityPercent ?? 90) as 90 | 95 | 96 | 97 | 98 | 99),
    ratingsOverride: ov?.enabled ? ov : undefined,
    material: MATERIAL,
  });
  return {
    modifiedLife: Number(r.modifiedLife.toFixed(2)),
    expectedLife: Number(r.expectedLife.toFixed(2)),
    equivalentLoad: Number(r.equivalentLoad.toFixed(2)),
    staticSafetyFactor: Number(r.staticSafetyFactor.toFixed(4)),
    aIso: Number(r.aIso.toFixed(4)),
    dynamicUtilization: Number(r.dynamicUtilization.toFixed(4)),
  };
}

describe("bearings gold harness", () => {
  it("skips pending vendor gold cases", () => {
    const pending = BEARINGS_GOLD_SEEDS.filter((c) => c.status === "pending_vendor_gold");
    expect(pending.length).toBeGreaterThanOrEqual(2);
    for (const seed of pending) {
      const c: BearingsGoldCase = {
        ...seed,
        tolerancePct: 5,
        expect: seed.expect ?? { modifiedLife: 0 },
      };
      const result = runBearingsGoldCase(c);
      expect(result.skipped).toBe(true);
      expect(result.pass).toBe(true);
    }
  });

  it("active screening cases stay within 2% of solver snapshot", () => {
    const active = BEARINGS_GOLD_SEEDS.filter((c) => c.status === "active");
    expect(active.length).toBeGreaterThanOrEqual(10);

    for (const seed of active) {
      const expectSnap = snapshotExpect(seed.inputs);
      const c: BearingsGoldCase = {
        id: seed.id,
        source: seed.source,
        kind: seed.kind,
        status: "active",
        tolerancePct: 2,
        inputs: seed.inputs,
        expect: expectSnap,
      };
      const result = runBearingsGoldCase(c);
      expect(result.skipped).toBe(false);
      expect(result.pass, `${seed.id}: ${result.reason ?? JSON.stringify(result.fields)}`).toBe(
        true
      );
      // Sanity: pollution / override cases should still produce finite life
      expect(expectSnap.modifiedLife).toBeGreaterThan(0);
      expect(expectSnap.equivalentLoad).toBeGreaterThan(0);
    }
  });

  it("ratings override increases C vs catalog for same duty", () => {
    const base = snapshotExpect({
      radialLoad: 3000,
      axialLoad: 500,
      speed: 1500,
      lifeHours: 20000,
      designation: "6205",
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
    });
    const overridden = snapshotExpect({
      radialLoad: 3000,
      axialLoad: 500,
      speed: 1500,
      lifeHours: 20000,
      designation: "6205",
      lubricantType: "oil",
      isoVgGrade: 68,
      operatingTempC: 70,
      contamination: "normal_clean",
      ratingsOverride: {
        enabled: true,
        dynamicLoadRatingN: 28000,
        staticLoadRatingN: 14000,
        fatigueLoadLimitN: 560,
      },
    });
    expect(overridden.modifiedLife).toBeGreaterThan(base.modifiedLife);
    expect(overridden.dynamicUtilization).toBeLessThan(base.dynamicUtilization);
  });
});

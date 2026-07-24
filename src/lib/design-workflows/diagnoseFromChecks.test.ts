import { describe, expect, it } from "vitest";
import { diagnoseFromChecks } from "@/lib/design-workflows/diagnoseFromChecks";
import { diagnoseShaft } from "@/lib/machine/shafts/diagnosis";
import { diagnoseBeam } from "@/lib/structural/beams/diagnosis";

describe("diagnoseFromChecks", () => {
  it("returns empty diagnosis when no metrics exist", () => {
    const d = diagnoseFromChecks({ foo: 1 });
    expect(d.findings).toHaveLength(0);
    expect(d.summary).toMatch(/No safety metrics/i);
  });

  it("flags low safety factor as high risk", () => {
    const d = diagnoseFromChecks({ safetyFactor: 0.8, governingFailureMode: "Yield" });
    expect(d.overallRisk).toBe("high");
    expect(d.findings.length).toBeGreaterThan(0);
  });

  it("flags high utilization as high risk", () => {
    const d = diagnoseFromChecks({ stressUtilization: 1.2 });
    expect(d.overallRisk).toBe("high");
  });
});

describe("dedicated diagnose engines", () => {
  it("diagnoseShaft maps governing failure modes", () => {
    const d = diagnoseShaft({
      safetyFactor: 0.9,
      fatigueSafetyFactor: 1.1,
      deflectionUtilization: 0.5,
      slopeUtilization: 0.4,
      criticalSpeedMargin: 1.5,
      criticalSpeed: 3000,
      maxStress: 300e6,
      maxDeflection: 0.001,
      maxSlope: 0.001,
      governingFailureMode: "Static yield",
      isSafe: false,
    } as never);
    expect(d.overallRisk).toBe("high");
    expect(d.findings.some((f) => f.category === "static_strength")).toBe(true);
  });

  it("diagnoseBeam screens utilizations", () => {
    const d = diagnoseBeam({
      maxStress: 200e6,
      maxDeflection: 0.02,
      applicationContext: {
        stressUtilization: 1.1,
        deflectionUtilization: 0.5,
        allowableStress: 180e6,
        deflectionLimit: 0.025,
        deflectionLimitRatio: 250,
        standards: ["Eurocode"],
        fatigueSensitive: false,
      },
    } as never);
    expect(d.overallRisk).toBe("high");
  });
});

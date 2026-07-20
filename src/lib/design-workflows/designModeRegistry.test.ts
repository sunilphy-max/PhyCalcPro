import { describe, expect, it } from "vitest";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";

describe("runModuleDesignMode routing", () => {
  it("routes bearings category to bearing catalog selection (not frame sections)", () => {
    const result = runModuleDesignMode("bearings", {
      maxForce: 6200,
      axialLoad: 0,
      speedDriver: 1500,
      requiredLife: 20000,
      targetSafetyFactor: 1.5,
      bearingType: "deep_groove",
      bearingManufacturer: "SKF",
    });

    expect(result).toBeDefined();
    expect(result!.method).toMatch(/bearing|ISO 281/i);
    expect(result!.best).not.toBeNull();
    expect(result!.best!.fields.designation).toBeTruthy();
    expect(result!.best!.fields).not.toHaveProperty("sectionDesignation");
    expect(result!.ranked.length).toBeGreaterThan(0);
  });

  it("routes plain-bearings and housing through machine design", () => {
    const plain = runModuleDesignMode("plain-bearings", {
      maxForce: 8000,
      speedDriver: 900,
    });
    expect(plain?.method).toMatch(/journal|film/i);
    expect(plain?.best?.fields.diameter).toBeTypeOf("number");

    const housing = runModuleDesignMode("housing", {
      diameter: 0.04,
      maxForce: 5000,
    });
    expect(housing?.method).toMatch(/bolt|housing/i);
  });
});

describe("next-tier design field units", () => {
  it("welds returns weldSize in meters to match form state", () => {
    const result = runModuleDesignMode("welds", {
      shearForce: 20000,
      axialLoad: 0,
      length: 0.15,
      weldCount: 2,
      eccentricity: 0,
      targetSafetyFactor: 1.5,
    });
    expect(result?.best).not.toBeNull();
    const size = result!.best!.fields.weldSize as number;
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(0.05); // meters, not mm digits
  });

  it("combined-loading returns round diameter in meters", () => {
    const result = runModuleDesignMode("combined-loading", {
      axialLoad: 25000,
      bendingMoment: 800,
      torque: 400,
      shearForce: 5000,
      targetSafetyFactor: 1.5,
      allowableStressPa: 250e6,
    });
    expect(result?.best).not.toBeNull();
    expect(result!.method).toMatch(/round|diameter/i);
    const d = result!.best!.fields.diameter as number | undefined;
    const w = result!.best!.fields.width as number;
    const h = result!.best!.fields.height as number;
    if (d != null) {
      expect(d).toBeGreaterThan(0.01);
      expect(d).toBeLessThan(0.5);
    } else {
      expect(w).toBeCloseTo(h, 6);
      expect(w).toBeGreaterThan(0.01);
      expect(w).toBeLessThan(0.5);
    }
  });

  it("fatigue ranks diameter candidates for target life", () => {
    const result = runModuleDesignMode("fatigue", {
      stressAmplitude: 180e6,
      meanStress: 50e6,
      ultimateStrength: 600e6,
      enduranceLimit: 200e6,
      targetCycles: 1e6,
      targetSafetyFactor: 1.5,
    });
    expect(result?.best).not.toBeNull();
    expect(result!.ranked.length).toBeGreaterThan(1);
    const diameters = result!.ranked
      .map((r) => r.fields.characteristicDiameterMm ?? r.fields.diameterMm)
      .filter((v): v is number => typeof v === "number");
    expect(diameters.length).toBeGreaterThan(0);
  });

  it("pipes returns thickness in meters", () => {
    const result = runModuleDesignMode("pipes", {
      pressure: 2.5e6,
      length: 0.05, // radius
      allowableStressPa: 138e6,
    });
    expect(result?.best).not.toBeNull();
    const t = result!.best!.fields.thickness as number;
    expect(t).toBeGreaterThan(0.001);
    expect(t).toBeLessThan(0.05);
  });

  it("flywheels returns outerDiameter and thickness in meters", () => {
    const result = runModuleDesignMode("flywheels", {
      speedDriver: 1500,
      energy: 5000,
    });
    expect(result?.best).not.toBeNull();
    const od = result!.best!.fields.outerDiameter as number;
    const th = result!.best!.fields.thickness as number;
    expect(od).toBeGreaterThan(0.1);
    expect(od).toBeLessThan(2);
    expect(th).toBeGreaterThan(0.01);
    expect(th).toBeLessThan(0.2);
  });
});

import { describe, expect, it } from "vitest";
import { solveVdi2230 } from "./vdi2230";

/**
 * Benchmark: VDI 2230-1 Tables A1/A2 list for an M12 coarse bolt, class 8.8,
 * μG = μK = 0.12, ν = 0.9: FM,zul ≈ 41.9 kN and MA ≈ 87 N·m. The closed-form
 * worksheet here reproduces those within a few percent (table values use
 * exact ISO 898-1 stress areas and rounded friction geometry).
 */
describe("VDI 2230 single-bolt worksheet — M12 8.8 vs Table A1/A2", () => {
  const result = solveVdi2230({
    size: "M12",
    propertyClass: "8.8",
    clampLength: 0.04,
    jointModulus: 205e9,
    axialLoad: 15000,
    transverseLoad: 5000,
    threadFriction: 0.12,
    headFriction: 0.12,
    interfaceFriction: 0.12,
    tighteningMethod: "torque_wrench",
  });

  it("computes the ISO 724 stress area As ≈ 84.3 mm²", () => {
    expect(result.stressArea * 1e6).toBeGreaterThan(84.0);
    expect(result.stressArea * 1e6).toBeLessThan(84.6);
  });

  it("computes FM,zul within 5% of the 41.9 kN table value", () => {
    expect(result.assemblyPreloadMax / 41900).toBeGreaterThan(0.95);
    expect(result.assemblyPreloadMax / 41900).toBeLessThan(1.05);
  });

  it("computes tightening torque MA in the published 80–95 N·m band", () => {
    expect(result.tighteningTorque).toBeGreaterThan(75);
    expect(result.tighteningTorque).toBeLessThan(95);
  });

  it("keeps the load factor Φ in the physical 0–n range", () => {
    expect(result.loadFactor).toBeGreaterThan(0);
    expect(result.loadFactor).toBeLessThan(0.5);
  });

  it("residual clamp force = FM,min − (1−Φ)·FA − FZ", () => {
    const expected =
      result.assemblyPreloadMin -
      (1 - result.loadFactor) * 15000 -
      result.embeddingLoss;
    expect(result.residualClampForce).toBeCloseTo(expected, 0);
    expect(result.residualClampForce).toBeGreaterThan(0);
  });

  it("computes the slip safety factor FKR/(FQ/μT)", () => {
    const required = 5000 / 0.12;
    expect(result.requiredClampForce).toBeCloseTo(required, 0);
    expect(result.slipSafetyFactor).toBeCloseTo(result.residualClampForce / required, 3);
  });

  it("computes thread endurance σASV = 0.85·(150/d + 45) MPa ≈ 48.9 MPa for M12", () => {
    expect(result.enduranceLimit / 1e6).toBeCloseTo(0.85 * (150 / 12 + 45), 1);
  });

  it("keeps assembly utilization near ν = 0.9 of Rp0.2 including torsion", () => {
    // At assembly σred = 0.9·Rp0.2 by construction; service adds Φ·FA axially
    // but retains only 50% torsion, so utilization stays in a 0.75–1.0 band.
    expect(result.workingStressUtilization).toBeGreaterThan(0.75);
    expect(result.workingStressUtilization).toBeLessThan(1.0);
  });

  it("computes head bearing pressure FM,zul / (π/4·(dw²−dh²))", () => {
    const area = (Math.PI / 4) * (0.0166 ** 2 - 0.0135 ** 2);
    expect(result.surfacePressure).toBeCloseTo(result.assemblyPreloadMax / area, -3);
  });
});

describe("VDI 2230 scatter and method sensitivity", () => {
  const base = {
    size: "M10",
    propertyClass: "10.9" as const,
    clampLength: 0.03,
    jointModulus: 205e9,
    axialLoad: 10000,
  };

  it("yield-controlled tightening gives higher FM,min than torque wrench", () => {
    const yieldCtl = solveVdi2230({ ...base, tighteningMethod: "yield_controlled" });
    const wrench = solveVdi2230({ ...base, tighteningMethod: "torque_wrench" });
    expect(yieldCtl.assemblyPreloadMax).toBeCloseTo(wrench.assemblyPreloadMax, 0);
    expect(yieldCtl.assemblyPreloadMin).toBeGreaterThan(wrench.assemblyPreloadMin);
  });

  it("higher property class scales preload with Rp0.2", () => {
    const c88 = solveVdi2230({ ...base, propertyClass: "8.8" });
    const c109 = solveVdi2230({ ...base, propertyClass: "10.9" });
    expect(c109.assemblyPreloadMax / c88.assemblyPreloadMax).toBeCloseTo(940 / 640, 2);
  });

  it("throws for unknown sizes", () => {
    expect(() => solveVdi2230({ ...base, size: "M7" })).toThrow();
  });
});

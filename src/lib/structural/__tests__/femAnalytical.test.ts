import { describe, expect, it } from "vitest";
import { solveBeamEngine } from "@/lib/structural/beams/engine";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import { solvePlateEngine } from "@/lib/structural/plates/engine";
import { solveVibrationFEM } from "@/lib/dynamics/vibrations/solver";

const E = 210e9;
const I = 8.33e-6; // ~100x100 mm square section, I = bh³/12
const L = 4;

function relErr(actual: number, expected: number) {
  return Math.abs(actual - expected) / Math.abs(expected);
}

describe("beam FEM vs closed-form solutions (Roark / Gere)", () => {
  it("simply supported beam, center point load: δ = PL³/(48EI), M = PL/4", () => {
    const P = 10_000;
    const result = solveBeamEngine({
      length: L,
      E,
      I,
      c: 0.05,
      support: "simply_supported",
      meshSegments: 40,
      loads: [{ id: "p1", type: "point", value: P, position: L / 2 }],
    });
    expect(relErr(result.maxDeflection, (P * L ** 3) / (48 * E * I))).toBeLessThan(0.01);
    expect(relErr(result.maxMoment, (P * L) / 4)).toBeLessThan(0.01);
    expect(relErr(result.maxShear, P / 2)).toBeLessThan(0.02);
  });

  it("simply supported beam, UDL: δ = 5wL⁴/(384EI), M = wL²/8", () => {
    const w = 5_000;
    const result = solveBeamEngine({
      length: L,
      E,
      I,
      c: 0.05,
      support: "simply_supported",
      meshSegments: 40,
      loads: [{ id: "u1", type: "udl", value: w, start: 0, end: L }],
    });
    expect(relErr(result.maxDeflection, (5 * w * L ** 4) / (384 * E * I))).toBeLessThan(0.01);
    expect(relErr(result.maxMoment, (w * L ** 2) / 8)).toBeLessThan(0.01);
  });

  it("cantilever, end point load: δ = PL³/(3EI), M = PL", () => {
    const P = 10_000;
    const result = solveBeamEngine({
      length: L,
      E,
      I,
      c: 0.05,
      support: "cantilever",
      meshSegments: 40,
      loads: [{ id: "p1", type: "point", value: P, position: L }],
    });
    expect(relErr(result.maxDeflection, (P * L ** 3) / (3 * E * I))).toBeLessThan(0.01);
    expect(relErr(result.maxMoment, P * L)).toBeLessThan(0.01);
  });

  it("fixed-fixed beam, UDL: δ = wL⁴/(384EI), M_support = wL²/12", () => {
    const w = 5_000;
    const result = solveBeamEngine({
      length: L,
      E,
      I,
      c: 0.05,
      support: "fixed_fixed",
      meshSegments: 40,
      loads: [{ id: "u1", type: "udl", value: w, start: 0, end: L }],
    });
    expect(relErr(result.maxDeflection, (w * L ** 4) / (384 * E * I))).toBeLessThan(0.01);
    expect(relErr(result.maxMoment, (w * L ** 2) / 12)).toBeLessThan(0.02);
  });

  it("converges with mesh refinement (UDL deflection error shrinks)", () => {
    const w = 5_000;
    const exact = (5 * w * L ** 4) / (384 * E * I);
    const run = (meshSegments: number) =>
      solveBeamEngine({
        length: L,
        E,
        I,
        c: 0.05,
        support: "simply_supported",
        meshSegments,
        loads: [{ id: "u1", type: "udl", value: w, start: 0, end: L }],
      }).maxDeflection;
    const coarse = relErr(run(4), exact);
    const fine = relErr(run(40), exact);
    expect(fine).toBeLessThanOrEqual(coarse + 1e-12);
    expect(fine).toBeLessThan(0.005);
  });

  it("satisfies static equilibrium (reactions balance applied loads)", () => {
    const result = solveBeamEngine({
      length: L,
      E,
      I,
      c: 0.05,
      support: "simply_supported",
      meshSegments: 40,
      loads: [{ id: "p1", type: "point", value: 10_000, position: 1.3 }],
    });
    expect(result.physicsChecks?.staticEquilibriumResidual ?? Infinity).toBeLessThan(1);
  });
});

describe("column buckling vs Euler closed form", () => {
  it("pinned-pinned: Pcr = π²EI/L²", () => {
    const result = solveBucklingEngine({
      length: L,
      E,
      I,
      A: 0.01,
      P: 100_000,
      endCondition: "pinned",
    } as Parameters<typeof solveBucklingEngine>[0]);
    const exact = (Math.PI ** 2 * E * I) / L ** 2;
    expect(relErr(result.Pcr, exact)).toBeLessThan(0.001);
  });

  it("fixed-fixed: Pcr = π²EI/(0.5L)²", () => {
    const result = solveBucklingEngine({
      length: L,
      E,
      I,
      A: 0.01,
      P: 100_000,
      endCondition: "fixed",
    } as Parameters<typeof solveBucklingEngine>[0]);
    const exact = (Math.PI ** 2 * E * I) / (0.5 * L) ** 2;
    expect(relErr(result.Pcr, exact)).toBeLessThan(0.001);
  });
});

describe("plate FEM vs Timoshenko/Roark thin-plate coefficients", () => {
  // Square plate a = 1 m, t = 10 mm, q = 10 kPa, ν = 0.3
  // D = E·t³/(12(1−ν²)); w_max = α·q·a⁴/D with α = 0.00406 (SSSS), 0.00126 (CCCC)
  const a = 1;
  const t = 0.01;
  const q = 10_000;
  const nu = 0.3;
  const D = (E * t ** 3) / (12 * (1 - nu * nu));

  it("simply supported square plate center deflection (α = 0.00406)", () => {
    const result = solvePlateEngine({
      length: a,
      width: a,
      thickness: t,
      E,
      nu,
      q,
      elementsX: 16,
      elementsY: 16,
      boundaryType: "simply_supported",
    });
    const exact = (0.00406 * q * a ** 4) / D;
    expect(relErr(result.maxDeflection, exact)).toBeLessThan(0.05);
  });

  it("clamped square plate center deflection (α = 0.00126)", () => {
    const result = solvePlateEngine({
      length: a,
      width: a,
      thickness: t,
      E,
      nu,
      q,
      elementsX: 16,
      elementsY: 16,
      boundaryType: "clamped",
    });
    const exact = (0.00126 * q * a ** 4) / D;
    expect(relErr(result.maxDeflection, exact)).toBeLessThan(0.05);
  });
});

describe("modal analysis vs Euler-Bernoulli closed form", () => {
  const A = 0.01;
  const rho = 7850;

  it("simply supported beam: f_n = (nπ/L)²·√(EI/ρA)/(2π)", () => {
    const result = solveVibrationFEM({
      length: L,
      E,
      I,
      A,
      rho,
      segments: 40,
      support: "simply_supported",
    });
    const base = Math.sqrt((E * I) / (rho * A));
    for (let n = 1; n <= 3; n++) {
      const exact = (((n * Math.PI) / L) ** 2 * base) / (2 * Math.PI);
      expect(relErr(result.frequencies[n - 1], exact)).toBeLessThan(0.01);
    }
  });

  it("cantilever first mode: λ₁ = 1.8751, f₁ = λ₁²/(2π·L²)·√(EI/ρA)", () => {
    const result = solveVibrationFEM({
      length: L,
      E,
      I,
      A,
      rho,
      segments: 40,
      support: "cantilever",
    });
    const base = Math.sqrt((E * I) / (rho * A));
    const exact = (1.875104 ** 2 / L ** 2) * base / (2 * Math.PI);
    expect(relErr(result.frequencies[0], exact)).toBeLessThan(0.01);
  });
});

import { describe, expect, it } from "vitest";
import { solveBeamEngine } from "./engine";

describe("beam FEM", () => {
  it("simply supported central load: M_max ≈ PL/4", () => {
    const P = 10000;
    const L = 5;
    const res = solveBeamEngine({
      length: L,
      E: 210e9,
      I: 5e-5,
      c: 0.1,
      support: "simply_supported",
      meshSegments: 40,
      loads: [{ id: "p1", type: "point", value: P, position: L / 2 }],
    });
    expect(res.maxMoment).toBeGreaterThan((P * L) / 4 * 0.95);
    expect(res.maxMoment).toBeLessThan((P * L) / 4 * 1.05);
  });

  it("intermediate support reduces midspan moment vs single span", () => {
    const w = 2000;
    const L = 6;
    const single = solveBeamEngine({
      length: L,
      E: 210e9,
      I: 5e-5,
      c: 0.1,
      support: "simply_supported",
      meshSegments: 60,
      loads: [{ id: "u1", type: "udl", value: w, start: 0, end: L }],
    });
    const continuous = solveBeamEngine({
      length: L,
      E: 210e9,
      I: 5e-5,
      c: 0.1,
      supports: [
        { id: "a", x: 0, kind: "pin" },
        { id: "b", x: L / 2, kind: "roller" },
        { id: "c", x: L, kind: "roller" },
      ],
      meshSegments: 60,
      loads: [{ id: "u1", type: "udl", value: w, start: 0, end: L }],
    });
    // Two equal spans under UDL: peak |M| is well below single-span wL²/8
    expect(continuous.maxMoment).toBeLessThan(single.maxMoment * 0.55);
    expect(continuous.supportReactions?.length).toBe(3);
    const totalLoad = w * L;
    const sumFy = continuous.supportReactions!.reduce((a, r) => a + r.Fy, 0);
    expect(Math.abs(sumFy - totalLoad)).toBeLessThan(totalLoad * 0.02);
  });

  it("triangular load equilibrium closes", () => {
    const L = 4;
    const res = solveBeamEngine({
      length: L,
      E: 200e9,
      I: 2e-5,
      c: 0.08,
      support: "simply_supported",
      meshSegments: 40,
      loads: [
        {
          id: "t1",
          type: "triangular",
          wStart: 0,
          wEnd: 2000,
          start: 0,
          end: L,
        },
      ],
    });
    expect(res.physicsChecks?.staticEquilibriumResidual ?? 999).toBeLessThan(50);
    expect(res.maxMoment).toBeGreaterThan(0);
  });
});

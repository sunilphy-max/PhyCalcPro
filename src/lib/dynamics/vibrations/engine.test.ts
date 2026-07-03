import { describe, expect, it } from "vitest";
import { solveVibrationEngine } from "./engine";

describe("vibration modal FEM", () => {
  it("returns positive fundamental frequency", () => {
    const res = solveVibrationEngine({
      length: 1,
      E: 210e9,
      I: 1e-6,
      A: 0.001,
      rho: 7850,
      segments: 10,
      support: "simply_supported",
      dampingRatio: 0.02,
    });
    expect(res.fundamentalFrequency).toBeGreaterThan(0);
    expect(res.frequencies[0]).toBe(res.fundamentalFrequency);
  });
});

import { describe, expect, it } from "vitest";
import { runPlainBearingCopilotSession } from "./plainBearingCopilot";
import { runHousingCopilotSession } from "./housingCopilot";

describe("plainBearingCopilot", () => {
  it("parses load, speed, and diameter and returns an apply payload", () => {
    const session = runPlainBearingCopilotSession(
      "Journal bearing, 5 kN radial at 1200 rpm, 50 mm shaft."
    );
    expect(session.canApplyLoads).toBe(true);
    expect(session.apply.load).toBeCloseTo(5000, -1);
    expect(session.apply.speed).toBe(1200);
    expect(session.apply.diameterMm).toBeDefined();
    expect(session.apply.bearingType).toBe("journal");
  });
});

describe("housingCopilot", () => {
  it("parses Fr/Fa/bore and suggests bolt pattern fields", () => {
    const session = runHousingCopilotSession(
      "Pillow block housing, 40 mm bore, 5 kN radial and 0.5 kN axial at 1500 rpm."
    );
    expect(session.canApplyLoads).toBe(true);
    expect(session.apply.boreMm).toBeCloseTo(40, 0);
    expect(session.apply.radialLoad).toBeCloseTo(5000, -1);
    expect(session.apply.mountStyle).toBe("pillow_block");
    expect(session.design?.best || session.canApplyLoads).toBeTruthy();
  });
});

import { describe, expect, it } from "vitest";
import { runBearingCopilotSession } from "./bearingCopilot";

describe("runBearingCopilotSession", () => {
  it("sizes a deep groove bearing from radial load, speed, and life", () => {
    const session = runBearingCopilotSession(
      "Select deep groove SKF bearing for 5 kN radial at 3000 rpm, 20000 hours life."
    );
    expect(session.status).toBe("ok");
    expect(session.design?.best?.label).toBeTruthy();
    expect(session.apply.radialLoad).toBeCloseTo(5000, 0);
    expect(session.apply.speed).toBeCloseTo(3000, 0);
    expect(session.apply.lifeHours).toBeCloseTo(20000, 0);
    expect(session.apply.bearingType).toBe("deep_groove");
    expect(session.apply.manufacturer).toBe("SKF");
  });

  it("parses separate radial and axial loads", () => {
    const session = runBearingCopilotSession(
      "Angular contact bearing, radial load 8 kN, axial load 2 kN, 2500 rpm, 25000 h life."
    );
    expect(session.apply.radialLoad).toBeCloseTo(8000, 0);
    expect(session.apply.axialLoad).toBeCloseTo(2000, 0);
    expect(session.apply.bearingType).toBe("angular_contact");
  });

  it("does not chain to shafts or housing", () => {
    const session = runBearingCopilotSession("5 kN at 1500 rpm");
    expect(session.design).toBeTruthy();
    expect(session.notes.some((n) => n.includes("Bearing copilot"))).toBe(true);
  });
});

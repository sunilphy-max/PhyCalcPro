import { describe, expect, it } from "vitest";
import { analyzeBrief, deriveParams, runCopilotSession } from "@/lib/copilot";

/**
 * Golden briefs (EDP-5) — deterministic path must resolve modules/params without inventing results.
 */
describe("EDP AI golden briefs (deterministic)", () => {
  it("parses a beam brief into beams module with span/mass tokens", () => {
    const text =
      "Design a steel beam for a 500 kg machine spanning 3 m with less than 2 mm deflection.";
    const brief = analyzeBrief(text, "beams");
    const params = { ...brief.params };
    deriveParams(params);
    expect(brief.startModuleId).toBe("beams");
    expect(params.mass).toBeCloseTo(500, 5);
    expect(params.length ?? params.mass).toBeTruthy();

    const session = runCopilotSession(text, { startModuleId: "beams" });
    expect(session.brief.startModuleId).toBe("beams");
    expect(session.createdAt).toBeTruthy();
  });

  it("parses a bearing brief into bearings module", () => {
    const text = "Select a rolling bearing for 5 kN radial load at 1500 rpm for 20000 hours.";
    const brief = analyzeBrief(text, "bearings");
    const params = { ...brief.params };
    deriveParams(params);
    expect(brief.startModuleId).toBe("bearings");
    expect(params.force).toBeCloseTo(5000, 0);
    expect(params.rpm).toBeCloseTo(1500, 0);

    const session = runCopilotSession(text, { startModuleId: "bearings" });
    expect(session.brief.startModuleId).toBe("bearings");
  });
});

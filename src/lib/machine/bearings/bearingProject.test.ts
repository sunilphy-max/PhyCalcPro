import { describe, expect, it } from "vitest";
import {
  DESIGN_STAGE_ORDER,
  defaultStageForIntent,
  defaultStageForJob,
  designerHref,
  intentFromJob,
  mountingFromTopology,
  parseBearingJob,
  parseDesignerIntent,
  parseDesignerStage,
  resolveBearingJob,
  stagesForIntent,
  stagesForJob,
  stationsFromMountingSystem,
  toEngineMountingFields,
  topologyFromMounting,
  workflowModeFromJob,
} from "./bearingProject";

describe("bearingProject", () => {
  it("parses designer intent and panel deep links", () => {
    expect(parseDesignerIntent("service")).toBe("service");
    expect(parseDesignerIntent(null)).toBe("design");
    expect(parseDesignerStage("duty")).toBe("duty");
    expect(parseDesignerStage("requirements")).toBe("duty");
    expect(parseDesignerStage("loads")).toBe("duty");
    expect(parseDesignerStage("life")).toBe("verify");
    expect(parseDesignerStage("arrangement")).toBe("system");
    expect(parseDesignerStage("failure")).toBe("verify");
  });

  it("resolves BearingJob from job / mode / intent", () => {
    expect(parseBearingJob("autoDesign")).toBe("autoDesign");
    expect(parseBearingJob("validate")).toBe("validate");
    expect(resolveBearingJob({ job: "compare" })).toBe("compare");
    expect(resolveBearingJob({ mode: "check" })).toBe("validate");
    expect(resolveBearingJob({ intent: "service" })).toBe("diagnose");
    expect(intentFromJob("diagnose")).toBe("service");
    expect(workflowModeFromJob("autoDesign")).toBe("design");
    expect(defaultStageForJob("validate")).toBe("size");
    expect(defaultStageForJob("diagnose")).toBe("system");
  });

  it("builds designer href with job + legacy aliases", () => {
    const href = designerHref({ job: "validate", panel: "size", extra: { designation: "6205" } });
    expect(href).toContain("job=validate");
    expect(href).toContain("mode=check");
    expect(href).toContain("intent=design");
    expect(href).toContain("panel=size");
    expect(href).toContain("designation=6205");
  });

  it("orders design stages like PhyCalc selection (requirements first)", () => {
    expect(DESIGN_STAGE_ORDER[0]).toBe("duty");
    expect(stagesForIntent("design").map((s) => s.id)).toEqual(DESIGN_STAGE_ORDER);
    expect(stagesForJob("autoDesign").map((s) => s.id)).toEqual(DESIGN_STAGE_ORDER);
    expect(defaultStageForIntent("design")).toBe("duty");
    expect(defaultStageForIntent("service")).toBe("system");
    expect(stagesForIntent("service")[0]?.id).toBe("system");
  });

  it("builds dynamic station lists from topology", () => {
    const single = stationsFromMountingSystem("single", "single", {
      designation: "6205",
      bearingType: "deep_groove",
    });
    expect(single).toHaveLength(1);
    expect(single[0]?.role).toBe("single");

    const pair = stationsFromMountingSystem("locating_dg_floating_nu", "single", {
      designation: "6208",
      floatingDesignation: "NU208",
      stationRadialLoadsN: [3000, 2500],
    });
    expect(pair).toHaveLength(2);
    expect(pair[0]?.role).toBe("locating");
    expect(pair[1]?.role).toBe("floating");
    expect(pair[0]?.radialLoadN).toBe(3000);

    const duplex = stationsFromMountingSystem("duplex_angular", "back_to_back", {
      designation: "7205",
    });
    expect(duplex).toHaveLength(2);
    expect(duplex[0]?.role).toBe("duplex_a");
  });

  it("maps topology presets to mounting systems and engine fields", () => {
    expect(topologyFromMounting("single")).toBe("single");
    expect(mountingFromTopology("duplex", "single")).toBe("duplex_angular");
    expect(mountingFromTopology("locating_floating", "locating_ac_floating_nu")).toBe(
      "locating_ac_floating_nu"
    );
    expect(toEngineMountingFields("locating_ac_floating_nu")).toEqual({
      mountingSystem: "locating_floating",
      locatingBearingType: "angular_contact",
      floatingBearingType: "cylindrical_roller",
    });
    expect(toEngineMountingFields("duplex_angular").mountingSystem).toBe("duplex");
  });
});

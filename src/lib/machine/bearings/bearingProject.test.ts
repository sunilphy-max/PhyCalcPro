import { describe, expect, it } from "vitest";
import {
  DESIGN_STAGE_ORDER,
  defaultStageForIntent,
  mountingFromTopology,
  parseDesignerIntent,
  parseDesignerStage,
  stagesForIntent,
  stationsFromMountingSystem,
  topologyFromMounting,
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

  it("orders design stages like PhyCalc selection (requirements first)", () => {
    expect(DESIGN_STAGE_ORDER[0]).toBe("duty");
    expect(stagesForIntent("design").map((s) => s.id)).toEqual(DESIGN_STAGE_ORDER);
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

  it("maps topology presets to mounting systems", () => {
    expect(topologyFromMounting("single")).toBe("single");
    expect(mountingFromTopology("duplex", "single")).toBe("duplex_angular");
    expect(mountingFromTopology("locating_floating", "locating_ac_floating_nu")).toBe(
      "locating_ac_floating_nu"
    );
  });
});

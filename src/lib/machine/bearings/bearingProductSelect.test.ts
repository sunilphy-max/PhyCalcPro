import { describe, expect, it } from "vitest";
import {
  BEARING_SIBLING_PATHS,
  BEARING_START_MODE_CARDS,
  parseWorkflowModeParam,
} from "./bearingProductSelect";

describe("bearingProductSelect", () => {
  it("exposes four start jobs matching Auto-design / Validate / Compare / Diagnose", () => {
    expect(BEARING_START_MODE_CARDS.map((c) => c.id)).toEqual([
      "design",
      "check",
      "select",
      "diagnose",
    ]);
    expect(BEARING_START_MODE_CARDS.map((c) => c.job)).toEqual([
      "autoDesign",
      "validate",
      "compare",
      "diagnose",
    ]);
    expect(BEARING_START_MODE_CARDS.every((c) => c.href.includes("job="))).toBe(true);
    expect(BEARING_START_MODE_CARDS.every((c) => c.href.includes("mode="))).toBe(true);
  });

  it("lists sibling tools without Designer duplicates", () => {
    expect(BEARING_SIBLING_PATHS.map((p) => p.id)).toEqual(["catalog", "plain", "housing"]);
  });

  it("parses mode query aliases", () => {
    expect(parseWorkflowModeParam("autodesign")).toBe("design");
    expect(parseWorkflowModeParam("validate")).toBe("check");
    expect(parseWorkflowModeParam("compare")).toBe("select");
    expect(parseWorkflowModeParam("diagnose")).toBe("diagnose");
    expect(parseWorkflowModeParam("nope")).toBeNull();
  });
});

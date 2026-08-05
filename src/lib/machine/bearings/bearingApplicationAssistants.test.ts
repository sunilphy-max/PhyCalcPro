import { describe, expect, it } from "vitest";
import {
  answersFromSearchParams,
  answersToQueryParams,
  assistantToDesignerHref,
  bearingAssistantExamples,
  bearingAssistantHubCards,
  BEARING_APPLICATION_ASSISTANTS,
  defaultAssistantAnswers,
  estimateMotorRadialN,
  getBearingAssistant,
  parseAssistantId,
  toAssistantApplyPayload,
} from "./bearingApplicationAssistants";

describe("bearingApplicationAssistants", () => {
  it("registers six v1 machine assistants", () => {
    expect(BEARING_APPLICATION_ASSISTANTS.map((a) => a.id)).toEqual([
      "motor",
      "pump",
      "fan",
      "gearbox",
      "conveyor",
      "ballscrew",
    ]);
  });

  it("parses assistant ids", () => {
    expect(parseAssistantId("motor")).toBe("motor");
    expect(parseAssistantId("nope")).toBeNull();
  });

  it("maps motor defaults to high_speed DE/NDE payload", () => {
    const assistant = getBearingAssistant("motor")!;
    const payload = toAssistantApplyPayload("motor", defaultAssistantAnswers(assistant));
    expect(payload.applicationProfile).toBe("high_speed");
    expect(payload.bearingType).toBe("deep_groove");
    expect(payload.mountingSystem).toBe("locating_dg_floating_nu");
    expect(payload.speed).toBe(1500);
    expect(payload.maxBoreMm).toBe(25);
    expect(payload.radialLoad).toBeGreaterThan(0);
    expect(payload.sealFilter).toBe("sealed");
  });

  it("estimates motor Fr when radial is zero", () => {
    const estimated = estimateMotorRadialN(7.5, 1500, 25);
    const payload = toAssistantApplyPayload("motor", {
      boreMm: 25,
      powerKw: 7.5,
      rpm: 1500,
      radialLoadN: 0,
      axialLoadN: 0,
      lifeHours: 20000,
      lube: "grease",
    });
    expect(payload.radialLoad).toBeCloseTo(estimated, 0);
  });

  it("honors explicit motor Fr", () => {
    const payload = toAssistantApplyPayload("motor", {
      boreMm: 25,
      powerKw: 7.5,
      rpm: 1500,
      radialLoadN: 2500,
      axialLoadN: 100,
      lifeHours: 20000,
      lube: "oil",
    });
    expect(payload.radialLoad).toBe(2500);
    expect(payload.axialLoad).toBe(100);
    expect(payload.lubricantType).toBe("oil");
    expect(payload.sealFilter).toBe("open");
  });

  it("maps ballscrew to duplex angular contact", () => {
    const assistant = getBearingAssistant("ballscrew")!;
    const payload = toAssistantApplyPayload(
      "ballscrew",
      defaultAssistantAnswers(assistant)
    );
    expect(payload.bearingType).toBe("angular_contact");
    expect(payload.mountingSystem).toBe("duplex_angular");
    expect(payload.arrangement).toBe("back_to_back");
  });

  it("maps gearbox shock duty to spherical / single", () => {
    const payload = toAssistantApplyPayload("gearbox", {
      boreMm: 50,
      rpm: 1200,
      radialLoadN: 12000,
      axialLoadN: 4000,
      shock: "shock",
      lifeHours: 30000,
    });
    expect(payload.bearingType).toBe("spherical_roller");
    expect(payload.applicationProfile).toBe("heavy_shock");
    expect(payload.mountingSystem).toBe("single");
  });

  it("builds designer href with assistant and answer query params", () => {
    const href = assistantToDesignerHref("motor", {
      boreMm: 30,
      rpm: 1800,
      powerKw: 11,
      radialLoadN: 0,
      axialLoadN: 0,
      lifeHours: 20000,
      lube: "grease",
    });
    expect(href).toContain("/products/bearings/designer?");
    expect(href).toContain("assistant=motor");
    expect(href).toContain("mode=design");
    expect(href).toContain("a_boreMm=30");
    expect(href).toContain("a_rpm=1800");
    expect(href).toContain("panel=system");
  });

  it("round-trips answer query params", () => {
    const params = answersToQueryParams({ boreMm: 40, lube: "oil" });
    const back = answersFromSearchParams(params);
    expect(back.boreMm).toBe(40);
    expect(back.lube).toBe("oil");
  });

  it("exposes hub cards and examples for all assistants", () => {
    expect(bearingAssistantHubCards()).toHaveLength(6);
    expect(bearingAssistantExamples().every((e) => e.href.includes("/assistant/"))).toBe(
      true
    );
  });
});

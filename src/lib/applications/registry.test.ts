import { describe, expect, it } from "vitest";
import {
  getDefaultPresetId,
  getPresetsForModule,
  groupPresetsByDesignCode,
  moduleSupportsApplicationPreset,
} from "./registry";

describe("application preset registry", () => {
  it("supports engineering modules but not reference tools", () => {
    expect(moduleSupportsApplicationPreset("beams")).toBe(true);
    expect(moduleSupportsApplicationPreset("columns")).toBe(true);
    expect(moduleSupportsApplicationPreset("unit-converter")).toBe(false);
    expect(moduleSupportsApplicationPreset("v-belts")).toBe(false);
  });

  it("provides beam-specific presets", () => {
    const presets = getPresetsForModule("beams");
    expect(presets.some((p) => p.id === "lifting_beam")).toBe(true);
    expect(presets.length).toBeGreaterThan(5);
  });

  it("groups presets by design code", () => {
    const presets = getPresetsForModule("columns");
    const { recommended, other } = groupPresetsByDesignCode(presets, "US");
    expect(recommended.some((p) => p.designCodes.includes("US"))).toBe(true);
    expect(other.every((p) => !p.designCodes.includes("US"))).toBe(true);
  });

  it("picks a US-aligned default for structural modules", () => {
    const id = getDefaultPresetId("columns", "US");
    const preset = getPresetsForModule("columns").find((p) => p.id === id);
    expect(preset?.designCodes).toContain("US");
  });
});

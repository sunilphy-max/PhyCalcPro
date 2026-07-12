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

  it("provides bearing-suite presets per module", () => {
    const rolling = getPresetsForModule("bearings");
    const plain = getPresetsForModule("plain-bearings");
    const housing = getPresetsForModule("housing");
    expect(rolling.some((p) => p.id === "iso281_general")).toBe(true);
    expect(rolling.some((p) => p.id === "skf_modified_life")).toBe(true);
    expect(rolling.every((p) => !p.id.includes("tapered_gearbox"))).toBe(true);
    expect(rolling.length).toBeGreaterThanOrEqual(5);
    expect(plain.some((p) => p.id === "hydrodynamic_iso_screening")).toBe(true);
    expect(plain.some((p) => p.id === "api_turbo_journal")).toBe(true);
    expect(housing.some((p) => p.id === "housing_general_iso")).toBe(true);
    expect(housing.every((p) => !p.id.startsWith("foot_mount"))).toBe(true);
  });

  it("machine presets are calculation context, not product-family locks", () => {
    const machine = getPresetsForModule("shafts");
    expect(machine.some((p) => p.id === "iso_machine_screening")).toBe(true);
    expect(machine.every((p) => p.id !== "iso_bearing")).toBe(true);
  });

  it("picks a US-aligned default for structural modules", () => {
    const id = getDefaultPresetId("columns", "US");
    const preset = getPresetsForModule("columns").find((p) => p.id === id);
    expect(preset?.designCodes).toContain("US");
  });
});

import { describe, expect, it } from "vitest";
import { findMaterialById, materials } from "@/data/materials";
import {
  listDatasheetIds,
  materialDatasheets,
} from "@/data/materialDatasheets";
import {
  getMaterialPage,
  listMaterialIds,
  materialDatasheetHref,
} from "@/lib/materials/materialPage";

describe("material encyclopedia pages", () => {
  it("ships ~25 flagship datasheets keyed to catalog ids", () => {
    const ids = listDatasheetIds();
    expect(ids.length).toBeGreaterThanOrEqual(24);
    expect(ids.length).toBeLessThanOrEqual(30);
    for (const id of ids) {
      expect(findMaterialById(id), `missing catalog entry for datasheet ${id}`).toBeDefined();
    }
  });

  it("merges flagship datasheet sections onto the page model", () => {
    const page = getMaterialPage("ss-316");
    expect(page).toBeDefined();
    expect(page!.hasDatasheet).toBe(true);
    expect(page!.summary).toMatch(/316/i);
    expect(page!.composition.length).toBeGreaterThan(3);
    expect(page!.applications.length).toBeGreaterThan(0);
    expect(page!.standards.some((s) => s.code.includes("10088") || s.code.includes("A240"))).toBe(
      true
    );
    expect(page!.sectionAvailability.mechanical).toBe(true);
    expect(page!.sectionAvailability.composition).toBe(true);
    expect(page!.sectionAvailability.electrical).toBe(true);
    expect(page!.electrical?.resistivity).toBeGreaterThan(0);
  });

  it("returns mechanical-only availability when no datasheet exists", () => {
    const withoutSheet = materials.find((m) => !(m.id in materialDatasheets));
    expect(withoutSheet).toBeDefined();
    const page = getMaterialPage(withoutSheet!.id);
    expect(page).toBeDefined();
    expect(page!.hasDatasheet).toBe(false);
    expect(page!.sectionAvailability.mechanical).toBe(true);
    expect(page!.sectionAvailability.composition).toBe(false);
    expect(page!.sectionAvailability.applications).toBe(false);
    // Standards fall back to catalog standard string when present
    if (withoutSheet!.standard) {
      expect(page!.sectionAvailability.standards).toBe(true);
      expect(page!.standards[0]?.code).toBe(withoutSheet!.standard);
    }
  });

  it("resolves alternative ids to live catalog entries", () => {
    const page = getMaterialPage("s355jr");
    expect(page!.alternatives.length).toBeGreaterThan(0);
    for (const alt of page!.alternatives) {
      expect(findMaterialById(alt.id)?.name).toBe(alt.name);
    }
  });

  it("builds datasheet hrefs from stable ids", () => {
    expect(materialDatasheetHref("42crmo4-4140")).toBe(
      "/products/materials/database/42crmo4-4140"
    );
    expect(listMaterialIds()).toContain("astm-a36");
  });

  it("computes shear modulus for every page", () => {
    const page = getMaterialPage("al-6061");
    expect(page!.shearModulusPa).toBeCloseTo(
      page!.material.E / (2 * (1 + page!.material.poisson)),
      -6
    );
  });
});

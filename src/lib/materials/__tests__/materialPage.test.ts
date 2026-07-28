import { describe, expect, it } from "vitest";
import { findMaterialById, materials } from "@/data/materials";
import {
  listDatasheetIds,
  materialDatasheets,
  getMaterialDatasheet,
} from "@/data/materialDatasheets";
import { materialUseCases } from "@/data/materialUseCases";
import {
  getMaterialPage,
  listMaterialIds,
  materialCompareHref,
  materialDatasheetHref,
} from "@/lib/materials/materialPage";

describe("material encyclopedia pages", () => {
  it("ships a complete datasheet for every catalog grade", () => {
    const ids = listDatasheetIds();
    expect(ids.length).toBe(materials.length);
    for (const m of materials) {
      const sheet = getMaterialDatasheet(m.id);
      expect(sheet, `missing datasheet for ${m.id}`).toBeDefined();
      expect(sheet!.summary.trim().length).toBeGreaterThan(0);
      expect(sheet!.applications?.length ?? 0).toBeGreaterThan(0);
      expect(sheet!.advantages?.length ?? 0).toBeGreaterThan(0);
      expect(sheet!.limitations?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("merges flagship datasheet sections onto the page model", () => {
    const page = getMaterialPage("ss-316");
    expect(page).toBeDefined();
    expect(page!.hasDatasheet).toBe(true);
    expect(page!.summary).toMatch(/316/i);
    expect(page!.composition.length).toBeGreaterThan(3);
    expect(page!.applications.length).toBeGreaterThan(0);
    expect(page!.advantages.length).toBeGreaterThan(0);
    expect(page!.limitations.length).toBeGreaterThan(0);
    expect(page!.standards.some((s) => s.code.includes("10088") || s.code.includes("A240"))).toBe(
      true
    );
    expect(page!.sectionAvailability.mechanical).toBe(true);
    expect(page!.sectionAvailability.physical).toBe(true);
    expect(page!.sectionAvailability.composition).toBe(true);
    expect(page!.sectionAvailability.electrical).toBe(true);
    expect(page!.sectionAvailability.advantages).toBe(true);
    expect(page!.sectionAvailability.equivalents).toBe(true);
    expect(page!.electrical?.resistivity).toBeGreaterThan(0);
  });

  it("always publishes physical properties from catalog density", () => {
    const page = getMaterialPage("astm-a242");
    expect(page).toBeDefined();
    expect(page!.hasDatasheet).toBe(true);
    expect(page!.sectionAvailability.physical).toBe(true);
    expect(page!.sectionAvailability.applications).toBe(true);
    expect(page!.sectionAvailability.advantages).toBe(true);
    expect(page!.material.density).toBeGreaterThan(0);
  });

  it("resolves equivalent ids to live catalog entries", () => {
    const page = getMaterialPage("s355jr");
    expect(page!.alternatives.length).toBeGreaterThan(0);
    for (const alt of page!.alternatives) {
      expect(findMaterialById(alt.id)?.name).toBe(alt.name);
    }
  });

  it("builds datasheet and compare hrefs from stable ids", () => {
    expect(materialDatasheetHref("42crmo4-4140")).toBe(
      "/products/materials/database/42crmo4-4140"
    );
    expect(materialCompareHref(["astm-a36", "astm-a992", "al-6061"])).toBe(
      "/products/materials/database/compare?ids=astm-a36,astm-a992,al-6061"
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

  it("curates use-case recommendations against live catalog ids", () => {
    expect(materialUseCases.length).toBeGreaterThanOrEqual(8);
    for (const useCase of materialUseCases) {
      expect(useCase.recommendations.length).toBeGreaterThan(0);
      for (const rec of useCase.recommendations) {
        expect(findMaterialById(rec.materialId), `missing ${rec.materialId}`).toBeDefined();
        expect(rec.reasons.length).toBeGreaterThan(0);
      }
    }
    const beam = materialUseCases.find((u) => u.id === "beam");
    expect(beam?.recommendations[0]?.materialId).toBe("astm-a992");
  });

  it("keeps hand-authored flagship narrative for A992", () => {
    const sheet = materialDatasheets["astm-a992"];
    expect(sheet.summary).toMatch(/wide-flange|W-shape/i);
    expect(sheet.advantages?.some((a) => /weldability|W-shape|strength/i.test(a))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { findMaterial, findMaterialById, materials } from "@/data/materials";
import { getMaterialsForProfile, getDefaultMaterialForProfile } from "@/lib/materials/materialProfiles";
import {
  resolveMaterial,
  toWeldMaterial,
  toRivetMaterial,
  getMaterialFieldUpdates,
} from "@/lib/materials/materialCatalogService";
import { getWireGradeModuli } from "@/lib/materials/springWireGrades";

describe("material catalog", () => {
  it("includes requested MITCalc-style grades", () => {
    expect(findMaterial("ASTM A36")).toBeDefined();
    expect(findMaterial("ASTM A572 Gr.50")).toBeDefined();
    expect(findMaterial("42CrMo4 (4140) Q&T")).toBeDefined();
    expect(findMaterial("34CrNiMo6 (4340) Q&T")).toBeDefined();
    expect(findMaterial("AW-6061 T6")).toBeDefined();
    expect(findMaterial("AW-7075 T6")).toBeDefined();
    expect(findMaterial("1.4301 (304)")).toBeDefined();
    expect(findMaterial("PEEK")).toBeDefined();
  });

  it("assigns stable ids to every entry", () => {
    const ids = materials.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findMaterialById("astm-a36")?.name).toBe("ASTM A36");
  });

  it("filters profiles consistently", () => {
    const structural = getMaterialsForProfile("structural");
    expect(structural.some((m) => m.name === "ASTM A36")).toBe(true);
    expect(structural.some((m) => m.category === "polymer")).toBe(false);

    const bolts = getMaterialsForProfile("bolt");
    expect(bolts.every((m) => m.category === "bolt-class")).toBe(true);
  });

  it("resolves weld and rivet properties from catalog", () => {
    const weld = toWeldMaterial(resolveMaterial("S275JR", "weld-base"));
    expect(weld.strength).toBeGreaterThan(weld.yieldStress);
    expect(weld.strength).toBeCloseTo(490e6, -6);

    const rivet = toRivetMaterial(resolveMaterial("S275JR", "rivet"));
    expect(rivet.shearStrength).toBeGreaterThan(0);
    expect(rivet.bearingStrength).toBeGreaterThan(rivet.yieldStress);
  });

  it("returns consistent field updates for structural profile", () => {
    const a36 = getMaterialFieldUpdates("ASTM A36", "structural");
    expect(a36.E).toBe(200e9);
    expect(a36.yieldStress).toBe(250e6);
  });

  it("links spring wire moduli to central catalog", () => {
    const music = getWireGradeModuli("music");
    expect(music?.G).toBeCloseTo(81.7e9, -6);
    expect(music?.E).toBeCloseTo(207e9, -6);
  });

  it("uses catalog defaults per profile", () => {
    expect(getDefaultMaterialForProfile("machine-shaft").name).toContain("4140");
    expect(getDefaultMaterialForProfile("weld-filler").category).toBe("weld-filler");
  });
});

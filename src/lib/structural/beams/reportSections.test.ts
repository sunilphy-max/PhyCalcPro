import { describe, expect, it } from "vitest";
import { solveBeamEngine } from "./engine";
import { buildBeamReportSections, buildBeamInputRows } from "./reportSections";
import { attachBeamCalculationSpec } from "@/lib/standards/evaluators/beams";
import { materials } from "@/data/materials";

describe("buildBeamReportSections", () => {
  it("emits design summary, checks, materials, and conclusion", () => {
    const raw = solveBeamEngine({
      length: 6,
      I: 8356e-8,
      c: 0.15,
      E: 210e9,
      support: "simply_supported",
      loads: [{ id: "p1", type: "point", value: 50000, position: 3 }],
      meshSegments: 40,
    });
    const withSpec = attachBeamCalculationSpec(raw, "INDICATIVE", {
      yieldStressPa: 275e6,
      spanLength: 6,
      I: 8356e-8,
      c: 0.15,
      E: 210e9,
      deflectionLimit: 6 / 300,
    });
    const material = materials.find((m) => m.name.includes("S275")) ?? materials[0]!;
    const ctx = {
      projectName: "IPE 300 mid-span",
      length: 6,
      support: "simply_supported",
      sectionDesignation: "IPE 300",
      I: 8356e-8,
      c: 0.15,
      loads: [{ id: "p1", type: "point" as const, value: 50000, position: 3 }],
      meshSegments: 40,
      material,
      calculationSpec: withSpec.calculationSpec,
    };

    const sections = buildBeamReportSections(withSpec, ctx);
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("design_summary");
    expect(ids).toContain("intermediates");
    expect(ids).toContain("checks");
    expect(ids).toContain("materials");
    expect(ids).toContain("conclusion");
    expect(ids).toContain("assumptions");
    expect(ids).toContain("equations");
    expect(ids).toContain("standards");

    const inputs = buildBeamInputRows(ctx);
    expect(inputs.some((r) => r.parameter === "Span length")).toBe(true);
    expect(inputs.some((r) => r.parameter === "Material")).toBe(true);

    const conclusion = sections.find((s) => s.id === "conclusion");
    expect(conclusion?.narrative).toBeTruthy();
  });
});

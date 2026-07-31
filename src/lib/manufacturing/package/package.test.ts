import { describe, expect, it } from "vitest";
import { parseBomCsv } from "./parseBom";
import { buildAssemblyTree, validateDrawingPackage } from "./validatePackage";
import { buildStackFromManualPicks } from "./manualStack";
import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";

describe("BOM package", () => {
  it("parses CSV BOM and builds a tree", () => {
    const csv = `Level,Parent Part,Part Number,Revision,Drawing,Qty,Description
0,,ASM-1000,B,Assembly.pdf,1,Main Assembly
1,ASM-1000,HOU-210,C,Housing.pdf,1,Housing
1,ASM-1000,SHA-100,A,Shaft.pdf,1,Shaft
2,HOU-210,SPC-015,A,Spacer.pdf,2,Spacer`;
    const { rows, warnings } = parseBomCsv(csv);
    expect(warnings).toHaveLength(0);
    expect(rows).toHaveLength(4);
    const tree = buildAssemblyTree(rows);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.partNumber).toBe("ASM-1000");
    expect(tree[0]!.children.map((c) => c.partNumber).sort()).toEqual(["HOU-210", "SHA-100"]);
    const housing = tree[0]!.children.find((c) => c.partNumber === "HOU-210");
    expect(housing?.children[0]?.partNumber).toBe("SPC-015");
  });

  it("flags missing drawings and orphan PDFs", () => {
    const { rows } = parseBomCsv(`Level,Parent Part,Part Number,Revision,Drawing,Qty,Description
0,,ASM-1000,B,Assembly.pdf,1,Main`);
    const issues = validateDrawingPackage(rows, [
      { fileName: "Orphan.pdf", path: "Orphan.pdf", bytes: new Uint8Array() },
    ]);
    expect(issues.some((i) => i.code === "drawing_missing_from_zip")).toBe(true);
    expect(issues.some((i) => i.code === "orphan_pdf")).toBe(true);
  });

  it("builds a multi-part manual stack config", () => {
    const housing: DrawingExtract = {
      datums: [],
      features: [],
      frames: [],
      dimensions: [
        {
          id: "d1",
          label: "Housing face",
          nominal: 0.05,
          upperDeviation: 0.0001,
          lowerDeviation: -0.0001,
        },
      ],
      fitCallouts: [],
      suggestedContributors: [],
    };
    const shaft: DrawingExtract = {
      datums: [],
      features: [],
      frames: [],
      dimensions: [
        {
          id: "d1",
          label: "Shaft length",
          nominal: 0.04,
          upperDeviation: 0.00005,
          lowerDeviation: -0.00005,
        },
      ],
      fitCallouts: [],
      suggestedContributors: [],
    };
    const config = buildStackFromManualPicks(
      [
        { candidateKey: "HOU-210:dim:d1", partNumber: "HOU-210", sense: 1, axis: "X" },
        { candidateKey: "SHA-100:dim:d1", partNumber: "SHA-100", sense: -1, axis: "X" },
      ],
      { "HOU-210": housing, "SHA-100": shaft }
    );
    expect(config.contributors).toHaveLength(2);
    expect(config.features).toHaveLength(2);
    expect(config.contributors[1]!.sense).toBe(-1);
  });
});

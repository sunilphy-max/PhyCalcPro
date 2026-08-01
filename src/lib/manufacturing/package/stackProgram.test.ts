import { describe, expect, it } from "vitest";
import { emptyDrawingExtract } from "@/lib/manufacturing/gdt/schema";
import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";
import { buildAnnotationLibrary, scorePartExtract } from "./annotationLibrary";
import { proposeAllocationPackages, applyContributorScales } from "./allocate";
import { buildAssemblyTree } from "./validatePackage";
import { createNamedStack, buildAndSolveNamedStack, stackDashboardRows } from "./stackRegistry";
import { proposeStacksFromPackage } from "./proposeStacks";
import { buildDrPacketMarkdown } from "./drPacket";
import { contributorPartNumbersForContext } from "./bomHelpers";
import { solveGdtStackEngine } from "@/lib/manufacturing/gdt/engine";

const sampleExtract = (): DrawingExtract => ({
  ...emptyDrawingExtract(),
  metadata: { drawingNumber: "PN-1", revision: "A" },
  dimensions: [
    {
      id: "d1",
      label: "Axial length",
      nominal: 0.01,
      upperDeviation: 0.0001,
      lowerDeviation: -0.0001,
    },
  ],
  frames: [
    {
      id: "f1",
      characteristic: "position",
      zoneValue: 0.00005,
      materialCondition: "MMC",
      datumRefs: [{ datumId: "A", materialCondition: "MMC" }],
      featureOfSizeId: "fos1",
      label: "Position MMC",
    },
  ],
  features: [
    {
      id: "fos1",
      nominal: 0.01,
      upperLimit: 0.0101,
      lowerLimit: 0.01,
      isInternal: true,
    },
  ],
  datums: [{ id: "A", type: "plane" }],
  notes: ["MAX GAP 0.2 mm axial float"],
});

describe("annotation library + BOM helpers", () => {
  it("builds library and scores extract quality", () => {
    const rows = [
      {
        level: 0,
        parentPartNumber: null,
        partNumber: "TOP",
        revision: "A",
        drawingFile: "top.pdf",
        qty: 1,
        description: "Top",
      },
      {
        level: 1,
        parentPartNumber: "TOP",
        partNumber: "SA1",
        revision: "A",
        drawingFile: "sa.pdf",
        qty: 1,
        description: "Subassy",
      },
      {
        level: 2,
        parentPartNumber: "SA1",
        partNumber: "C1",
        revision: "A",
        drawingFile: "c1.pdf",
        qty: 1,
        description: "Component",
      },
    ];
    const tree = buildAssemblyTree(rows);
    const extracts = { C1: sampleExtract(), SA1: sampleExtract() };
    const lib = buildAnnotationLibrary(extracts, tree);
    expect(lib.some((e) => e.kind === "dimension" && e.partNumber === "C1")).toBe(true);
    expect(lib.some((e) => e.kind === "note")).toBe(true);
    const q = scorePartExtract("C1", extracts.C1!);
    expect(q.ready).toBe(true);
    expect(contributorPartNumbersForContext(tree, "SA1")).toContain("C1");
  });
});

describe("multi-stack solve + propose + allocate", () => {
  it("solves a named SA stack from component picks", () => {
    const rows = [
      {
        level: 0,
        parentPartNumber: null,
        partNumber: "TOP",
        revision: "A",
        drawingFile: "top.pdf",
        qty: 1,
        description: "Top",
      },
      {
        level: 1,
        parentPartNumber: "TOP",
        partNumber: "SA1",
        revision: "A",
        drawingFile: "sa.pdf",
        qty: 1,
        description: "Subassy",
      },
      {
        level: 2,
        parentPartNumber: "SA1",
        partNumber: "C1",
        revision: "A",
        drawingFile: "c1.pdf",
        qty: 1,
        description: "Component",
      },
    ];
    const tree = buildAssemblyTree(rows);
    const extracts = { C1: sampleExtract() };
    const stack = createNamedStack({
      name: "Endplay",
      contextPartNumber: "SA1",
      tree,
      level: "subassembly",
      requirementMaxSi: 0.001,
    });
    stack.picks = [
      { candidateKey: "C1:dim:d1", partNumber: "C1", sense: 1, axis: "X" },
    ];
    stack.chainConfirmed = true;
    const { result, status } = buildAndSolveNamedStack(stack, extracts, {
      monteCarloSamples: 500,
    });
    expect(result.count).toBe(1);
    expect(result.worstCase).toBeGreaterThan(0);
    expect(result.monteCarloPercentile95).toBeDefined();
    expect(["pass", "risk", "fail", "solved"]).toContain(status);
    const dash = stackDashboardRows([{ ...stack, status, resultSnapshot: result }]);
    expect(dash[0]!.level).toBe("subassembly");
  });

  it("proposes stacks from notes and allocates without inventing numbers", () => {
    const rows = [
      {
        level: 0,
        parentPartNumber: null,
        partNumber: "TOP",
        revision: "A",
        drawingFile: "top.pdf",
        qty: 1,
        description: "Top",
      },
      {
        level: 1,
        parentPartNumber: "TOP",
        partNumber: "SA1",
        revision: "A",
        drawingFile: "sa.pdf",
        qty: 1,
        description: "Subassy",
      },
      {
        level: 2,
        parentPartNumber: "SA1",
        partNumber: "C1",
        revision: "A",
        drawingFile: "c1.pdf",
        qty: 1,
        description: "Component",
      },
    ];
    const tree = buildAssemblyTree(rows);
    const extracts = { SA1: sampleExtract(), C1: sampleExtract() };
    const proposals = proposeStacksFromPackage(tree, extracts);
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0]!.suggestedPicks.length).toBeGreaterThan(0);

    const config = {
      features: [
        {
          id: "f1",
          nominal: 0,
          upperLimit: 0.0002,
          lowerLimit: -0.0002,
          isInternal: false,
        },
      ],
      frames: [],
      datums: [],
      contributors: [
        {
          id: "c1",
          sense: 1 as const,
          axis: "X" as const,
          source: { kind: "size" as const, featureOfSizeId: "f1" },
        },
      ],
      monteCarloSamples: 0,
    };
    const baseline = solveGdtStackEngine(config);
    const pkgs = proposeAllocationPackages(config, baseline, {
      targetMetric: "WC",
      targetValueSi: baseline.worstCase * 0.5,
    });
    expect(pkgs.length).toBeGreaterThan(0);
    const scaled = applyContributorScales(config, pkgs[0]!.scales);
    const after = solveGdtStackEngine(scaled);
    expect(after.worstCase).toBeLessThanOrEqual(baseline.worstCase + 1e-15);

    const md = buildDrPacketMarkdown({
      studyName: "Unit test",
      bomRows: rows,
      tree,
      stacks: [],
      dashboard: [],
      extractsByPart: extracts,
    });
    expect(md).toContain("Tolerance stack DR packet");
  });
});

describe("MC yield", () => {
  it("reports yield when requirement is set", () => {
    const result = solveGdtStackEngine({
      features: [
        {
          id: "f1",
          nominal: 0,
          upperLimit: 0.0001,
          lowerLimit: -0.0001,
          isInternal: false,
        },
      ],
      frames: [],
      datums: [],
      contributors: [
        {
          id: "c1",
          sense: 1,
          axis: "X",
          source: { kind: "size", featureOfSizeId: "f1" },
        },
      ],
      monteCarloSamples: 800,
      requirementMaxSi: 0.0002,
      defaultDistribution: "uniform",
    });
    expect(result.monteCarloYield).toBeDefined();
    expect(result.monteCarloYield!).toBeGreaterThan(0.5);
    expect(result.sensitivity?.[0]?.pctOfWc).toBeCloseTo(100, 5);
  });
});

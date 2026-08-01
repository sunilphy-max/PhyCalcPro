import type {
  ContributorBreakdown,
  DrawingExtract,
  GdtStackConfig,
  GdtStackResult,
} from "@/lib/manufacturing/gdt/types";
import { solveGdtStackEngine } from "@/lib/manufacturing/gdt/engine";
import type { AssemblyNode } from "./types";
import { findAssemblyNode, stackLevelForNodeType } from "./bomHelpers";
import { buildStackFromManualPicks, type ManualStackPick } from "./manualStack";

export type StackLevel = "component" | "subassembly" | "assembly" | "toplevel";

export type StackMethod = "WC" | "RSS" | "MC";

export type NamedStackStatus = "draft" | "confirmed" | "solved" | "fail" | "pass" | "risk";

export type NamedStack = {
  id: string;
  name: string;
  level: StackLevel;
  /** BOM node this stack is owned by (SA / assembly / top). */
  contextPartNumber: string;
  requirementMinSi?: number;
  requirementMaxSi?: number;
  method: StackMethod;
  picks: ManualStackPick[];
  chainConfirmed: boolean;
  /** When set, this contributor is a rollup of another solved stack's WC/RSS. */
  rollupStackIds?: string[];
  status: NamedStackStatus;
  resultSnapshot?: GdtStackResult | null;
  notes?: string;
};

export type StackDashboardRow = {
  id: string;
  name: string;
  level: StackLevel;
  contextPartNumber: string;
  status: NamedStackStatus;
  worstCase?: number;
  rss?: number;
  requirementMaxSi?: number;
  marginSi?: number;
};

let stackIdCounter = 0;

export function createNamedStack(partial: {
  name: string;
  contextPartNumber: string;
  tree: AssemblyNode[];
  level?: StackLevel;
  requirementMinSi?: number;
  requirementMaxSi?: number;
  method?: StackMethod;
}): NamedStack {
  stackIdCounter += 1;
  const node = findAssemblyNode(partial.tree, partial.contextPartNumber);
  const level =
    partial.level ??
    (node ? stackLevelForNodeType(node.nodeType) : "assembly");
  return {
    id: `stack-${Date.now()}-${stackIdCounter}`,
    name: partial.name,
    level: level === "component" ? "subassembly" : level,
    contextPartNumber: partial.contextPartNumber,
    requirementMinSi: partial.requirementMinSi,
    requirementMaxSi: partial.requirementMaxSi,
    method: partial.method ?? "WC",
    picks: [],
    chainConfirmed: false,
    status: "draft",
    resultSnapshot: null,
  };
}

export function evaluateStackStatus(
  stack: NamedStack,
  result: GdtStackResult | null | undefined
): NamedStackStatus {
  if (!stack.chainConfirmed) return "draft";
  if (!result) return "confirmed";
  const metric =
    stack.method === "RSS" ? result.rss : stack.method === "MC"
      ? (result.monteCarloPercentile95 ?? result.monteCarloMean ?? result.rss)
      : result.worstCase;
  if (stack.requirementMaxSi !== undefined && Number.isFinite(stack.requirementMaxSi)) {
    if (metric > stack.requirementMaxSi) return "fail";
    if (metric > stack.requirementMaxSi * 0.85) return "risk";
    return "pass";
  }
  return "solved";
}

/**
 * Optional rollup: treat a solved child SA stack as a single size-like contributor
 * using WC (or RSS) half-width on the parent stack axis.
 */
export function appendRollupContributor(
  config: GdtStackConfig,
  childResult: GdtStackResult,
  opts: { id: string; label: string; sense: 1 | -1; axis: "X" | "Y" | "Z"; useRss?: boolean }
): GdtStackConfig {
  const width = opts.useRss ? childResult.rss : childResult.worstCase;
  const fosId = `rollup__${opts.id}`;
  return {
    ...config,
    features: [
      ...config.features,
      {
        id: fosId,
        label: opts.label,
        nominal: 0,
        upperLimit: width,
        lowerLimit: -width,
        isInternal: false,
      },
    ],
    contributors: [
      ...config.contributors,
      {
        id: opts.id,
        label: opts.label,
        sense: opts.sense,
        axis: opts.axis,
        source: { kind: "size", featureOfSizeId: fosId },
      },
    ],
  };
}

export function buildAndSolveNamedStack(
  stack: NamedStack,
  extractsByPart: Record<string, DrawingExtract>,
  options: {
    monteCarloSamples?: number;
    allStacks?: NamedStack[];
  } = {}
): { config: GdtStackConfig; result: GdtStackResult; status: NamedStackStatus } {
  let config = buildStackFromManualPicks(stack.picks, extractsByPart, {
    monteCarloSamples: options.monteCarloSamples,
  });

  if (stack.rollupStackIds?.length && options.allStacks) {
    for (const rid of stack.rollupStackIds) {
      const child = options.allStacks.find((s) => s.id === rid);
      if (!child?.resultSnapshot) continue;
      config = appendRollupContributor(config, child.resultSnapshot, {
        id: `rollup-${rid}`,
        label: `Rollup: ${child.name}`,
        sense: 1,
        axis: "X",
        useRss: stack.method === "RSS",
      });
    }
  }

  const result = solveGdtStackEngine({
    ...config,
    requirementMinSi: stack.requirementMinSi,
    requirementMaxSi: stack.requirementMaxSi,
    monteCarloSamples:
      stack.method === "MC" || (options.monteCarloSamples ?? 0) > 0
        ? options.monteCarloSamples ?? config.monteCarloSamples ?? 1000
        : config.monteCarloSamples,
  });
  const status = evaluateStackStatus(stack, result);
  return { config, result, status };
}

export function stackDashboardRows(stacks: NamedStack[]): StackDashboardRow[] {
  return stacks.map((s) => {
    const wc = s.resultSnapshot?.worstCase;
    const rss = s.resultSnapshot?.rss;
    const metric = s.method === "RSS" ? rss : wc;
    return {
      id: s.id,
      name: s.name,
      level: s.level,
      contextPartNumber: s.contextPartNumber,
      status: s.status,
      worstCase: wc,
      rss,
      requirementMaxSi: s.requirementMaxSi,
      marginSi:
        metric !== undefined && s.requirementMaxSi !== undefined
          ? s.requirementMaxSi - metric
          : undefined,
    };
  });
}

/** Map GdtStackResult contributors to display breakdown (SI). */
export function breakdownFromResult(result: GdtStackResult): ContributorBreakdown[] {
  return result.contributors;
}

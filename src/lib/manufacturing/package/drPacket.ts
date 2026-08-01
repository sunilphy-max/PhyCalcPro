import type { DrawingExtract, GdtStackResult } from "@/lib/manufacturing/gdt/types";
import type { AssemblyNode, BomRow } from "./types";
import type { NamedStack, StackDashboardRow } from "./stackRegistry";
import { explainDriversFromBreakdown } from "./allocate";

export type DrPacketInput = {
  studyName: string;
  bomRows: BomRow[];
  tree: AssemblyNode[];
  stacks: NamedStack[];
  dashboard: StackDashboardRow[];
  extractsByPart: Record<string, DrawingExtract>;
  assumptions?: string[];
  procedureNote?: string;
};

/** Build a design-review markdown packet (text export — no invented numbers). */
export function buildDrPacketMarkdown(input: DrPacketInput): string {
  const lines: string[] = [];
  lines.push(`# Tolerance stack DR packet`);
  lines.push("");
  lines.push(`**Study:** ${input.studyName}`);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Cover`);
  lines.push(`- BOM parts: ${input.bomRows.length}`);
  lines.push(`- Stacks: ${input.stacks.length}`);
  lines.push(`- Extracts available: ${Object.keys(input.extractsByPart).length}`);
  lines.push("");
  lines.push(`## Stack register`);
  lines.push("");
  lines.push(`| Name | Level | Context PN | Status | WC | RSS | Req max | Margin |`);
  lines.push(`|------|-------|------------|--------|----|-----|---------|--------|`);
  for (const row of input.dashboard) {
    lines.push(
      `| ${row.name} | ${row.level} | ${row.contextPartNumber} | ${row.status} | ${fmt(row.worstCase)} | ${fmt(row.rss)} | ${fmt(row.requirementMaxSi)} | ${fmt(row.marginSi)} |`
    );
  }
  lines.push("");

  for (const stack of input.stacks) {
    lines.push(`## Stack: ${stack.name}`);
    lines.push(`- Level: ${stack.level}`);
    lines.push(`- Context: ${stack.contextPartNumber}`);
    lines.push(`- Method: ${stack.method}`);
    lines.push(`- Confirmed: ${stack.chainConfirmed ? "yes" : "no"}`);
    lines.push(`- Status: ${stack.status}`);
    if (stack.requirementMaxSi !== undefined) {
      lines.push(`- Requirement max (SI m): ${stack.requirementMaxSi}`);
    }
    lines.push(`- Contributors (picks): ${stack.picks.length}`);
    for (const p of stack.picks) {
      lines.push(
        `  - ${p.partNumber} · ${p.candidateKey} · sense ${p.sense > 0 ? "+" : "−"} · ${p.axis}`
      );
    }
    const res = stack.resultSnapshot;
    if (res) {
      lines.push(`- Worst-case: ${res.worstCase}`);
      lines.push(`- RSS: ${res.rss}`);
      if (res.monteCarloMean !== undefined) lines.push(`- MC mean: ${res.monteCarloMean}`);
      if (res.monteCarloStdDev !== undefined) lines.push(`- MC σ: ${res.monteCarloStdDev}`);
      if (res.monteCarloYield !== undefined) lines.push(`- MC yield: ${res.monteCarloYield}`);
      if (res.monteCarloPercentile95 !== undefined) {
        lines.push(`- MC P95: ${res.monteCarloPercentile95}`);
      }
      lines.push(`- Drivers:`);
      for (const d of explainDriversFromBreakdown(res.contributors, res.worstCase)) {
        lines.push(`  - ${d}`);
      }
    }
    if (stack.notes) lines.push(`- Notes: ${stack.notes}`);
    lines.push("");
  }

  lines.push(`## Drawing / BOM revisions`);
  for (const row of input.bomRows) {
    const ex = input.extractsByPart[row.partNumber];
    const rev = ex?.metadata?.revision || row.revision || "—";
    const dwg = ex?.metadata?.drawingNumber || row.drawingFile || "—";
    lines.push(`- ${row.partNumber}: drawing ${dwg}, rev ${rev}`);
  }
  lines.push("");

  lines.push(`## Assumptions`);
  const assumptions = input.assumptions?.length
    ? input.assumptions
    : [
        "All linear dimensions in SI metres inside the solver; display units are UI-only.",
        "MMC/LMC bonus uses worst-case size unless actual sizes are provided.",
        "RSS assumes independent contributors.",
        "AI proposals were human-confirmed before solve.",
      ];
  for (const a of assumptions) lines.push(`- ${a}`);
  lines.push("");

  if (input.procedureNote) {
    lines.push(`## Procedure`);
    lines.push(input.procedureNote);
    lines.push("");
  }

  lines.push(`## Approval`);
  lines.push(`- Analyst: __________________  Date: __________`);
  lines.push(`- Reviewer: _________________  Date: __________`);
  lines.push("");

  return lines.join("\n");
}

function fmt(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e-2 || n === 0) return n.toPrecision(4);
  return n.toExponential(3);
}

export function buildDrPacketJson(input: DrPacketInput): string {
  return JSON.stringify(
    {
      studyName: input.studyName,
      generatedAt: new Date().toISOString(),
      stacks: input.stacks.map((s) => ({
        id: s.id,
        name: s.name,
        level: s.level,
        contextPartNumber: s.contextPartNumber,
        status: s.status,
        method: s.method,
        chainConfirmed: s.chainConfirmed,
        picks: s.picks,
        requirementMaxSi: s.requirementMaxSi,
        result: summarizeResult(s.resultSnapshot),
      })),
      dashboard: input.dashboard,
      bom: input.bomRows.map((r) => ({
        partNumber: r.partNumber,
        revision: r.revision,
        drawingFile: r.drawingFile,
        extractRevision: input.extractsByPart[r.partNumber]?.metadata?.revision,
      })),
    },
    null,
    2
  );
}

function summarizeResult(res: GdtStackResult | null | undefined) {
  if (!res) return null;
  return {
    worstCase: res.worstCase,
    rss: res.rss,
    monteCarloMean: res.monteCarloMean,
    monteCarloStdDev: res.monteCarloStdDev,
    monteCarloYield: res.monteCarloYield,
    monteCarloPercentile95: res.monteCarloPercentile95,
    contributors: res.contributors.map((c) => ({
      id: c.id,
      label: c.label,
      effectiveTolerance: c.effectiveTolerance,
      kind: c.kind,
    })),
  };
}

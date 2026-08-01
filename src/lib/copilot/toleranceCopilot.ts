/**
 * Tolerance / drawing-package copilot helpers.
 * Deterministic, solver-grounded. Never invents clearances or pass/fail as truth.
 */

import type { DrawingExtract, FeatureControlFrame, GdtStackResult } from "@/lib/manufacturing/gdt/types";
import {
  explainAnnotation,
  explainFeatureControlFrame,
  type AnnotationEntry,
} from "@/lib/manufacturing/package/annotationLibrary";
import { explainDriversFromBreakdown } from "@/lib/manufacturing/package/allocate";
import { proposeStacksFromPackage, type ProposedStack } from "@/lib/manufacturing/package/proposeStacks";
import type { AssemblyNode } from "@/lib/manufacturing/package/types";

export type ToleranceCopilotAction =
  | { type: "explain_fcf"; text: string }
  | { type: "explain_annotation"; text: string }
  | { type: "list_position_mmc"; items: string[] }
  | { type: "propose_stacks"; proposals: ProposedStack[] }
  | { type: "explain_drivers"; lines: string[] }
  | { type: "help"; text: string };

export function runToleranceCopilot(input: {
  command: string;
  extractsByPart?: Record<string, DrawingExtract>;
  tree?: AssemblyNode[];
  library?: AnnotationEntry[];
  activeExtract?: DrawingExtract | null;
  lastResult?: GdtStackResult | null;
}): ToleranceCopilotAction {
  const cmd = input.command.trim().toLowerCase();

  if (!cmd || cmd === "help") {
    return {
      type: "help",
      text: [
        "Commands (suggestions only — confirm before solve):",
        "• explain fcf <id> — explain selected/active FCF",
        "• list position mmc [PN] — list position@MMC on a part",
        "• propose stacks — SA/assembly interface proposals from notes + BOM",
        "• explain drivers — narrative from last solver sensitivity table",
        "• which feed <PN> — annotations on a part that can feed stacks",
      ].join("\n"),
    };
  }

  if (cmd.startsWith("explain fcf") || cmd.startsWith("explain this fcf")) {
    const id = cmd.replace(/^explain (this )?fcf\s*/i, "").trim();
    const extract = input.activeExtract;
    let frame: FeatureControlFrame | undefined;
    if (extract && id) frame = extract.frames.find((f) => f.id === id || f.label === id);
    if (!frame && extract?.frames[0]) frame = extract.frames[0];
    if (!frame) {
      return { type: "explain_fcf", text: "No FCF available. Extract a drawing and select a part first." };
    }
    return { type: "explain_fcf", text: explainFeatureControlFrame(frame) };
  }

  if (cmd.startsWith("list position") || cmd.includes("position@mmc") || cmd.includes("position mmc")) {
    const pnMatch = cmd.match(/\b([A-Z0-9][-A-Z0-9_]{1,})\b/i);
    const items: string[] = [];
    const extracts = input.extractsByPart ?? {};
    const pns = pnMatch
      ? Object.keys(extracts).filter((p) => p.toLowerCase() === pnMatch[1]!.toLowerCase())
      : Object.keys(extracts);
    for (const pn of pns.length ? pns : Object.keys(extracts)) {
      const ex = extracts[pn];
      if (!ex) continue;
      for (const f of ex.frames) {
        if (f.characteristic === "position" && f.materialCondition === "MMC") {
          items.push(`${pn}: ${f.label ?? f.id} zone=${f.zoneValue} (feature ${f.featureOfSizeId ?? "—"})`);
        }
      }
    }
    return {
      type: "list_position_mmc",
      items: items.length ? items : ["No position@MMC frames in current extracts."],
    };
  }

  if (cmd.startsWith("propose")) {
    if (!input.tree?.length || !input.extractsByPart) {
      return { type: "propose_stacks", proposals: [] };
    }
    return {
      type: "propose_stacks",
      proposals: proposeStacksFromPackage(input.tree, input.extractsByPart),
    };
  }

  if (cmd.startsWith("explain drivers") || cmd === "drivers") {
    if (!input.lastResult) {
      return { type: "explain_drivers", lines: ["Solve a confirmed stack first — drivers come from the solver table."] };
    }
    return {
      type: "explain_drivers",
      lines: explainDriversFromBreakdown(
        input.lastResult.contributors,
        input.lastResult.worstCase
      ),
    };
  }

  if (cmd.startsWith("which feed") || cmd.startsWith("which component")) {
    const pn = cmd.replace(/^which (feed|component dims feed)\s*/i, "").trim();
    const lib = (input.library ?? []).filter(
      (e) => (!pn || e.partNumber.toLowerCase() === pn.toLowerCase()) && (e.kind === "dimension" || e.kind === "fcf")
    );
    return {
      type: "list_position_mmc",
      items: lib.length
        ? lib.slice(0, 40).map((e) => `${e.partNumber}: ${e.label} [${e.key}]`)
        : ["No matching annotations."],
    };
  }

  if (input.library?.length && cmd.startsWith("explain ")) {
    const key = cmd.slice("explain ".length).trim();
    const entry = input.library.find(
      (e) => e.key === key || e.label.toLowerCase() === key || e.featureId === key
    );
    if (entry) {
      const extract = input.extractsByPart?.[entry.partNumber];
      return { type: "explain_annotation", text: explainAnnotation(entry, extract) };
    }
  }

  return {
    type: "help",
    text: `Unrecognized command. Type "help" for options.\nYou said: ${input.command}`,
  };
}

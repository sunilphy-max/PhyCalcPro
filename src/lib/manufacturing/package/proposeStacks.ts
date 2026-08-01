import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";
import type { AssemblyNode } from "./types";
import { collectDescendants, findAssemblyNode, stackLevelForNodeType } from "./bomHelpers";
import type { StackLevel } from "./stackRegistry";
import { listPickCandidates, type ManualStackPick } from "./manualStack";

export type ProposedStack = {
  name: string;
  level: StackLevel;
  contextPartNumber: string;
  reason: string;
  /** Suggested picks — engineer must confirm; never auto-applied as official. */
  suggestedPicks: ManualStackPick[];
  sourceNotes: string[];
};

const GAP_NOTE =
  /\b(gap|clearance|end[\s-]?play|float|interference|stack|stack[- ]?up|axial\s+play|radial\s+play|max\s+gap|min\s+gap)\b/i;

/**
 * Propose SA and assembly stacks from drawing notes + BOM structure.
 * Suggestions only — never invent numeric clearances.
 */
export function proposeStacksFromPackage(
  tree: AssemblyNode[],
  extractsByPart: Record<string, DrawingExtract>
): ProposedStack[] {
  const proposals: ProposedStack[] = [];

  const visit = (node: AssemblyNode) => {
    if (node.nodeType === "component") {
      for (const c of node.children) visit(c);
      return;
    }

    const extract = extractsByPart[node.partNumber];
    const notes = extract?.notes ?? [];
    const gapNotes = notes.filter((n) => GAP_NOTE.test(n));
    const level = stackLevelForNodeType(node.nodeType);
    const stackLevel: StackLevel = level === "component" ? "subassembly" : level;

    if (gapNotes.length > 0 || (node.children.length > 0 && extract)) {
      const childPns = collectDescendants(node)
        .filter((n) => n.nodeType === "component" || extractsByPart[n.partNumber])
        .map((n) => n.partNumber);

      const suggestedPicks: ManualStackPick[] = [];
      // Prefer dimensions/FCFs from child components that look axial (label heuristics)
      for (const pn of childPns.slice(0, 12)) {
        const ex = extractsByPart[pn];
        if (!ex) continue;
        const drawing = findAssemblyNode(tree, pn)?.drawingFile ?? "";
        const cands = listPickCandidates(pn, drawing, ex);
        const axial = cands.find((c) =>
          /axial|length|height|thick|gap|stack|end/i.test(c.label)
        );
        const pick = axial ?? cands[0];
        if (pick && suggestedPicks.length < 6) {
          suggestedPicks.push({
            candidateKey: pick.key,
            partNumber: pn,
            sense: suggestedPicks.length % 2 === 0 ? 1 : -1,
            axis: "X",
          });
        }
      }

      // Include SA/assembly drawing dimensions if present
      if (extract) {
        const selfCands = listPickCandidates(node.partNumber, node.drawingFile, extract);
        for (const c of selfCands.slice(0, 2)) {
          if (!suggestedPicks.some((p) => p.candidateKey === c.key)) {
            suggestedPicks.push({
              candidateKey: c.key,
              partNumber: node.partNumber,
              sense: 1,
              axis: "X",
            });
          }
        }
      }

      proposals.push({
        name:
          gapNotes[0]?.slice(0, 48) ||
          `${node.description || node.partNumber} ${stackLevel} stack`,
        level: stackLevel,
        contextPartNumber: node.partNumber,
        reason:
          gapNotes.length > 0
            ? `Notes on ${node.partNumber} mention gap/clearance/play — proposed contributors from child component extracts.`
            : `Structural proposal for ${stackLevel} ${node.partNumber} from child component annotations.`,
        suggestedPicks,
        sourceNotes: gapNotes.slice(0, 5),
      });
    }

    for (const c of node.children) visit(c);
  };

  for (const root of tree) visit(root);
  return proposals;
}

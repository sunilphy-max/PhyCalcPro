import type { AssemblyNode, BomNodeType } from "./types";

/** Find a node by part number in the assembly tree. */
export function findAssemblyNode(
  tree: AssemblyNode[],
  partNumber: string
): AssemblyNode | null {
  for (const node of tree) {
    if (node.partNumber === partNumber) return node;
    const nested = findAssemblyNode(node.children, partNumber);
    if (nested) return nested;
  }
  return null;
}

/** Flatten all descendants (not including self). */
export function collectDescendants(node: AssemblyNode): AssemblyNode[] {
  const out: AssemblyNode[] = [];
  const walk = (n: AssemblyNode) => {
    for (const c of n.children) {
      out.push(c);
      walk(c);
    }
  };
  walk(node);
  return out;
}

/** Component PNs under a BOM context node (for SA/assembly stack contributor picks). */
export function componentPartNumbersUnder(node: AssemblyNode): string[] {
  const descendants = collectDescendants(node);
  const components = descendants.filter((n) => n.nodeType === "component");
  if (components.length > 0) return components.map((n) => n.partNumber);
  // Leaf SA with no typed components: allow all descendants + self annotations
  if (descendants.length > 0) return descendants.map((n) => n.partNumber);
  return [node.partNumber];
}

/** Part numbers allowed as contributor sources for a stack at this BOM node. */
export function contributorPartNumbersForContext(
  tree: AssemblyNode[],
  contextPartNumber: string | null
): string[] | null {
  if (!contextPartNumber) return null;
  const node = findAssemblyNode(tree, contextPartNumber);
  if (!node) return null;
  const allowed = new Set<string>([node.partNumber, ...componentPartNumbersUnder(node)]);
  // Include subassembly nodes themselves (their drawing callouts) when building assembly stacks
  for (const d of collectDescendants(node)) {
    if (d.nodeType === "subassembly" || d.nodeType === "assembly") {
      allowed.add(d.partNumber);
    }
  }
  return [...allowed];
}

export function stackLevelForNodeType(nodeType: BomNodeType): "subassembly" | "assembly" | "toplevel" | "component" {
  if (nodeType === "toplevel") return "toplevel";
  if (nodeType === "assembly") return "assembly";
  if (nodeType === "subassembly") return "subassembly";
  return "component";
}

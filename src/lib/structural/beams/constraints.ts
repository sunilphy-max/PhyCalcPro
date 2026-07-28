import type { BeamSupport, SupportKind } from "./types";

export function constrainedDOFFromSupports(
  nodes: { id: number; x: number }[],
  supports: BeamSupport[]
): number[] {
  const fixed = new Set<number>();
  const tol =
    nodes.length > 1
      ? Math.max(1e-12, Math.abs(nodes[nodes.length - 1]!.x - nodes[0]!.x) * 1e-9)
      : 1e-12;

  for (const support of supports) {
    const node = nearestNode(nodes, support.x, tol);
    if (!node) continue;
    const vDof = node.id * 2;
    const rDof = node.id * 2 + 1;
    if (support.kind === "pin" || support.kind === "roller" || support.kind === "fixed") {
      fixed.add(vDof);
    }
    if (support.kind === "fixed") {
      fixed.add(rDof);
    }
  }

  return [...fixed].sort((a, b) => a - b);
}

/** @deprecated Prefer constrainedDOFFromSupports with explicit supports. */
export function constrainedDOF(
  nodeCount: number,
  support: "simply_supported" | "cantilever" | "fixed_fixed"
) {
  if (support === "cantilever") {
    return [0, 1];
  }
  if (support === "simply_supported") {
    return [0, (nodeCount - 1) * 2];
  }
  return [0, 1, (nodeCount - 1) * 2, (nodeCount - 1) * 2 + 1];
}

function nearestNode(
  nodes: { id: number; x: number }[],
  x: number,
  tol: number
) {
  let best = nodes[0];
  let bestDist = Infinity;
  for (const node of nodes) {
    const dist = Math.abs(node.x - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }
  if (!best || bestDist > Math.max(tol, 1e-9)) {
    // Still return nearest — mesh should have inserted exact nodes
    return best;
  }
  return best;
}

export function supportKindLabel(kind: SupportKind): string {
  if (kind === "fixed") return "Fixed";
  if (kind === "roller") return "Roller";
  return "Pin";
}

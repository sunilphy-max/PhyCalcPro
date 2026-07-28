import type { BeamSupport, SupportReaction } from "./types";

export function computeReactions(
  K: number[][],
  d: number[],
  F: number[]
) {
  const reactions: number[] = Array(F.length).fill(0);

  for (let i = 0; i < K.length; i++) {
    let sum = 0;
    for (let j = 0; j < K[i]!.length; j++) {
      sum += K[i]![j]! * d[j]!;
    }
    reactions[i] = sum - F[i]!;
  }

  return reactions;
}

export function mapSupportReactions(
  nodes: { id: number; x: number }[],
  supports: BeamSupport[],
  reactions: number[]
): SupportReaction[] {
  return supports.map((support) => {
    let best = nodes[0]!;
    let bestDist = Infinity;
    for (const node of nodes) {
      const dist = Math.abs(node.x - support.x);
      if (dist < bestDist) {
        bestDist = dist;
        best = node;
      }
    }
    const Fy = reactions[best.id * 2] ?? 0;
    const Mz = reactions[best.id * 2 + 1] ?? 0;
    return {
      supportId: support.id,
      x: support.x,
      kind: support.kind,
      Fy,
      ...(support.kind === "fixed" ? { Mz } : {}),
    };
  });
}

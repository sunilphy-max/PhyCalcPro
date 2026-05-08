import { FEMModel } from "./femTypes";
import { Load } from "./types";

export function createLoadVector(
  model: FEMModel,
  loads: Load[]
) {
  const F = Array(model.nodes.length * 2).fill(0);
  const maxX = model.nodes[model.nodes.length - 1]?.x ?? 1;

  for (const load of loads) {
    if (load.type === "point") {
      const nodeIndex = Math.round(
        (load.position / maxX) * (model.nodes.length - 1)
      );
      const index = Math.min(
        Math.max(nodeIndex, 0),
        model.nodes.length - 1
      );
      F[index * 2] -= load.value;
      continue;
    }

    const start = Math.max(0, load.start);
    const end = Math.min(load.end, maxX);
    const length = Math.max(0, end - start);

    if (length === 0) continue;

    const total = load.value * length;
    const activeNodes = model.nodes.filter(
      (node) => node.x >= start && node.x <= end
    );

    if (activeNodes.length === 0) {
      const nodeIndex = Math.round(
        ((start + end) / 2 / maxX) * (model.nodes.length - 1)
      );
      const index = Math.min(
        Math.max(nodeIndex, 0),
        model.nodes.length - 1
      );
      F[index * 2] -= total;
      continue;
    }

    const forcePerNode = total / activeNodes.length;
    for (const node of activeNodes) {
      F[node.id * 2] -= forcePerNode;
    }
  }

  return F;
}

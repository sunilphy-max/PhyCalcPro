import { FEMModel } from "./femTypes";
import { Load } from "./types";

function findEnclosingElement(model: FEMModel, position: number) {
  return model.elements.find((element) => {
    const start = model.nodes[element.startNode].x;
    const end = model.nodes[element.endNode].x;
    return position >= start && position <= end;
  });
}

export function createLoadVector(
  model: FEMModel,
  loads: Load[]
) {

  const dof = model.nodes.length * 2;

  const F = Array(dof).fill(0);

  for (const load of loads) {

    if (load.type === "point") {
      const exactNode = model.nodes.find((node) => node.x === load.position);
      if (exactNode) {
        F[exactNode.id * 2] -= load.value;
        continue;
      }

      const element = findEnclosingElement(model, load.position);
      if (element) {
        const x1 = model.nodes[element.startNode].x;
        const x2 = model.nodes[element.endNode].x;
        const L = x2 - x1;
        const xi = (load.position - x1) / L;
        F[element.startNode * 2] -= load.value * (1 - xi);
        F[element.endNode * 2] -= load.value * xi;
        continue;
      }

      let nearest = 0;
      let best = Infinity;
      for (const node of model.nodes) {
        const dist = Math.abs(node.x - load.position);
        if (dist < best) {
          best = dist;
          nearest = node.id;
        }
      }
      F[nearest * 2] -= load.value;
      continue;
    }

    if (load.type === "udl") {
      for (const element of model.elements) {
        const n1 = model.nodes[element.startNode];
        const n2 = model.nodes[element.endNode];

        const overlapStart = Math.max(load.start, n1.x);
        const overlapEnd = Math.min(load.end, n2.x);
        const overlap = overlapEnd - overlapStart;

        if (overlap > 0) {
          const total = load.value * overlap;
          F[element.startNode * 2] -= total / 2;
          F[element.endNode * 2] -= total / 2;
        }
      }
      continue;
    }

    if (load.type === "moment") {
      const exactNode = model.nodes.find((node) => node.x === load.position);
      const nearestNode = exactNode ?? model.nodes.reduce((closest, node) => {
        return Math.abs(node.x - load.position) < Math.abs(closest.x - load.position)
          ? node
          : closest;
      }, model.nodes[0]);
      F[nearestNode.id * 2 + 1] -= load.value;
      continue;
    }
  }

  return F;
}
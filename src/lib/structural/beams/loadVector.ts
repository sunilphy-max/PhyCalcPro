import { FEMModel } from "./femTypes";
import { Load } from "./types";

export function createLoadVector(
  model: FEMModel,
  loads: Load[]
) {

  const dof =
    model.nodes.length * 2;

  const F =
    Array(dof).fill(0);

  for (const load of loads) {

    // --------------------------------
    // POINT LOAD
    // --------------------------------

    if (load.type === "point") {

      let nearest = 0;
      let best = Infinity;

      for (const node of model.nodes) {

        const dist =
          Math.abs(node.x - load.position);

        if (dist < best) {
          best = dist;
          nearest = node.id;
        }
      }

      // vertical DOF
      F[nearest * 2] -= load.value;
    }

    // --------------------------------
    // UDL
    // --------------------------------

    if (load.type === "udl") {

      for (const element of model.elements) {

        const n1 =
          model.nodes[element.startNode];

        const n2 =
          model.nodes[element.endNode];

        const overlapStart =
          Math.max(load.start, n1.x);

        const overlapEnd =
          Math.min(load.end, n2.x);

        const overlap =
          overlapEnd - overlapStart;

        if (overlap > 0) {

          const total =
            load.value * overlap;

          F[element.startNode * 2] -= total / 2;
          F[element.endNode * 2] -= total / 2;
        }
      }
    }
  }

  return F;
}
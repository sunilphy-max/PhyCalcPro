import { FEMModel } from "./femTypes";
import { Load } from "./types";

function findEnclosingElement(model: FEMModel, position: number) {
  return model.elements.find((element) => {
    const start = model.nodes[element.startNode]!.x;
    const end = model.nodes[element.endNode]!.x;
    return position >= start && position <= end;
  });
}

function intensityAt(
  start: number,
  end: number,
  wStart: number,
  wEnd: number,
  x: number
) {
  const L = end - start;
  if (L <= 0) return wStart;
  const t = (x - start) / L;
  return wStart + (wEnd - wStart) * t;
}

/** Apply trapezoidal distributed load over element overlap (lumped nodal forces). */
function applyTrapezoidOverlap(
  F: number[],
  n1: { id: number; x: number },
  n2: { id: number; x: number },
  loadStart: number,
  loadEnd: number,
  wStart: number,
  wEnd: number
) {
  const overlapStart = Math.max(loadStart, n1.x);
  const overlapEnd = Math.min(loadEnd, n2.x);
  const overlap = overlapEnd - overlapStart;
  if (overlap <= 0) return;

  const wa = intensityAt(loadStart, loadEnd, wStart, wEnd, overlapStart);
  const wb = intensityAt(loadStart, loadEnd, wStart, wEnd, overlapEnd);
  const total = 0.5 * (wa + wb) * overlap;
  if (Math.abs(total) < 1e-18) return;

  // Centroid of trapezoid from overlapStart
  const denom = wa + wb;
  const xiLocal =
    Math.abs(denom) < 1e-18 ? 0.5 : (wa + 2 * wb) / (3 * denom);
  const centroid = overlapStart + xiLocal * overlap;
  const L = n2.x - n1.x;
  const t = L > 0 ? (centroid - n1.x) / L : 0.5;
  F[n1.id * 2] -= total * (1 - t);
  F[n2.id * 2] -= total * t;
}

export function createLoadVector(model: FEMModel, loads: Load[]) {
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
        const x1 = model.nodes[element.startNode]!.x;
        const x2 = model.nodes[element.endNode]!.x;
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
        const n1 = model.nodes[element.startNode]!;
        const n2 = model.nodes[element.endNode]!;
        applyTrapezoidOverlap(
          F,
          n1,
          n2,
          load.start,
          load.end,
          load.value,
          load.value
        );
      }
      continue;
    }

    if (load.type === "triangular") {
      for (const element of model.elements) {
        const n1 = model.nodes[element.startNode]!;
        const n2 = model.nodes[element.endNode]!;
        applyTrapezoidOverlap(
          F,
          n1,
          n2,
          load.start,
          load.end,
          load.wStart,
          load.wEnd
        );
      }
      continue;
    }

    if (load.type === "moment") {
      const exactNode = model.nodes.find((node) => node.x === load.position);
      const nearestNode =
        exactNode ??
        model.nodes.reduce((closest, node) => {
          return Math.abs(node.x - load.position) < Math.abs(closest.x - load.position)
            ? node
            : closest;
        }, model.nodes[0]!);
      F[nearestNode.id * 2 + 1] -= load.value;
    }
  }

  return F;
}

/** Collect abscissae that must be mesh nodes (supports + load discontinuities). */
export function loadKeyAbscissae(loads: Load[]): number[] {
  const xs: number[] = [];
  for (const load of loads) {
    if (load.type === "point" || load.type === "moment") {
      xs.push(load.position);
    } else if (load.type === "udl" || load.type === "triangular") {
      xs.push(load.start, load.end);
    }
  }
  return xs;
}

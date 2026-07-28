import {
  BeamNode,
  BeamElement,
  FEMModel,
} from "./femTypes";

function uniqueSortedXs(values: number[], length: number, mergeTol: number): number[] {
  const clamped = values
    .map((x) => Math.max(0, Math.min(length, x)))
    .sort((a, b) => a - b);
  const out: number[] = [];
  for (const x of clamped) {
    if (out.length === 0 || Math.abs(x - out[out.length - 1]!) > mergeTol) {
      out.push(x);
    } else {
      // Prefer exact 0 / length when merging
      const last = out[out.length - 1]!;
      if (x === 0 || x === length) out[out.length - 1] = x;
      else if (last !== 0 && last !== length) out[out.length - 1] = 0.5 * (last + x);
    }
  }
  if (out[0] !== 0) out.unshift(0);
  if (out[out.length - 1] !== length) out.push(length);
  return out;
}

/**
 * Build a 1D beam mesh. Key abscissae (supports, load breaks) are forced as nodes
 * so BCs and discontinuities land on exact DOFs.
 */
export function generateBeamMesh(
  length: number,
  E: number,
  I: number,
  divisions = 20,
  keyXs: number[] = []
): FEMModel {
  const mergeTol = Math.max(length * 1e-9, 1e-12);
  const uniform: number[] = [];
  for (let i = 0; i <= divisions; i++) {
    uniform.push((i / divisions) * length);
  }
  const xs = uniqueSortedXs([...uniform, ...keyXs], length, mergeTol);

  const nodes: BeamNode[] = xs.map((x, id) => ({ id, x }));
  const elements: BeamElement[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const L = nodes[i + 1]!.x - nodes[i]!.x;
    if (L <= 0) continue;
    elements.push({
      id: elements.length,
      startNode: i,
      endNode: i + 1,
      E,
      I,
      L,
    });
  }

  return { nodes, elements };
}

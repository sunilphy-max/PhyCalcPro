// FEM core helpers: mesh refinement, convergence testing, and types

export type Mesh1D = {
  nodes: number[]; // node coordinates
  elements: [number, number][]; // node index pairs
};

export type ConvergenceResult = {
  meshSizes: number[];
  errors: number[]; // relative error vs reference
};

export function buildUniformMesh1D(length: number, elements: number): Mesh1D {
  const nodes: number[] = [];
  for (let i = 0; i <= elements; i++) nodes.push((length * i) / elements);

  const el: [number, number][] = [];
  for (let i = 0; i < elements; i++) el.push([i, i + 1]);

  return { nodes, elements: el };
}

export function refineMesh1D(mesh: Mesh1D, factor = 2): Mesh1D {
  const { nodes } = mesh;
  const newNodes: number[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    newNodes.push(a);
    for (let k = 1; k < factor; k++) {
      newNodes.push(a + ((b - a) * k) / factor);
    }
  }
  newNodes.push(nodes[nodes.length - 1]);

  const el: [number, number][] = [];
  for (let i = 0; i < newNodes.length - 1; i++) el.push([i, i + 1]);

  return { nodes: newNodes, elements: el };
}

// Generic convergence test helper. `solver` should accept a mesh and return a scalar error metric
export async function convergenceTest(
  solver: (mesh: Mesh1D) => Promise<number> | number,
  length: number,
  elementCounts: number[]
): Promise<ConvergenceResult> {
  const meshSizes: number[] = [];
  const errors: number[] = [];

  // compute reference solution on the finest mesh
  const finest = elementCounts[elementCounts.length - 1];
  const refMesh = buildUniformMesh1D(length, finest);
  const refVal = await Promise.resolve(solver(refMesh));

  for (const n of elementCounts) {
    const mesh = buildUniformMesh1D(length, n);
    const val = await Promise.resolve(solver(mesh));
    const err = Math.abs((val - refVal) / (refVal || 1));
    meshSizes.push(length / n);
    errors.push(err);
  }

  return { meshSizes, errors };
}

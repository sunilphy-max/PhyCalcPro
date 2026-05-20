export type PlateNode = {
  x: number;
  y: number;
  index: number;
};

export type PlateElement = {
  nodes: [number, number, number, number];
};

export type PlateMesh = {
  nodes: PlateNode[];
  elements: PlateElement[];
  nx: number;
  ny: number;
  hx: number;
  hy: number;
  length: number;
  width: number;
};

export function generatePlateMesh(
  length: number,
  width: number,
  nx: number,
  ny: number
): PlateMesh {
  const hx = length / nx;
  const hy = width / ny;

  const nodes: PlateNode[] = [];

  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      nodes.push({ x: i * hx, y: j * hy, index: j * (nx + 1) + i });
    }
  }

  const elements: PlateElement[] = [];

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const n1 = j * (nx + 1) + i;
      const n2 = n1 + 1;
      const n3 = n2 + (nx + 1);
      const n4 = n1 + (nx + 1);
      elements.push({ nodes: [n1, n2, n3, n4] });
    }
  }

  return {
    nodes,
    elements,
    nx,
    ny,
    hx,
    hy,
    length,
    width,
  };
}

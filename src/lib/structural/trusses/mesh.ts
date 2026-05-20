import type { TrussMesh, TrussNode, TrussElement } from "./types";

export function generateWarrenTrussMesh(
  span: number,
  height: number,
  panels: number
): TrussMesh {
  const dx = span / panels;
  const nodes: TrussNode[] = [];

  for (let i = 0; i <= panels; i++) {
    nodes.push({ x: i * dx, y: 0, index: i });
  }

  const topNodeIndices: number[] = [];
  for (let i = 0; i < panels; i++) {
    const index = nodes.length;
    nodes.push({ x: (i + 0.5) * dx, y: height, index });
    topNodeIndices.push(index);
  }

  const bottomNodeIndices = Array.from({ length: panels + 1 }, (_, i) => i);

  const elements: TrussElement[] = [];

  for (let i = 0; i < panels; i++) {
    const start = i;
    const end = i + 1;
    elements.push(createElement(`bottom-${i}`, nodes[start], nodes[end]));
  }

  for (let i = 0; i < panels - 1; i++) {
    const start = topNodeIndices[i];
    const end = topNodeIndices[i + 1];
    elements.push(createElement(`top-${i}`, nodes[start], nodes[end]));
  }

  for (let i = 0; i < panels; i++) {
    const bottomLeft = i;
    const top = topNodeIndices[i];
    const bottomRight = i + 1;

    elements.push(createElement(`diag-${i}`, nodes[bottomLeft], nodes[top]));
    elements.push(createElement(`diag-reverse-${i}`, nodes[top], nodes[bottomRight]));
  }

  return {
    nodes,
    elements,
    topNodeIndices,
    bottomNodeIndices,
    span,
    height,
    panels,
  };
}

function createElement(id: string, startNode: TrussNode, endNode: TrussNode): TrussElement {
  const dx = endNode.x - startNode.x;
  const dy = endNode.y - startNode.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    id,
    start: startNode.index,
    end: endNode.index,
    length,
    cos: dx / length,
    sin: dy / length,
  };
}

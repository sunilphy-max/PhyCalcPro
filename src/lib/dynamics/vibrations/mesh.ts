import type { VibrationConfig, VibrationElement, VibrationMesh, VibrationNode } from "./types";

export function generateVibrationMesh(config: VibrationConfig): VibrationMesh {
  const { length, segments, A, I, rho } = config;
  const dx = length / segments;

  const nodes: VibrationNode[] = [];
  for (let i = 0; i <= segments; i++) {
    nodes.push({ x: i * dx, index: i });
  }

  const elements: VibrationElement[] = [];
  for (let i = 0; i < segments; i++) {
    elements.push(createElement(`elem-${i}`, nodes[i], nodes[i + 1], A, I, rho));
  }

  return {
    nodes,
    elements,
    length,
    segments,
  };
}

function createElement(id: string, start: VibrationNode, end: VibrationNode, A: number, I: number, rho: number): VibrationElement {
  const dx = end.x - start.x;
  return {
    id,
    start: start.index,
    end: end.index,
    length: dx,
    A,
    I,
    rho,
  };
}

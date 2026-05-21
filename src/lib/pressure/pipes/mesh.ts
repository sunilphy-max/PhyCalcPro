import type { PressurePipeConfig, PressurePipeElement, PressurePipeNode } from "./types";

export type PressurePipeMesh = {
  nodes: PressurePipeNode[];
  elements: PressurePipeElement[];
  radius: number;
  length: number;
  segments: number;
};

export function generatePressurePipeMesh(config: PressurePipeConfig): PressurePipeMesh {
  const { radius, length, thickness, segments } = config;
  const angleStep = (Math.PI * 2) / segments;
  const nodes: PressurePipeNode[] = [];
  const elements: PressurePipeElement[] = [];

  const A = thickness * length;
  const I = (length * Math.pow(thickness, 3)) / 12;

  for (let i = 0; i < segments; i++) {
    const theta = i * angleStep;
    nodes.push({ x: radius * Math.cos(theta), y: radius * Math.sin(theta), index: i });
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const start = nodes[i];
    const end = nodes[next];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSegment = Math.hypot(dx, dy);

    elements.push({
      id: `element-${i}`,
      start: start.index,
      end: end.index,
      length: lengthSegment,
      cos: dx / lengthSegment,
      sin: dy / lengthSegment,
      A,
      I,
    });
  }

  return { nodes, elements, radius, length, segments };
}

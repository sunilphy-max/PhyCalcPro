import type { PressureVesselConfig, PressureVesselElement, PressureVesselNode } from "./types";

export type PressureVesselMesh = {
  nodes: PressureVesselNode[];
  elements: PressureVesselElement[];
  radius: number;
  length: number;
  segments: number;
};

export function generatePressureVesselMesh(config: PressureVesselConfig): PressureVesselMesh {
  const { radius, length, segments, A } = config;
  const angleStep = (Math.PI * 2) / segments;
  const nodes: PressureVesselNode[] = [];
  const elements: PressureVesselElement[] = [];

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
      area: A,
    });
  }

  return {
    nodes,
    elements,
    radius,
    length,
    segments,
  };
}

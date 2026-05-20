import type { FrameElement, FrameNode, FrameConfig } from "./types";

export type FrameMesh = {
  nodes: FrameNode[];
  elements: FrameElement[];
  span: number;
  height: number;
  segments: number;
  leftColumnIndex: number;
  rightColumnIndex: number;
  beamNodeIndices: number[];
};

export function generatePortalFrameMesh(config: FrameConfig): FrameMesh {
  const { span, height, segments, A, I } = config;
  const dx = span / segments;
  const nodes: FrameNode[] = [];

  nodes.push({ x: 0, y: 0, index: 0 });
  nodes.push({ x: 0, y: height, index: 1 });

  const beamNodeIndices: number[] = [1];
  for (let i = 1; i <= segments; i++) {
    const index = nodes.length;
    nodes.push({ x: i * dx, y: height, index });
    beamNodeIndices.push(index);
  }

  const rightBottomIndex = nodes.length;
  nodes.push({ x: span, y: 0, index: rightBottomIndex });

  const elements: FrameElement[] = [];
  elements.push(createElement("left-column", nodes[0], nodes[1], A, I));

  for (let i = 0; i < beamNodeIndices.length - 1; i++) {
    const start = nodes[beamNodeIndices[i]];
    const end = nodes[beamNodeIndices[i + 1]];
    elements.push(createElement(`beam-${i}`, start, end, A, I));
  }

  elements.push(createElement("right-column", nodes[beamNodeIndices[beamNodeIndices.length - 1]], nodes[rightBottomIndex], A, I));

  return {
    nodes,
    elements,
    span,
    height,
    segments,
    leftColumnIndex: 0,
    rightColumnIndex: rightBottomIndex,
    beamNodeIndices,
  };
}

function createElement(id: string, start: FrameNode, end: FrameNode, A: number, I: number): FrameElement {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    id,
    start: start.index,
    end: end.index,
    length,
    cos: dx / length,
    sin: dy / length,
    A,
    I,
  };
}

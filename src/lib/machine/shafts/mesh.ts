/**
 * Shaft Mesh Generator — uniform or stepped / hollow sections
 */

import type { ShaftSegment } from "./types";
import type { ShaftFEMModel, ShaftNode, ShaftElement } from "./femTypes";

function sectionProperties(outerDiameter: number, innerDiameter = 0) {
  const R = outerDiameter / 2;
  const r = innerDiameter / 2;
  const area = Math.PI * (R * R - r * r);
  const polarMoment = (Math.PI * (Math.pow(outerDiameter, 4) - Math.pow(innerDiameter, 4))) / 32;
  const secondMoment = (Math.PI * (Math.pow(outerDiameter, 4) - Math.pow(innerDiameter, 4))) / 64;
  return { area, polarMoment, secondMoment };
}

export function resolveSegments(
  length: number,
  diameter: number,
  segments?: ShaftSegment[]
): ShaftSegment[] {
  if (segments && segments.length > 0) {
    return segments.map((s) => ({
      length: s.length,
      outerDiameter: s.outerDiameter,
      innerDiameter: s.innerDiameter ?? 0,
    }));
  }
  return [{ length, outerDiameter: diameter, innerDiameter: 0 }];
}

export function generateShaftMesh(
  length: number,
  diameter: number,
  E: number,
  G: number,
  divisions = 20,
  segments?: ShaftSegment[],
  density = 7850
): ShaftFEMModel {
  const resolved = resolveSegments(length, diameter, segments);
  const totalLength = resolved.reduce((sum, s) => sum + s.length, 0);

  const nodes: ShaftNode[] = [];
  const elements: ShaftElement[] = [];

  const segmentDivisions = resolved.map((seg) =>
    Math.max(2, Math.round((seg.length / totalLength) * divisions))
  );

  let nodeId = 0;
  let x = 0;
  nodes.push({ id: nodeId++, x: 0 });

  let elementId = 0;
  for (let si = 0; si < resolved.length; si++) {
    const seg = resolved[si]!;
    const nDiv = segmentDivisions[si]!;
    const dx = seg.length / nDiv;
    const props = sectionProperties(seg.outerDiameter, seg.innerDiameter ?? 0);

    for (let i = 0; i < nDiv; i++) {
      const x2 = x + (i + 1) * dx;
      if (i < nDiv - 1 || si < resolved.length - 1) {
        nodes.push({ id: nodeId++, x: x2 });
      } else if (nodes[nodes.length - 1]!.x < x2 - 1e-12) {
        nodes.push({ id: nodeId++, x: x2 });
      }

      const startNode = nodes.length - 2;
      const endNode = nodes.length - 1;

      elements.push({
        id: elementId++,
        startNode,
        endNode,
        E,
        G,
        diameter: seg.outerDiameter,
        innerDiameter: seg.innerDiameter ?? 0,
        length: dx,
        polarMoment: props.polarMoment,
        secondMoment: props.secondMoment,
        area: props.area,
        density,
      });
    }
    x += seg.length;
  }

  return {
    nodes,
    elements,
    length: totalLength,
  };
}

export function findNearestNodeIndex(nodes: ShaftNode[], position: number): number {
  let best = 0;
  let minDist = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const d = Math.abs(nodes[i]!.x - position);
    if (d < minDist) {
      minDist = d;
      best = i;
    }
  }
  return best;
}

export function diameterAtNode(model: ShaftFEMModel, nodeIndex: number): number {
  for (const el of model.elements) {
    if (el.startNode === nodeIndex || el.endNode === nodeIndex) {
      return el.diameter;
    }
  }
  return model.elements[0]?.diameter ?? 0;
}

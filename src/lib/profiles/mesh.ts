/**
 * Profiles Mesh Generation
 * Creates FEA mesh for cross-sectional analysis
 */

import type { CrossSectionFEAModel, CrossSectionNode, CrossSectionElement } from "./femTypes";

/**
 * Generate mesh for rectangular cross-section
 */
export function generateProfileMesh(
  width: number,
  height: number,
  meshX: number = 10,
  meshY: number = 10
): CrossSectionFEAModel {
  const nodes: CrossSectionNode[] = [];
  const elements: CrossSectionElement[] = [];

  // Create nodes
  let nodeId = 0;
  const nodeGrid: number[][] = [];

  for (let j = 0; j <= meshY; j++) {
    nodeGrid[j] = [];
    for (let i = 0; i <= meshX; i++) {
      const x = (i / meshX) * width;
      const y = (j / meshY) * height;

      nodes.push({
        id: nodeId,
        x,
        y,
      });

      nodeGrid[j][i] = nodeId;
      nodeId++;
    }
  }

  // Create quad elements
  let elemId = 0;
  for (let j = 0; j < meshY; j++) {
    for (let i = 0; i < meshX; i++) {
      const n1 = nodeGrid[j][i];
      const n2 = nodeGrid[j][i + 1];
      const n3 = nodeGrid[j + 1][i + 1];
      const n4 = nodeGrid[j + 1][i];

      elements.push({
        id: elemId,
        nodes: [n1, n2, n3, n4],
      });

      elemId++;
    }
  }

  return { nodes, elements };
}

/**
 * Generate mesh for circular cross-section
 */
export function generateCircularProfileMesh(
  diameter: number,
  meshSegments: number = 12,
  meshRadial: number = 8
): CrossSectionFEAModel {
  const nodes: CrossSectionNode[] = [];
  const elements: CrossSectionElement[] = [];
  const radius = diameter / 2;
  const center_x = radius;
  const center_y = radius;

  // Center node
  nodes.push({
    id: 0,
    x: center_x,
    y: center_y,
  });

  // Create nodes in concentric circles
  const nodeGrid: number[][] = [[0]]; // Center

  for (let r = 1; r <= meshRadial; r++) {
    nodeGrid[r] = [];
    const radialDist = (r / meshRadial) * radius;

    for (let theta = 0; theta < meshSegments; theta++) {
      const angle = (theta / meshSegments) * 2 * Math.PI;
      const x = center_x + radialDist * Math.cos(angle);
      const y = center_y + radialDist * Math.sin(angle);

      nodes.push({
        id: nodes.length,
        x,
        y,
      });

      nodeGrid[r].push(nodes.length - 1);
    }
  }

  // Create triangular elements
  let elemId = 0;

  // Central elements (from center to first ring)
  for (let theta = 0; theta < meshSegments; theta++) {
    const n1 = 0;
    const n2 = nodeGrid[1][theta];
    const n3 = nodeGrid[1][(theta + 1) % meshSegments];

    elements.push({
      id: elemId,
      nodes: [n1, n2, n3],
    });

    elemId++;
  }

  // Radial ring elements
  for (let r = 1; r < meshRadial; r++) {
    for (let theta = 0; theta < meshSegments; theta++) {
      const n1 = nodeGrid[r][theta];
      const n2 = nodeGrid[r][(theta + 1) % meshSegments];
      const n3 = nodeGrid[r + 1][(theta + 1) % meshSegments];
      const n4 = nodeGrid[r + 1][theta];

      // Split quad into two triangles
      elements.push({
        id: elemId,
        nodes: [n1, n2, n3],
      });
      elemId++;

      elements.push({
        id: elemId,
        nodes: [n1, n3, n4],
      });
      elemId++;
    }
  }

  return { nodes, elements };
}

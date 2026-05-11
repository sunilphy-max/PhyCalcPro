/**
 * Profiles Stiffness and Area Properties Integration
 * Computes area properties using numerical integration over cross-section
 */

import type { CrossSectionFEAModel } from "./femTypes";

/**
 * Gauss quadrature points and weights (2x2 for quad elements)
 */
function getGaussPoints(): { x: number[]; y: number[]; w: number[] } {
  const sqrt3 = Math.sqrt(1 / 3);
  return {
    x: [-sqrt3, sqrt3, -sqrt3, sqrt3],
    y: [-sqrt3, -sqrt3, sqrt3, sqrt3],
    w: [1, 1, 1, 1],
  };
}

/**
 * Compute shape functions for quad element (bilinear)
 */
function shapeFunctionsQuad(
  xi: number,
  eta: number
): {
  N: number[];
  dNdxi: number[];
  dNdeta: number[];
} {
  const N = [
    ((1 - xi) * (1 - eta)) / 4,
    ((1 + xi) * (1 - eta)) / 4,
    ((1 + xi) * (1 + eta)) / 4,
    ((1 - xi) * (1 + eta)) / 4,
  ];

  const dNdxi = [
    (-(1 - eta)) / 4,
    (1 - eta) / 4,
    (1 + eta) / 4,
    (-(1 + eta)) / 4,
  ];

  const dNdeta = [
    (-(1 - xi)) / 4,
    (-(1 + xi)) / 4,
    (1 + xi) / 4,
    (1 - xi) / 4,
  ];

  return { N, dNdxi, dNdeta };
}

/**
 * Compute Jacobian and determinant for quad element
 */
function jacobianQuad(
  nodeCoords: { x: number; y: number }[],
  dNdxi: number[],
  dNdeta: number[]
): { J: number[][]; detJ: number } {
  let dxdxi = 0,
    dydxi = 0,
    dxdeta = 0,
    dydeta = 0;

  for (let i = 0; i < 4; i++) {
    dxdxi += dNdxi[i] * nodeCoords[i].x;
    dydxi += dNdxi[i] * nodeCoords[i].y;
    dxdeta += dNdeta[i] * nodeCoords[i].x;
    dydeta += dNdeta[i] * nodeCoords[i].y;
  }

  const J = [[dxdxi, dydxi], [dxdeta, dydeta]];
  const detJ = dxdxi * dydeta - dxdeta * dydxi;

  return { J, detJ };
}

/**
 * Numerically integrate area properties over cross-section
 */
export function integrateAreaProperties(model: CrossSectionFEAModel): {
  area: number;
  Qx: number;
  Qy: number;
  Ixx: number;
  Iyy: number;
  Ixy: number;
} {
  let area = 0;
  let Qx = 0; // First moment about x
  let Qy = 0; // First moment about y
  let Ixx = 0; // Second moment about x
  let Iyy = 0; // Second moment about y
  let Ixy = 0; // Product moment

  const gaussPts = getGaussPoints();

  for (const elem of model.elements) {
    // Get node coordinates
    const nodeCoords = elem.nodes.map((n) => {
      const node = model.nodes[n];
      return { x: node.x, y: node.y };
    });

    // Gauss integration
    for (let gp = 0; gp < 4; gp++) {
      const xi = gaussPts.x[gp];
      const eta = gaussPts.y[gp];
      const w = gaussPts.w[gp];

      const sf = shapeFunctionsQuad(xi, eta);
      const jac = jacobianQuad(nodeCoords, sf.dNdxi, sf.dNdeta);

      if (Math.abs(jac.detJ) < 1e-12) continue;

      // Physical coordinates at Gauss point
      let x = 0,
        y = 0;
      for (let i = 0; i < 4; i++) {
        x += sf.N[i] * nodeCoords[i].x;
        y += sf.N[i] * nodeCoords[i].y;
      }

      const dA = w * Math.abs(jac.detJ);

      area += dA;
      Qx += y * dA; // Integral of y dA
      Qy += x * dA; // Integral of x dA
      Ixx += y * y * dA; // Integral of y² dA
      Iyy += x * x * dA; // Integral of x² dA
      Ixy += x * y * dA; // Integral of xy dA
    }
  }

  return { area, Qx, Qy, Ixx, Iyy, Ixy };
}

/**
 * Compute principal moments and axes
 */
export function computePrincipalMoments(
  Ixx: number,
  Iyy: number,
  Ixy: number
): { I1: number; I2: number; theta: number } {
  const sum = Ixx + Iyy;
  const diff = Ixx - Iyy;
  const sqrt_term = Math.sqrt(diff * diff + 4 * Ixy * Ixy);

  const I1 = (sum + sqrt_term) / 2;
  const I2 = (sum - sqrt_term) / 2;

  let theta = 0;
  if (Math.abs(Ixy) > 1e-12) {
    theta = (Math.atan2(2 * Ixy, diff) / 2) * (180 / Math.PI);
  }

  return { I1, I2, theta };
}

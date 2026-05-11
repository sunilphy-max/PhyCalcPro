/**
 * Profiles FEA Solver
 * FEA-based computation of cross-sectional area properties
 */

import { generateProfileMesh, generateCircularProfileMesh } from "./mesh";
import { integrateAreaProperties, computePrincipalMoments } from "./stiffness";
import {
  calculateCentroid,
  calculateCentralMoments,
  calculateSectionModuli,
  calculatePolarMoment,
} from "./femPost";
import type { AreaPropertiesConfig, AreaPropertiesResult } from "./types";

export function solveAreaPropertiesFEM(config: AreaPropertiesConfig): AreaPropertiesResult {
  const { shape } = config;
  const shapeType = shape.shape;

  // ===========================
  // MESH GENERATION
  // ===========================
  let model;

  switch (shapeType) {
    case "rectangle": {
      const props = shape.rectangle!;
      model = generateProfileMesh(props.width, props.height, 12, 12);
      break;
    }

    case "circle": {
      const props = shape.circle!;
      model = generateCircularProfileMesh(props.diameter, 16, 10);
      break;
    }

    case "hollow_circle": {
      const props = shape.hollowCircle!;
      // Use outer diameter for mesh, inner hole will be ignored in integration
      model = generateCircularProfileMesh(props.outerDiameter, 16, 10);
      break;
    }

    default:
      // Fallback to rectangle for other shapes
      model = generateProfileMesh(1, 1, 10, 10);
  }

  // ===========================
  // NUMERICAL INTEGRATION
  // ===========================
  const { area, Qx, Qy, Ixx, Iyy, Ixy } = integrateAreaProperties(model);

  // ===========================
  // CENTROID CALCULATION
  // ===========================
  const centroid = calculateCentroid(area, Qx, Qy);

  // ===========================
  // CENTRAL MOMENTS
  // ===========================
  const { Ixx_c, Iyy_c, Ixy_c } = calculateCentralMoments(
    Ixx,
    Iyy,
    Ixy,
    area,
    centroid.x,
    centroid.y
  );

  // ===========================
  // PRINCIPAL MOMENTS
  // ===========================
  const { I1, I2, theta } = computePrincipalMoments(Ixx_c, Iyy_c, Ixy_c);

  // ===========================
  // SECTION MODULI
  // ===========================
  let width = 1,
    height = 1;
  if (shape.rectangle) {
    width = shape.rectangle.width;
    height = shape.rectangle.height;
  } else if (shape.circle) {
    width = height = shape.circle.diameter;
  }

  const { sx, sy } = calculateSectionModuli(Ixx_c, Iyy_c, width, height);

  // ===========================
  // POLAR MOMENT
  // ===========================
  const j = calculatePolarMoment(Ixx_c, Iyy_c);

  // ===========================
  // RESULTS COMPILATION
  // ===========================
  return {
    area,
    centroid,
    ixx: Ixx_c,
    iyy: Iyy_c,
    ixy: Ixy_c,
    i1: I1,
    i2: I2,
    theta,
    sx,
    sy,
    j,
    shapeData: shape,
  };
}

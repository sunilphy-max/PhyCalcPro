/**
 * Cross-Sectional Area Properties Solver
 * Calculates area, centroid, and moments of inertia for various shapes
 */

import type {
  AreaPropertiesConfig,
  AreaPropertiesResult,
  ShapeType,
  RectangleProps,
  CircleProps,
  HollowCircleProps,
  IBeamProps,
  TBeamProps,
  CChannelProps,
  AngleProps,
  CustomProps,
} from "./types";

/**
 * Calculate properties for a rectangle
 */
function calculateRectangle(props: RectangleProps): AreaPropertiesResult {
  const { width, height } = props;
  const area = width * height;
  const centroid = { x: width / 2, y: height / 2 };
  const ixx = (width * height ** 3) / 12;
  const iyy = (height * width ** 3) / 12;
  const ixy = 0;

  return {
    area,
    centroid,
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / (height / 2),
    sy: iyy / (width / 2),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Calculate properties for a circle
 */
function calculateCircle(props: CircleProps): AreaPropertiesResult {
  const { diameter } = props;
  const radius = diameter / 2;
  const area = Math.PI * radius ** 2;
  const centroid = { x: radius, y: radius };
  const ixx = (Math.PI * radius ** 4) / 4;
  const iyy = ixx;
  const ixy = 0;

  return {
    area,
    centroid,
    ixx,
    iyy,
    ixy,
    i1: ixx,
    i2: ixx,
    theta: 0,
    sx: ixx / radius,
    sy: iyy / radius,
    j: 2 * ixx,
    shapeData: props,
  };
}

/**
 * Calculate properties for a hollow circle
 */
function calculateHollowCircle(props: HollowCircleProps): AreaPropertiesResult {
  const { outerDiameter, innerDiameter } = props;
  const r_outer = outerDiameter / 2;
  const r_inner = innerDiameter / 2;

  const area = Math.PI * (r_outer ** 2 - r_inner ** 2);
  const centroid = { x: r_outer, y: r_outer };

  const ixx = (Math.PI / 4) * (r_outer ** 4 - r_inner ** 4);
  const iyy = ixx;
  const ixy = 0;

  return {
    area,
    centroid,
    ixx,
    iyy,
    ixy,
    i1: ixx,
    i2: ixx,
    theta: 0,
    sx: ixx / r_outer,
    sy: iyy / r_outer,
    j: 2 * ixx,
    shapeData: props,
  };
}

/**
 * Calculate properties for an I-beam
 */
function calculateIBeam(props: IBeamProps): AreaPropertiesResult {
  const { height, width, webThickness, flangeThickness } = props;

  // Calculate areas and centroids of flanges and web
  const flangeArea = flangeThickness * width;
  const webArea = webThickness * (height - 2 * flangeThickness);
  const area = 2 * flangeArea + webArea;

  // Centroid calculation
  const centroidY = height / 2;

  // Moments of inertia
  const ixx_flanges = 2 * (flangeArea * (height - flangeThickness) ** 2 / 4);
  const ixx_web = (webThickness * (height - 2 * flangeThickness) ** 3) / 12;
  const ixx = ixx_flanges + ixx_web;

  const iyy_flange = 2 * ((width * flangeThickness ** 3) / 12);
  const iyy_web = (webThickness ** 3 * (height - 2 * flangeThickness)) / 12;
  const iyy = iyy_flange + iyy_web;

  const ixy = 0;

  return {
    area,
    centroid: { x: width / 2, y: centroidY },
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / (height / 2),
    sy: iyy / (width / 2),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Calculate properties for a T-beam
 */
function calculateTBeam(props: TBeamProps): AreaPropertiesResult {
  const { height, width, webThickness, flangeThickness } = props;

  // Areas
  const flangeArea = flangeThickness * width;
  const webArea = webThickness * (height - flangeThickness);
  const area = flangeArea + webArea;

  // Centroid calculation
  const centroidY = (flangeArea * flangeThickness / 2 + webArea * (flangeThickness + (height - flangeThickness) / 2)) / area;

  // Moments of inertia about centroid
  const ixx_flange = (width * flangeThickness ** 3) / 12 + flangeArea * (centroidY - flangeThickness / 2) ** 2;
  const ixx_web = (webThickness * (height - flangeThickness) ** 3) / 12 + webArea * (centroidY - flangeThickness - (height - flangeThickness) / 2) ** 2;
  const ixx = ixx_flange + ixx_web;

  const iyy = (flangeThickness * width ** 3) / 12 + (webThickness ** 3 * (height - flangeThickness)) / 12;

  const ixy = 0;

  return {
    area,
    centroid: { x: width / 2, y: centroidY },
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / (height - centroidY),
    sy: iyy / (width / 2),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Calculate properties for a C-channel
 */
function calculateCChannel(props: CChannelProps): AreaPropertiesResult {
  const { height, width, webThickness, flangeThickness } = props;

  // Simplified calculation - treating as three rectangles
  const flangeArea = flangeThickness * (width - webThickness);
  const webArea = webThickness * (height - 2 * flangeThickness);
  const area = 2 * flangeArea + webArea;

  const centroid = { x: width / 2, y: height / 2 };

  // Approximate moments of inertia
  const ixx = (width * height ** 3 - (width - webThickness) * (height - 2 * flangeThickness) ** 3) / 12;
  const iyy = (height * width ** 3 - (height - 2 * flangeThickness) * (width - webThickness) ** 3) / 12;

  const ixy = 0;

  return {
    area,
    centroid,
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / (height / 2),
    sy: iyy / (width / 2),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Calculate properties for an angle section
 */
function calculateAngle(props: AngleProps): AreaPropertiesResult {
  const { leg1, leg2, thickness } = props;

  const area = thickness * (leg1 + leg2 - thickness);

  // Centroid calculation
  const centroidX = (leg1 * thickness * leg1 / 2 + leg2 * thickness * thickness / 2) / area;
  const centroidY = (leg1 * thickness * thickness / 2 + leg2 * thickness * leg2 / 2) / area;

  // Moments of inertia (simplified)
  const ixx = (thickness * leg1 ** 3 + thickness * leg2 ** 3) / 12;
  const iyy = (leg1 * thickness ** 3 + leg2 * thickness ** 3) / 12;

  const ixy = 0;

  return {
    area,
    centroid: { x: centroidX, y: centroidY },
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / Math.max(leg1, leg2),
    sy: iyy / Math.max(leg1, leg2),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Use custom properties
 */
function calculateCustom(props: CustomProps): AreaPropertiesResult {
  const { area, centroidX, centroidY, ixx, iyy, ixy } = props;

  return {
    area,
    centroid: { x: centroidX, y: centroidY },
    ixx,
    iyy,
    ixy,
    i1: Math.max(ixx, iyy),
    i2: Math.min(ixx, iyy),
    theta: 0,
    sx: ixx / Math.max(centroidX, centroidY),
    sy: iyy / Math.max(centroidX, centroidY),
    j: ixx + iyy,
    shapeData: props,
  };
}

/**
 * Main solver function
 */
export function solveAreaProperties(config: AreaPropertiesConfig): AreaPropertiesResult {
  const { shape } = config;

  switch (shape.shape) {
    case "rectangle":
      return shape.rectangle ? calculateRectangle(shape.rectangle) : calculateRectangle({ width: 1, height: 1 });

    case "circle":
      return shape.circle ? calculateCircle(shape.circle) : calculateCircle({ diameter: 1 });

    case "hollow_circle":
      return shape.hollowCircle ? calculateHollowCircle(shape.hollowCircle) : calculateHollowCircle({ outerDiameter: 1, innerDiameter: 0.5 });

    case "i_beam":
      return shape.iBeam ? calculateIBeam(shape.iBeam) : calculateIBeam({ height: 1, width: 1, webThickness: 0.1, flangeThickness: 0.1 });

    case "t_beam":
      return shape.tBeam ? calculateTBeam(shape.tBeam) : calculateTBeam({ height: 1, width: 1, webThickness: 0.1, flangeThickness: 0.1 });

    case "c_channel":
      return shape.cChannel ? calculateCChannel(shape.cChannel) : calculateCChannel({ height: 1, width: 1, webThickness: 0.1, flangeThickness: 0.1 });

    case "angle":
      return shape.angle ? calculateAngle(shape.angle) : calculateAngle({ leg1: 1, leg2: 1, thickness: 0.1 });

    case "custom":
      return shape.custom ? calculateCustom(shape.custom) : calculateCustom({ area: 1, centroidX: 0, centroidY: 0, ixx: 1, iyy: 1, ixy: 0 });

    default:
      throw new Error(`Unsupported shape type: ${shape.shape}`);
  }
}

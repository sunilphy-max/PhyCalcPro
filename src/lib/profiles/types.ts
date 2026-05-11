/**
 * Cross-Sectional Area Properties Module Types
 * Calculates area, centroid, and moment of inertia for various shapes
 */

export type ShapeType =
  | "rectangle"
  | "circle"
  | "hollow_circle"
  | "i_beam"
  | "t_beam"
  | "c_channel"
  | "angle"
  | "custom";

export type RectangleProps = {
  width: number;
  height: number;
};

export type CircleProps = {
  diameter: number;
};

export type HollowCircleProps = {
  outerDiameter: number;
  innerDiameter: number;
};

export type IBeamProps = {
  height: number;
  width: number;
  webThickness: number;
  flangeThickness: number;
};

export type TBeamProps = {
  height: number;
  width: number;
  webThickness: number;
  flangeThickness: number;
};

export type CChannelProps = {
  height: number;
  width: number;
  webThickness: number;
  flangeThickness: number;
};

export type AngleProps = {
  leg1: number;
  leg2: number;
  thickness: number;
};

export type CustomProps = {
  area: number;
  centroidX: number;
  centroidY: number;
  ixx: number;
  iyy: number;
  ixy: number;
};

export type ShapeProperties = {
  shape: ShapeType;
  rectangle?: RectangleProps;
  circle?: CircleProps;
  hollowCircle?: HollowCircleProps;
  iBeam?: IBeamProps;
  tBeam?: TBeamProps;
  cChannel?: CChannelProps;
  angle?: AngleProps;
  custom?: CustomProps;
};

export type AreaPropertiesConfig = {
  shape: ShapeProperties;
  referencePoint?: { x: number; y: number };
};

export type AreaPropertiesResult = {
  // Basic properties (FEA-computed via numerical integration)
  area: number;
  centroid: { x: number; y: number };

  // Moments of inertia (about global axes)
  ixx: number; // Second moment about x-axis (central)
  iyy: number; // Second moment about y-axis (central)
  ixy: number; // Product moment of area

  // Principal moments
  i1: number; // Maximum principal moment
  i2: number; // Minimum principal moment
  theta: number; // Principal axis angle (degrees)

  // Section moduli
  sx: number; // Section modulus about x-axis
  sy: number; // Section modulus about y-axis

  // Polar moment
  j: number; // Polar moment of inertia (J = Ixx + Iyy)

  // Shape-specific data
  shapeData: any;

  // Analysis metadata
  analysisType?: "FEA";
};

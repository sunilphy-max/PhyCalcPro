export type MultiPulleyConfig = {
  diameters: number[];
  centerDistances: number[];
  driveType: "open" | "crossed";
};

export type MultiPulleyResult = {
  totalBeltLength: number;
  wrapAnglesDeg: number[];
  minWrapAngle: number;
  segmentLengths: number[];
  radialLoads: number[];
  pulleyCount: number;
};

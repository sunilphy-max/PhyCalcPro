export type CamToolpathsConfig = {
  toolDiameter: number; // mm
  numFlutes: number;
  spindleSpeed: number; // rpm
  feedPerTooth: number; // mm/tooth
  axialDepth: number; // mm
  radialDepth: number; // mm
  stockLength: number; // mm
  stockWidth: number; // mm
  stepOverPercent: number; // %
};

export type CamToolpathsResult = {
  toolDiameter: number;
  numFlutes: number;
  spindleSpeed: number;
  feedPerTooth: number;
  feedRate: number;
  surfaceSpeed: number;
  stepOverWidth: number;
  passes: number;
  materialRemovalRate: number;
  timePerPass: number;
  totalCutTime: number;
  axialDepth: number;
  radialDepth: number;
  stockLength: number;
  stockWidth: number;
};
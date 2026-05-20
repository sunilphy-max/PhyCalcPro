export type FrameNode = {
  x: number;
  y: number;
  index: number;
};

export type FrameElement = {
  id: string;
  start: number;
  end: number;
  length: number;
  cos: number;
  sin: number;
  A: number;
  I: number;
};

export type FrameConfig = {
  span: number;
  height: number;
  segments: number;
  A: number;
  I: number;
  E: number;
  load: number;
};

export type FrameResult = {
  nodes: FrameNode[];
  elements: FrameElement[];
  displacements: { dx: number; dy: number; rotation: number }[];
  memberAxial: number[];
  memberMoment: number[];
  reactions: { node: number; fx: number; fy: number; m: number }[];
  maxDisplacement: number;
  maxAxial: number;
  maxMoment: number;
  topNodesX: number[];
  topDeflections: number[];
  segments: number;
  span: number;
  height: number;
};

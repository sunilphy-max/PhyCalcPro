export type RollerChainConfig = {
  power: number;
  speedDriver: number;
  teethDriver: number;
  teethDriven: number;
  pitch: number;
  strands: number;
  serviceFactor: number;
};

export type RollerChainResult = {
  ratio: number;
  drivenSpeed: number;
  chainSpeed: number;
  chainTension: number;
  powerCapacity: number;
  powerUtilization: number;
  estimatedLifeHours: number;
  centerDistance: number;
};

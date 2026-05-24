export type HeatExchangerFlowType = "counterflow" | "parallel";

export type HeatExchangerConfig = {
  hotFlowRate: number; // kg/s
  coldFlowRate: number; // kg/s
  hotCp: number; // J/kg·K
  coldCp: number; // J/kg·K
  hotInletTemp: number; // °C
  coldInletTemp: number; // °C
  hotOutletTemp: number; // °C
  U: number; // W/m²·K
  area: number; // m²
  flowType: HeatExchangerFlowType;
};

export type HeatExchangerResult = {
  hotFlowRate: number;
  coldFlowRate: number;
  hotCp: number;
  coldCp: number;
  hotInletTemp: number;
  coldInletTemp: number;
  hotOutletTemp: number;
  coldOutletTemp: number;
  heatTransferRate: number; // W
  LMTD: number; // K
  deltaT1: number;
  deltaT2: number;
  area: number; // m²
  requiredArea: number; // m²
  U: number;
  NTU: number;
  effectiveness: number;
  capacityHot: number; // W/K
  capacityCold: number; // W/K
  Cmin: number;
  Cmax: number;
  Cr: number;
  Qmax: number;
  actualEffectiveness: number;
  flowType: HeatExchangerFlowType;
};

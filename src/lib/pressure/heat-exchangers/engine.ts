import type { HeatExchangerConfig, HeatExchangerResult } from "./types";

function safeLMTD(dT1: number, dT2: number) {
  if (dT1 <= 0 || dT2 <= 0) {
    return 0;
  }
  if (Math.abs(dT1 - dT2) < 1e-6) {
    return dT1;
  }
  return (dT1 - dT2) / Math.log(dT1 / dT2);
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function effectivenessCounterflow(NTU: number, Cr: number) {
  if (Cr === 1) {
    return NTU / (1 + NTU);
  }
  const expTerm = Math.exp(-NTU * (1 - Cr));
  return (1 - expTerm) / (1 - Cr * expTerm);
}

function effectivenessParallel(NTU: number, Cr: number) {
  return 1 - Math.exp(-NTU * (1 + Cr));
}

export function solveHeatExchangerEngine(config: HeatExchangerConfig): HeatExchangerResult {
  const hotFlowRate = Math.max(config.hotFlowRate, 1e-6);
  const coldFlowRate = Math.max(config.coldFlowRate, 1e-6);
  const hotCp = Math.max(config.hotCp, 1);
  const coldCp = Math.max(config.coldCp, 1);
  const hotInletTemp = config.hotInletTemp;
  const coldInletTemp = config.coldInletTemp;
  const hotOutletTemp = Math.min(config.hotOutletTemp, hotInletTemp - 0.1);
  const capacityHot = hotFlowRate * hotCp;
  const capacityCold = coldFlowRate * coldCp;
  const Cmin = Math.min(capacityHot, capacityCold);
  const Cmax = Math.max(capacityHot, capacityCold);
  const Cr = Cmin / Cmax;
  const heatTransferRate = capacityHot * (hotInletTemp - hotOutletTemp);
  const coldOutletTemp = coldInletTemp + heatTransferRate / capacityCold;
  const deltaT1 = config.flowType === "counterflow"
    ? hotInletTemp - coldOutletTemp
    : hotInletTemp - coldInletTemp;
  const deltaT2 = config.flowType === "counterflow"
    ? hotOutletTemp - coldInletTemp
    : hotOutletTemp - coldOutletTemp;
  const LMTD = safeLMTD(deltaT1, deltaT2);
  const requiredArea = LMTD > 0 ? heatTransferRate / (config.U * LMTD) : 0;
  const NTU = config.U * config.area / Cmin;
  const effectiveness = config.flowType === "counterflow"
    ? effectivenessCounterflow(NTU, Cr)
    : effectivenessParallel(NTU, Cr);
  const Qmax = Cmin * (hotInletTemp - coldInletTemp);
  const actualEffectiveness = Qmax > 0 ? heatTransferRate / Qmax : 0;

  return {
    hotFlowRate,
    coldFlowRate,
    hotCp,
    coldCp,
    hotInletTemp,
    coldInletTemp,
    hotOutletTemp,
    coldOutletTemp,
    heatTransferRate,
    LMTD,
    deltaT1,
    deltaT2,
    area: config.area,
    requiredArea,
    U: config.U,
    NTU,
    effectiveness: clamp(effectiveness),
    capacityHot,
    capacityCold,
    Cmin,
    Cmax,
    Cr,
    Qmax,
    actualEffectiveness: clamp(actualEffectiveness),
    flowType: config.flowType,
  };
}

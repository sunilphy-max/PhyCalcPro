"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import type { Dispatch, SetStateAction } from "react";
import type { HeatExchangerFlowType } from "@/lib/pressure/heat-exchangers/types";

type Props = {
  hotFlowRate: number;
  setHotFlowRate: Dispatch<SetStateAction<number>>;
  coldFlowRate: number;
  setColdFlowRate: Dispatch<SetStateAction<number>>;
  hotCp: number;
  setHotCp: Dispatch<SetStateAction<number>>;
  coldCp: number;
  setColdCp: Dispatch<SetStateAction<number>>;
  hotInletTemp: number;
  setHotInletTemp: Dispatch<SetStateAction<number>>;
  coldInletTemp: number;
  setColdInletTemp: Dispatch<SetStateAction<number>>;
  hotOutletTemp: number;
  setHotOutletTemp: Dispatch<SetStateAction<number>>;
  U: number;
  setU: Dispatch<SetStateAction<number>>;
  area: number;
  setArea: Dispatch<SetStateAction<number>>;
  flowType: HeatExchangerFlowType;
  setFlowType: Dispatch<SetStateAction<HeatExchangerFlowType>>;
  onCalculate: () => void;
};

export default function HeatExchangerInputs({
  hotFlowRate,
  setHotFlowRate,
  coldFlowRate,
  setColdFlowRate,
  hotCp,
  setHotCp,
  coldCp,
  setColdCp,
  hotInletTemp,
  setHotInletTemp,
  coldInletTemp,
  setColdInletTemp,
  hotOutletTemp,
  setHotOutletTemp,
  U,
  setU,
  area,
  setArea,
  flowType,
  setFlowType,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Heat exchanger"
      description="Estimate heat transfer and pressure drops."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate heat exchanger" designAware />}
    >
<div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Hot flow rate</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={hotFlowRate}
              min={0}
              step={0.1}
              onChange={(e) => setHotFlowRate(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">kg/s</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Cold flow rate</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={coldFlowRate}
              min={0}
              step={0.1}
              onChange={(e) => setColdFlowRate(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">kg/s</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Hot stream Cp</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={hotCp}
              min={0}
              step={10}
              onChange={(e) => setHotCp(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">J/kg·K</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Cold stream Cp</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={coldCp}
              min={0}
              step={10}
              onChange={(e) => setColdCp(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">J/kg·K</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Hot inlet temp</span>
          <input
            type="number"
            value={hotInletTemp}
            step={1}
            onChange={(e) => setHotInletTemp(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Cold inlet temp</span>
          <input
            type="number"
            value={coldInletTemp}
            step={1}
            onChange={(e) => setColdInletTemp(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Hot outlet temp</span>
          <input
            type="number"
            value={hotOutletTemp}
            step={1}
            onChange={(e) => setHotOutletTemp(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Overall U-value</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={U}
              min={1}
              step={10}
              onChange={(e) => setU(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">W/m²·K</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Heat transfer area</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={area}
              min={0}
              step={0.1}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">m²</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700 col-span-full">
          <span>Flow arrangement</span>
          <select
            value={flowType}
            onChange={(e) => setFlowType(e.target.value as HeatExchangerFlowType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="counterflow">Counterflow</option>
            <option value="parallel">Parallel flow</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}


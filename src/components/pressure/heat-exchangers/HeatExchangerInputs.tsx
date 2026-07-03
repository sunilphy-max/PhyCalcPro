"use client";

import { calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
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
        <CalculatorUnitField
          label="Hot flow rate"
          value={hotFlowRate}
          onChange={setHotFlowRate}
          min={0}
          step={0.1}
          unit={<span className="text-sm text-slate-500">kg/s</span>}
        />
        <CalculatorUnitField
          label="Cold flow rate"
          value={coldFlowRate}
          onChange={setColdFlowRate}
          min={0}
          step={0.1}
          unit={<span className="text-sm text-slate-500">kg/s</span>}
        />
        <CalculatorUnitField
          label="Hot stream Cp"
          value={hotCp}
          onChange={setHotCp}
          min={0}
          step={10}
          unit={<span className="text-sm text-slate-500">J/kg·K</span>}
        />
        <CalculatorUnitField
          label="Cold stream Cp"
          value={coldCp}
          onChange={setColdCp}
          min={0}
          step={10}
          unit={<span className="text-sm text-slate-500">J/kg·K</span>}
        />
        <CalculatorNumberField label="Hot inlet temp" value={hotInletTemp} onChange={setHotInletTemp} step={1} />
        <CalculatorNumberField label="Cold inlet temp" value={coldInletTemp} onChange={setColdInletTemp} step={1} />
        <CalculatorNumberField label="Hot outlet temp" value={hotOutletTemp} onChange={setHotOutletTemp} step={1} />
        <CalculatorUnitField
          label="Overall U-value"
          value={U}
          onChange={setU}
          min={1}
          step={10}
          unit={<span className="text-sm text-slate-500">W/m²·K</span>}
        />
        <CalculatorUnitField
          label="Heat transfer area"
          value={area}
          onChange={setArea}
          min={0}
          step={0.1}
          unit={<span className="text-sm text-slate-500">m²</span>}
        />
        <div className="col-span-full min-w-0 space-y-2">
          <label className="block text-sm font-medium text-slate-700">Flow arrangement</label>
          <select
            value={flowType}
            onChange={(e) => setFlowType(e.target.value as HeatExchangerFlowType)}
            className={calculatorSelectClass}
          >
            <option value="counterflow">Counterflow</option>
            <option value="parallel">Parallel flow</option>
          </select>
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

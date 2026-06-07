"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  targetRatio: number;
  setTargetRatio: Dispatch<SetStateAction<number>>;
  maxTeeth: number;
  setMaxTeeth: Dispatch<SetStateAction<number>>;
  minPinionTeeth: number;
  setMinPinionTeeth: Dispatch<SetStateAction<number>>;
  onCalculate: () => void;
};

export default function GearRatioDesignInputs({
  targetRatio,
  setTargetRatio,
  maxTeeth,
  setMaxTeeth,
  minPinionTeeth,
  setMinPinionTeeth,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Gear ratio design"
      description="Search integer tooth pairs for the closest match to a target speed ratio."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Find tooth counts" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Target ratio</span>
          <input
            type="number"
            step="0.01"
            value={targetRatio}
            onChange={(e) => setTargetRatio(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Maximum teeth (pinion or gear)</span>
          <input
            type="number"
            min={1}
            value={maxTeeth}
            onChange={(e) => setMaxTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
          <span>Minimum pinion teeth</span>
          <input
            type="number"
            min={1}
            value={minPinionTeeth}
            onChange={(e) => setMinPinionTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

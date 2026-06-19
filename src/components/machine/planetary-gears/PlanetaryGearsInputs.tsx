"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  sunTeeth: number;
  setSunTeeth: Dispatch<SetStateAction<number>>;
  planetTeeth: number;
  setPlanetTeeth: Dispatch<SetStateAction<number>>;
  targetRatio: number;
  setTargetRatio: Dispatch<SetStateAction<number>>;
  module: number;
  setModule: Dispatch<SetStateAction<number>>;
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function PlanetaryGearsInputs({
  sunTeeth,
  setSunTeeth,
  planetTeeth,
  setPlanetTeeth,
  targetRatio,
  setTargetRatio,
  module,
  setModule,
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speed,
  setSpeed,
  lengthUnit,
  setLengthUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Planetary gear set"
      description="Size sun, planet and ring teeth for a target ratio; review pitch diameters and planet count."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate planetary set" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Sun teeth</span>
          <input
            type="number"
            min={10}
            value={sunTeeth}
            onChange={(e) => setSunTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Planet teeth</span>
          <input
            type="number"
            min={10}
            value={planetTeeth}
            onChange={(e) => setPlanetTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Target ratio</span>
          <input
            type="number"
            step="0.1"
            value={targetRatio}
            onChange={(e) => setTargetRatio(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Module"
          value={module}
          onChange={setModule}
          unit={
            <ModuleUnitSelect moduleId="planetary-gears" fieldKey="module" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="planetary-gears" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Input speed (rpm)</span>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

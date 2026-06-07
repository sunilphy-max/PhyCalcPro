"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  pinionTeeth: number;
  setPinionTeeth: Dispatch<SetStateAction<number>>;
  gearRatio: number;
  setGearRatio: Dispatch<SetStateAction<number>>;
  module: number;
  setModule: Dispatch<SetStateAction<number>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  yieldStress: number;
  setYieldStress: Dispatch<SetStateAction<number>>;
  pressureAngleDeg: number;
  setPressureAngleDeg: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function BevelGearsInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speed,
  setSpeed,
  pinionTeeth,
  setPinionTeeth,
  gearRatio,
  setGearRatio,
  module,
  setModule,
  faceWidth,
  setFaceWidth,
  yieldStress,
  setYieldStress,
  pressureAngleDeg,
  setPressureAngleDeg,
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Bevel gear screening"
      description="Size pinion geometry and screen bending and contact stress for indicative strength."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate bevel gear" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="bevel-gears" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pinion speed (rpm)</span>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pinion teeth</span>
          <input
            type="number"
            min={12}
            value={pinionTeeth}
            onChange={(e) => setPinionTeeth(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Gear ratio</span>
          <input
            type="number"
            step="0.1"
            value={gearRatio}
            onChange={(e) => setGearRatio(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Module"
          value={module}
          onChange={setModule}
          unit={
            <ModuleUnitSelect moduleId="bevel-gears" fieldKey="module" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Face width"
          value={faceWidth}
          onChange={setFaceWidth}
          unit={
            <ModuleUnitSelect moduleId="bevel-gears" fieldKey="faceWidth" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Yield stress"
          value={yieldStress}
          onChange={setYieldStress}
          unit={
            <ModuleUnitSelect moduleId="bevel-gears" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pressure angle (°)</span>
          <input
            type="number"
            step="0.5"
            value={pressureAngleDeg}
            onChange={(e) => setPressureAngleDeg(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

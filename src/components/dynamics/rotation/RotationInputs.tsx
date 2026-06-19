"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorInputGridTightClass, calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  mass: number;
  setMass: (value: number) => void;
  radius: number;
  setRadius: (value: number) => void;
  speedRPM: number;
  setSpeedRPM: (value: number) => void;
  power: number;
  setPower: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (unit: string) => void;
  powerUnit: string;
  setPowerUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function RotationInputs({
  mass,
  setMass,
  radius,
  setRadius,
  speedRPM,
  setSpeedRPM,
  power,
  setPower,
  lengthUnit,
  setLengthUnit,
  powerUnit,
  setPowerUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Rotational system"
      description="Calculate kinetic energy and dynamic forces for a rotating mass and its power requirement."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate rotation" designAware />}
    >
      <div className="grid gap-4">
        <div className={`${calculatorInputGridTightClass}`}>
          <label className="space-y-1 text-sm text-slate-600">
            Mass (kg)
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className={calculatorNumberInputClass}
            />
          </label>
          <div className="space-y-1 text-sm text-slate-600">
            Mass unit
            <input
              type="text"
              value="kg"
              disabled
              className="w-full cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-2"
            />
          </div>
        </div>

        <div className={`${calculatorInputGridTightClass}`}>
          <label className="space-y-1 text-sm text-slate-600">
            Radius
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={calculatorNumberInputClass}
            />
          </label>
          <UnitSelector
            dimension="length"
            value={lengthUnit}
            onChange={setLengthUnit}
            label="Radius unit"
          />
        </div>

        <div className={`${calculatorInputGridTightClass}`}>
          <label className="space-y-1 text-sm text-slate-600">
            Speed (RPM)
            <input
              type="number"
              value={speedRPM}
              onChange={(e) => setSpeedRPM(Number(e.target.value))}
              className={calculatorNumberInputClass}
            />
          </label>
          <div className="space-y-1 text-sm text-slate-600">
            Power
            <div className={`${calculatorInputGridTightClass}`}>
              <input
                type="number"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className={calculatorNumberInputClass}
              />
              <UnitSelector dimension="power" value={powerUnit} onChange={setPowerUnit} />
            </div>
          </div>
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

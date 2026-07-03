"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorNumberField label="Mass (kg)" value={mass} onChange={setMass} />
        <CalculatorUnitField
          label="Radius"
          value={radius}
          onChange={setRadius}
          unit={
            <ModuleUnitSelect moduleId="flywheels" fieldKey="radius" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorNumberField label="Speed (rpm)" value={speedRPM} onChange={setSpeedRPM} />
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={<ModuleUnitSelect moduleId="rotation" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />}
        />
      </div>
    </CalculatorInputPanel>
  );
}

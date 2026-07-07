"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";
import type { MotorServiceClass } from "@/lib/dynamics/motor/types";

type Props = {
  power: number;
  setPower: (value: number) => void;
  powerUnit: string;
  setPowerUnit: (unit: string) => void;
  poles: number;
  setPoles: (value: number) => void;
  lineFrequencyHz: 50 | 60;
  setLineFrequencyHz: (value: 50 | 60) => void;
  serviceClass: MotorServiceClass;
  setServiceClass: (value: MotorServiceClass) => void;
  startingTorqueFactor: number;
  setStartingTorqueFactor: (value: number) => void;
  efficiency: number;
  setEfficiency: (value: number) => void;
  powerFactor: number;
  setPowerFactor: (value: number) => void;
  onCalculate: () => void;
};

export default function MotorInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  poles,
  setPoles,
  lineFrequencyHz,
  setLineFrequencyHz,
  serviceClass,
  setServiceClass,
  startingTorqueFactor,
  setStartingTorqueFactor,
  efficiency,
  setEfficiency,
  powerFactor,
  setPowerFactor,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Motor sizing"
      description="Screen indicative motor frame class, rated torque, and slip speed for belt-drive power trains."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Size motor" designAware />}
    >
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label="Required shaft power"
          value={power}
          onChange={setPower}
          unit={<ModuleUnitSelect moduleId="motor" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />}
        />
        <CalculatorNumberField label="Pole count" value={poles} onChange={setPoles} min={2} max={12} step={2} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Line frequency</span>
          <select
            value={lineFrequencyHz}
            onChange={(e) => setLineFrequencyHz(Number(e.target.value) as 50 | 60)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value={60}>60 Hz (US)</option>
            <option value={50}>50 Hz (EU)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Service class</span>
          <select
            value={serviceClass}
            onChange={(e) => setServiceClass(e.target.value as MotorServiceClass)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="continuous">Continuous (S1)</option>
            <option value="intermittent">Intermittent (S3)</option>
            <option value="short_time">Short-time (S2)</option>
          </select>
        </label>
        <CalculatorNumberField
          label="Starting torque factor"
          value={startingTorqueFactor}
          onChange={setStartingTorqueFactor}
          min={1}
          max={4}
          step={0.1}
        />
        <CalculatorNumberField
          label="Efficiency"
          value={efficiency}
          onChange={setEfficiency}
          min={0.5}
          max={0.99}
          step={0.01}
        />
        <CalculatorNumberField
          label="Power factor"
          value={powerFactor}
          onChange={setPowerFactor}
          min={0.5}
          max={1}
          step={0.01}
        />
      </div>
    </CalculatorInputPanel>
  );
}

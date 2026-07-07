"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";
import type { HousingMountStyle } from "@/lib/machine/housing/types";

type Props = {
  boreDiameter: number;
  setBoreDiameter: (value: number) => void;
  radialLoad: number;
  setRadialLoad: (value: number) => void;
  axialLoad: number;
  setAxialLoad: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  mountStyle: HousingMountStyle;
  setMountStyle: (value: HousingMountStyle) => void;
  boltCount: number;
  setBoltCount: (value: number) => void;
  boltCircleDiameter: number;
  setBoltCircleDiameter: (value: number) => void;
  yieldStress: number;
  setYieldStress: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (unit: string) => void;
  forceUnit: string;
  setForceUnit: (unit: string) => void;
  stressUnit: string;
  setStressUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function HousingInputs({
  boreDiameter,
  setBoreDiameter,
  radialLoad,
  setRadialLoad,
  axialLoad,
  setAxialLoad,
  speed,
  setSpeed,
  mountStyle,
  setMountStyle,
  boltCount,
  setBoltCount,
  boltCircleDiameter,
  setBoltCircleDiameter,
  yieldStress,
  setYieldStress,
  lengthUnit,
  setLengthUnit,
  forceUnit,
  setForceUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Bearing housing"
      description="Screen housing body stress and mounting bolt loads from bearing reactions."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Check housing" designAware />}
    >
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label="Bearing bore"
          value={boreDiameter}
          onChange={setBoreDiameter}
          unit={<ModuleUnitSelect moduleId="housing" fieldKey="boreDiameter" value={lengthUnit} onChange={setLengthUnit} />}
        />
        <CalculatorUnitField
          label="Radial load"
          value={radialLoad}
          onChange={setRadialLoad}
          unit={<ModuleUnitSelect moduleId="housing" fieldKey="radialLoad" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Axial load"
          value={axialLoad}
          onChange={setAxialLoad}
          unit={<ModuleUnitSelect moduleId="housing" fieldKey="axialLoad" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorNumberField label="Speed (rpm)" value={speed} onChange={setSpeed} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Mount style</span>
          <select
            value={mountStyle}
            onChange={(e) => setMountStyle(e.target.value as HousingMountStyle)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="pillow_block">Pillow block</option>
            <option value="flange">Flange</option>
            <option value="foot">Foot mount</option>
          </select>
        </label>
        <CalculatorNumberField label="Bolt count" value={boltCount} onChange={setBoltCount} min={2} max={12} />
        <CalculatorUnitField
          label="Bolt circle diameter"
          value={boltCircleDiameter}
          onChange={setBoltCircleDiameter}
          unit={<ModuleUnitSelect moduleId="housing" fieldKey="boltCircleDiameter" value={lengthUnit} onChange={setLengthUnit} />}
        />
        <CalculatorUnitField
          label="Housing yield stress"
          value={yieldStress}
          onChange={setYieldStress}
          unit={<ModuleUnitSelect moduleId="housing" fieldKey="yieldStress" value={stressUnit} onChange={setStressUnit} />}
        />
      </div>
    </CalculatorInputPanel>
  );
}

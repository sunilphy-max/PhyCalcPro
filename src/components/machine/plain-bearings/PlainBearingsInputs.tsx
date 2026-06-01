"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  load: number;
  setLoad: Dispatch<SetStateAction<number>>;
  loadUnit: string;
  setLoadUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  diameter: number;
  setDiameter: Dispatch<SetStateAction<number>>;
  length: number;
  setLength: Dispatch<SetStateAction<number>>;
  clearance: number;
  setClearance: Dispatch<SetStateAction<number>>;
  viscosity: number;
  setViscosity: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function PlainBearingsInputs({
  load,
  setLoad,
  loadUnit,
  setLoadUnit,
  speed,
  setSpeed,
  diameter,
  setDiameter,
  length,
  setLength,
  clearance,
  setClearance,
  viscosity,
  setViscosity,
  lengthUnit,
  setLengthUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Plain journal bearing"
      description="Screen Sommerfeld number, eccentricity and minimum film thickness for hydrodynamic lubrication."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate bearing" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Radial load"
          value={load}
          onChange={setLoad}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="load" value={loadUnit} onChange={setLoadUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Journal speed (rpm)</span>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Journal diameter"
          value={diameter}
          onChange={setDiameter}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Bearing length"
          value={length}
          onChange={setLength}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Radial clearance"
          value={clearance}
          onChange={setClearance}
          unit={
            <ModuleUnitSelect moduleId="plain-bearings" fieldKey="clearance" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Dynamic viscosity (Pa·s)</span>
          <input
            type="number"
            step="0.001"
            value={viscosity}
            onChange={(e) => setViscosity(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

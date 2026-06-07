"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  torque: number;
  setTorque: Dispatch<SetStateAction<number>>;
  torqueUnit: string;
  setTorqueUnit: Dispatch<SetStateAction<string>>;
  shaftDiameter: number;
  setShaftDiameter: Dispatch<SetStateAction<number>>;
  keyWidth: number;
  setKeyWidth: Dispatch<SetStateAction<number>>;
  keyHeight: number;
  setKeyHeight: Dispatch<SetStateAction<number>>;
  keyLength: number;
  setKeyLength: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  yieldStress: number;
  setYieldStress: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  keyType: "parallel" | "spline";
  setKeyType: Dispatch<SetStateAction<"parallel" | "spline">>;
  splineTeeth: number;
  setSplineTeeth: Dispatch<SetStateAction<number>>;
  onCalculate: () => void;
};

export default function KeysSplinesInputs({
  torque,
  setTorque,
  torqueUnit,
  setTorqueUnit,
  shaftDiameter,
  setShaftDiameter,
  keyWidth,
  setKeyWidth,
  keyHeight,
  setKeyHeight,
  keyLength,
  setKeyLength,
  lengthUnit,
  setLengthUnit,
  yieldStress,
  setYieldStress,
  stressUnit,
  setStressUnit,
  keyType,
  setKeyType,
  splineTeeth,
  setSplineTeeth,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Keys & splines"
      description="Check parallel key or spline torque transfer via shear and bearing stress."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate key" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Applied torque"
          value={torque}
          onChange={setTorque}
          unit={
            <ModuleUnitSelect moduleId="keys-splines" fieldKey="torque" value={torqueUnit} onChange={setTorqueUnit} />
          }
        />
        <CalculatorUnitField
          label="Shaft diameter"
          value={shaftDiameter}
          onChange={setShaftDiameter}
          unit={
            <ModuleUnitSelect
              moduleId="keys-splines"
              fieldKey="shaftDiameter"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Key width"
          value={keyWidth}
          onChange={setKeyWidth}
          unit={
            <ModuleUnitSelect moduleId="keys-splines" fieldKey="keyWidth" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Key height"
          value={keyHeight}
          onChange={setKeyHeight}
          unit={
            <ModuleUnitSelect
              moduleId="keys-splines"
              fieldKey="keyHeight"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Key length"
          value={keyLength}
          onChange={setKeyLength}
          unit={
            <ModuleUnitSelect moduleId="keys-splines" fieldKey="keyLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Key yield stress"
          value={yieldStress}
          onChange={setYieldStress}
          unit={
            <ModuleUnitSelect moduleId="keys-splines" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Key type</span>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as "parallel" | "spline")}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="parallel">Parallel key</option>
            <option value="spline">Spline</option>
          </select>
        </label>
        {keyType === "spline" ? (
          <label className="space-y-2 text-sm text-slate-700">
            <span>Spline teeth</span>
            <input
              type="number"
              min={1}
              value={splineTeeth}
              onChange={(e) => setSplineTeeth(Number(e.target.value))}
              className={calculatorNumberInputClass}
            />
          </label>
        ) : null}
      </div>
    </CalculatorInputPanel>
  );
}

"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorFieldLabelClass, calculatorInputGridClass } from "@/components/calculator/styles";

type Props = {
  fiberVolumeFraction: number;
  setFiberVolumeFraction: Dispatch<SetStateAction<number>>;
  fiberModulus: number;
  setFiberModulus: Dispatch<SetStateAction<number>>;
  matrixModulus: number;
  setMatrixModulus: Dispatch<SetStateAction<number>>;
  fiberStrength: number;
  setFiberStrength: Dispatch<SetStateAction<number>>;
  matrixStrength: number;
  setMatrixStrength: Dispatch<SetStateAction<number>>;
  fiberDensity: number;
  setFiberDensity: Dispatch<SetStateAction<number>>;
  matrixDensity: number;
  setMatrixDensity: Dispatch<SetStateAction<number>>;
  fiberPoisson: number;
  setFiberPoisson: Dispatch<SetStateAction<number>>;
  matrixPoisson: number;
  setMatrixPoisson: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  densityUnit: string;
  setDensityUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function CompositeInputs({
  fiberVolumeFraction,
  setFiberVolumeFraction,
  fiberModulus,
  setFiberModulus,
  matrixModulus,
  setMatrixModulus,
  fiberStrength,
  setFiberStrength,
  matrixStrength,
  setMatrixStrength,
  fiberDensity,
  setFiberDensity,
  matrixDensity,
  setMatrixDensity,
  fiberPoisson,
  setFiberPoisson,
  matrixPoisson,
  setMatrixPoisson,
  stressUnit,
  setStressUnit,
  densityUnit,
  setDensityUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Composite laminate"
      description="Design laminate layups and composite section behavior."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Compute composite" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <label className="col-span-full space-y-2">
          <span className={calculatorFieldLabelClass}>Fiber volume fraction</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={fiberVolumeFraction}
              onChange={(event) => setFiberVolumeFraction(Number(event.target.value))}
              className="w-full"
            />
            <span className="w-20 text-right text-sm text-slate-700">{(fiberVolumeFraction * 100).toFixed(0)}%</span>
          </div>
        </label>
        <CalculatorUnitField
          label="Fiber modulus"
          value={fiberModulus}
          onChange={setFiberModulus}
          unit={<ModuleUnitSelect moduleId="composites" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />}
        />
        <CalculatorUnitField
          label="Matrix modulus"
          value={matrixModulus}
          onChange={setMatrixModulus}
          unit={<ModuleUnitSelect moduleId="composites" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />}
        />
        <CalculatorUnitField
          label="Fiber strength"
          value={fiberStrength}
          onChange={setFiberStrength}
          unit={<ModuleUnitSelect moduleId="composites" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />}
        />
        <CalculatorUnitField
          label="Matrix strength"
          value={matrixStrength}
          onChange={setMatrixStrength}
          unit={<ModuleUnitSelect moduleId="composites" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />}
        />
        <CalculatorUnitField
          label="Fiber density"
          value={fiberDensity}
          onChange={setFiberDensity}
          unit={
            <ModuleUnitSelect moduleId="composites" fieldKey="density" value={densityUnit} onChange={setDensityUnit} />
          }
        />
        <CalculatorUnitField
          label="Matrix density"
          value={matrixDensity}
          onChange={setMatrixDensity}
          unit={
            <ModuleUnitSelect moduleId="composites" fieldKey="density" value={densityUnit} onChange={setDensityUnit} />
          }
        />
        <CalculatorNumberField
          label="Fiber Poisson's ratio"
          value={fiberPoisson}
          onChange={setFiberPoisson}
          step={0.01}
          min={0}
          max={0.5}
        />
        <CalculatorNumberField
          label="Matrix Poisson's ratio"
          value={matrixPoisson}
          onChange={setMatrixPoisson}
          step={0.01}
          min={0}
          max={0.5}
        />
      </div>
    </CalculatorInputPanel>
  );
}

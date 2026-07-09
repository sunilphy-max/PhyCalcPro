"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import { MaterialFormSection } from "@/components/materials/MaterialFormSection";
import type { CircularPlateConfig } from "@/lib/structural/circular-plates/types";

type Boundary = CircularPlateConfig["boundary"];

type Props = {
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  thickness: number;
  setThickness: Dispatch<SetStateAction<number>>;
  pressure: number;
  setPressure: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  poisson: number;
  setPoisson: Dispatch<SetStateAction<number>>;
  boundary: Boundary;
  setBoundary: Dispatch<SetStateAction<Boundary>>;
  meshSegments: number;
  setMeshSegments: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  pressureUnit: string;
  setPressureUnit: Dispatch<SetStateAction<string>>;
  modulusUnit: string;
  setModulusUnit: Dispatch<SetStateAction<string>>;
  material: string;
  onMaterialChange: (name: string) => void;
  onCalculate: () => void;
};

export default function CircularPlatesInputs({
  radius,
  setRadius,
  thickness,
  setThickness,
  pressure,
  setPressure,
  modulus,
  setModulus,
  poisson,
  setPoisson,
  boundary,
  setBoundary,
  meshSegments,
  setMeshSegments,
  lengthUnit,
  setLengthUnit,
  pressureUnit,
  setPressureUnit,
  modulusUnit,
  setModulusUnit,
  material,
  onMaterialChange,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Circular plate"
      description="Uniform pressure on a solid disk — axisymmetric FDM with Roark closed-form validation."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate plate" designAware />}
    >
      <MaterialFormSection
        profile="plate-shell"
        moduleId="circular-plates"
        material={material}
        onMaterialChange={onMaterialChange}
        elasticModulus={modulus}
        setElasticModulus={setModulus}
        poisson={poisson}
        setPoisson={setPoisson}
        stressUnit={modulusUnit}
        setStressUnit={setModulusUnit}
      />
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Plate radius"
          value={radius}
          onChange={setRadius}
          unit={
            <ModuleUnitSelect moduleId="circular-plates" fieldKey="radius" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          unit={
            <ModuleUnitSelect moduleId="circular-plates" fieldKey="thickness" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Uniform pressure"
          value={pressure}
          onChange={setPressure}
          unit={
            <ModuleUnitSelect moduleId="circular-plates" fieldKey="pressure" value={pressureUnit} onChange={setPressureUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Radial mesh segments</span>
          <input
            type="number"
            min={4}
            max={64}
            value={meshSegments}
            onChange={(e) => setMeshSegments(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Edge support</span>
          <select
            value={boundary}
            onChange={(e) => setBoundary(e.target.value as Boundary)}
            className={`${calculatorNumberInputClass} w-full`}
          >
            <option value="simply_supported">Simply supported edge</option>
            <option value="clamped">Clamped edge</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

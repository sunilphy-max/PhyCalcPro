"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass, calculatorTextInputClass } from "@/components/calculator/styles";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  rpm: number;
  setRpm: Dispatch<SetStateAction<number>>;
  pinionTeeth: number;
  setPinionTeeth: Dispatch<SetStateAction<number>>;
  gearRatio: number;
  setGearRatio: Dispatch<SetStateAction<number>>;
  module: number;
  setModule: Dispatch<SetStateAction<number>>;
  moduleUnit: string;
  setModuleUnit: Dispatch<SetStateAction<string>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  faceWidthUnit: string;
  setFaceWidthUnit: Dispatch<SetStateAction<string>>;
  material: string;
  setMaterial: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
  onSave?: () => void;
  saving?: boolean;
};

export default function GearInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  rpm,
  setRpm,
  pinionTeeth,
  setPinionTeeth,
  gearRatio,
  setGearRatio,
  module,
  setModule,
  moduleUnit,
  setModuleUnit,
  faceWidth,
  setFaceWidth,
  faceWidthUnit,
  setFaceWidthUnit,
  material,
  setMaterial,
  onCalculate,
  projectName,
  setProjectName,
  onSave,
  saving = false,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Gear design"
      description="Enter operating power, geometry, and material properties for spur gear design."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={onCalculate} label="Calculate gear design" designAware />
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
          ) : null}
        </div>
      }
    >
      {setProjectName ? (
        <input
          className={calculatorTextInputClass}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={<ModuleUnitSelect moduleId="gears" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />}
        />
        <CalculatorNumberField label="Speed (rpm)" value={rpm} onChange={setRpm} />
        <CalculatorNumberField label="Pinion teeth" value={pinionTeeth} onChange={setPinionTeeth} min={1} />
        <CalculatorNumberField label="Gear ratio" value={gearRatio} onChange={setGearRatio} step={0.1} />
        <CalculatorUnitField
          label="Module"
          value={module}
          onChange={setModule}
          unit={<ModuleUnitSelect moduleId="gears" fieldKey="module" value={moduleUnit} onChange={setModuleUnit} />}
        />
        <CalculatorUnitField
          label="Face width"
          value={faceWidth}
          onChange={setFaceWidth}
          unit={
            <ModuleUnitSelect moduleId="gears" fieldKey="faceWidth" value={faceWidthUnit} onChange={setFaceWidthUnit} />
          }
        />
      </div>

      <label className="space-y-2">
        <span className={calculatorFieldLabelClass}>Material</span>
        <select value={material} onChange={(event) => setMaterial(event.target.value)} className={calculatorSelectClass}>
          <option value="Steel">Steel</option>
          <option value="Aluminum">Aluminum</option>
          <option value="Bronze">Bronze</option>
        </select>
      </label>
    </CalculatorInputPanel>
  );
}

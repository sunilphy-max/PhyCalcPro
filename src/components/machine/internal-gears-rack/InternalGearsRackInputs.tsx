"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MaterialSelect from "@/components/materials/MaterialSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import type { InternalGearsRackConfig } from "@/lib/machine/internal-gears-rack/types";

type Props = {
  gearType: InternalGearsRackConfig["gearType"];
  setGearType: Dispatch<SetStateAction<InternalGearsRackConfig["gearType"]>>;
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  module: number;
  setModule: Dispatch<SetStateAction<number>>;
  moduleUnit: string;
  setModuleUnit: Dispatch<SetStateAction<string>>;
  pinionTeeth: number;
  setPinionTeeth: Dispatch<SetStateAction<number>>;
  gearTeeth: number;
  setGearTeeth: Dispatch<SetStateAction<number>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  faceWidthUnit: string;
  setFaceWidthUnit: Dispatch<SetStateAction<string>>;
  material: string;
  setMaterial: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function InternalGearsRackInputs({
  gearType,
  setGearType,
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speed,
  setSpeed,
  module,
  setModule,
  moduleUnit,
  setModuleUnit,
  pinionTeeth,
  setPinionTeeth,
  gearTeeth,
  setGearTeeth,
  faceWidth,
  setFaceWidth,
  faceWidthUnit,
  setFaceWidthUnit,
  material,
  setMaterial,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Internal gear / rack"
      description="Lewis bending and Hertzian contact screening for internal spur or rack drives."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate gearing" designAware />}
    >
      <label className="space-y-2 text-sm text-slate-700 block">
        <span>Gear type</span>
        <select
          value={gearType}
          onChange={(e) => setGearType(e.target.value as InternalGearsRackConfig["gearType"])}
          className={calculatorNumberInputClass}
        >
          <option value="internal">Internal spur gear</option>
          <option value="rack">Rack and pinion</option>
        </select>
      </label>
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="internal-gears-rack" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pinion speed (rpm)</span>
          <input type="number" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        <CalculatorUnitField
          label="Module"
          value={module}
          onChange={setModule}
          unit={
            <ModuleUnitSelect moduleId="internal-gears-rack" fieldKey="module" value={moduleUnit} onChange={setModuleUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Pinion teeth</span>
          <input type="number" value={pinionTeeth} onChange={(e) => setPinionTeeth(Number(e.target.value))} className={calculatorNumberInputClass} />
        </label>
        {gearType === "internal" ? (
          <label className="space-y-2 text-sm text-slate-700">
            <span>Ring gear teeth</span>
            <input type="number" value={gearTeeth} onChange={(e) => setGearTeeth(Number(e.target.value))} className={calculatorNumberInputClass} />
          </label>
        ) : null}
        <CalculatorUnitField
          label="Face width"
          value={faceWidth}
          onChange={setFaceWidth}
          unit={
            <ModuleUnitSelect moduleId="internal-gears-rack" fieldKey="faceWidth" value={faceWidthUnit} onChange={setFaceWidthUnit} />
          }
        />
        <MaterialSelect profile="machine-gear" value={material} onChange={setMaterial} />
      </div>
    </CalculatorInputPanel>
  );
}

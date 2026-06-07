"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";

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
          className="w-full rounded border p-2 text-sm"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Power</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={power}
              onChange={(event) => setPower(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="gears"
              fieldKey="power"
              value={powerUnit}
              onChange={setPowerUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Speed</span>
          <input
            type="number"
            value={rpm}
            onChange={(event) => setRpm(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">Revolutions per minute</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Pinion teeth</span>
          <input
            type="number"
            value={pinionTeeth}
            onChange={(event) => setPinionTeeth(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Gear ratio</span>
          <input
            type="number"
            value={gearRatio}
            step="0.1"
            onChange={(event) => setGearRatio(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Module</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={module}
              onChange={(event) => setModule(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="gears"
              fieldKey="module"
              value={moduleUnit}
              onChange={setModuleUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Face width</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={faceWidth}
              onChange={(event) => setFaceWidth(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="gears"
              fieldKey="faceWidth"
              value={faceWidthUnit}
              onChange={setFaceWidthUnit}
            />
          </div>
        </label>
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <label className="block">Material</label>
        <select
          value={material}
          onChange={(event) => setMaterial(event.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value="Steel">Steel</option>
          <option value="Aluminum">Aluminum</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>

    </CalculatorInputPanel>
  );
}

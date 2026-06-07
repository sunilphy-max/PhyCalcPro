"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import { VBELT_SECTION_CATALOG } from "@/lib/design-workflows/solvers/vbeltDesign";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speedDriver: number;
  setSpeedDriver: Dispatch<SetStateAction<number>>;
  diameterDriver: number;
  setDiameterDriver: Dispatch<SetStateAction<number>>;
  diameterDriven: number;
  setDiameterDriven: Dispatch<SetStateAction<number>>;
  centerDistance: number;
  setCenterDistance: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  serviceFactor: number;
  setServiceFactor: Dispatch<SetStateAction<number>>;
  onCalculate: () => void;
  workflowMode?: DesignWorkflowMode;
  ratio?: number;
  setRatio?: Dispatch<SetStateAction<number>>;
  beltSection?: string;
  setBeltSection?: Dispatch<SetStateAction<string>>;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
};

export default function VBeltsInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speedDriver,
  setSpeedDriver,
  diameterDriver,
  setDiameterDriver,
  diameterDriven,
  setDiameterDriven,
  centerDistance,
  setCenterDistance,
  lengthUnit,
  setLengthUnit,
  serviceFactor,
  setServiceFactor,
  onCalculate,
  workflowMode = "check",
  ratio = 2,
  setRatio,
  beltSection = "B",
  setBeltSection,
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const isDesignMode = workflowMode === "design";
  const showGeometry = !isDesignMode;

  return (
    <CalculatorInputPanel
      title="V-belt drive"
      description={
        isDesignMode
          ? "Enter power, speed and ratio; design mode suggests pulley diameters and belt section."
          : "Size pulleys, estimate belt length, power capacity and pretension."
      }
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label={isDesignMode ? "Size drive" : "Calculate drive"}
          />
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
          ) : null}
        </div>
      }
    >
      {setProjectName ? (
        <input
          className="mb-4 w-full rounded border p-2 text-sm"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Power"
          value={power}
          onChange={setPower}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Driver speed (rpm)</span>
          <input
            type="number"
            value={speedDriver}
            onChange={(e) => setSpeedDriver(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        {isDesignMode ? (
          <label className="space-y-2 text-sm text-slate-700">
            <span>Speed ratio (driven / driver)</span>
            <input
              type="number"
              step="0.05"
              min={1}
              value={ratio}
              onChange={(e) => setRatio?.(Number(e.target.value))}
              className={calculatorNumberInputClass}
            />
          </label>
        ) : null}
        {showGeometry ? (
        <>
        <CalculatorUnitField
          label="Driver pulley diameter"
          value={diameterDriver}
          onChange={setDiameterDriver}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Driven pulley diameter"
          value={diameterDriven}
          onChange={setDiameterDriven}
          unit={
            <ModuleUnitSelect moduleId="v-belts" fieldKey="diameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Center distance"
          value={centerDistance}
          onChange={setCenterDistance}
          unit={
            <ModuleUnitSelect
              moduleId="v-belts"
              fieldKey="centerDistance"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        </>
        ) : null}
        {!isDesignMode ? (
        <label className="space-y-2 text-sm text-slate-700">
          <span>Belt section</span>
          <select
            value={beltSection}
            onChange={(e) => setBeltSection?.(e.target.value)}
            className={calculatorNumberInputClass}
          >
            {VBELT_SECTION_CATALOG.map((item) => (
              <option key={item.section} value={item.section}>
                {item.section}
              </option>
            ))}
          </select>
        </label>
        ) : null}
        <label className="space-y-2 text-sm text-slate-700">
          <span>Service factor</span>
          <input
            type="number"
            step="0.05"
            value={serviceFactor}
            onChange={(e) => setServiceFactor(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

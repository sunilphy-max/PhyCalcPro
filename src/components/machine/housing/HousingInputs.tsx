"use client";

import { Box, Layers, Ruler, Wrench } from "lucide-react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputSteps from "@/components/machine/bearings-shared/CalculatorInputSteps";
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
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
};

const STEPS = [
  {
    id: "application",
    label: "Application",
    description: "Mount style — pillow, flange, or foot (presets never lock this)",
    icon: Layers,
  },
  {
    id: "loads",
    label: "Loads",
    description: "Bearing reactions and speed",
    icon: Box,
  },
  {
    id: "mount",
    label: "Mount",
    description: "Bore diameter and bolt circle",
    icon: Ruler,
  },
  {
    id: "bolts",
    label: "Bolts",
    description: "Bolt count and housing yield",
    icon: Wrench,
  },
];

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
  onSave,
  saving,
  projectName,
  setProjectName,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Bearing housing"
      description="Screen housing body stress and mounting bolt loads. Calculation standard is set above — mount style stays free."
      footer={
        <div className="flex flex-wrap items-center gap-2">
          {onSave && setProjectName ? (
            <>
              <input
                type="text"
                value={projectName ?? ""}
                onChange={(e) => setProjectName(e.target.value)}
                className="min-w-[10rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                placeholder="Project name"
              />
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : null}
          <CalculatorCalculateButton onClick={onCalculate} label="Check housing" designAware />
        </div>
      }
    >
      <CalculatorInputSteps steps={STEPS} ariaLabel="Housing input steps">
        {(activeTab) => (
          <>
            {activeTab === "application" ? (
              <div className="space-y-3">
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Application presets set SF / service factors only — they do not force pillow vs flange geometry.
                </p>
              </div>
            ) : null}

            {activeTab === "loads" ? (
              <div className={calculatorInputGridClass}>
                <CalculatorUnitField
                  label="Radial load"
                  value={radialLoad}
                  onChange={setRadialLoad}
                  unit={
                    <ModuleUnitSelect
                      moduleId="housing"
                      fieldKey="radialLoad"
                      value={forceUnit}
                      onChange={setForceUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="Axial load"
                  value={axialLoad}
                  onChange={setAxialLoad}
                  unit={
                    <ModuleUnitSelect
                      moduleId="housing"
                      fieldKey="axialLoad"
                      value={forceUnit}
                      onChange={setForceUnit}
                    />
                  }
                />
                <CalculatorNumberField label="Speed (rpm)" value={speed} onChange={setSpeed} />
              </div>
            ) : null}

            {activeTab === "mount" ? (
              <div className={calculatorInputGridClass}>
                <CalculatorUnitField
                  label="Bearing bore"
                  value={boreDiameter}
                  onChange={setBoreDiameter}
                  unit={
                    <ModuleUnitSelect
                      moduleId="housing"
                      fieldKey="boreDiameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="Bolt circle diameter"
                  value={boltCircleDiameter}
                  onChange={setBoltCircleDiameter}
                  unit={
                    <ModuleUnitSelect
                      moduleId="housing"
                      fieldKey="boltCircleDiameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
              </div>
            ) : null}

            {activeTab === "bolts" ? (
              <div className={calculatorInputGridClass}>
                <CalculatorNumberField
                  label="Bolt count"
                  value={boltCount}
                  onChange={setBoltCount}
                  min={2}
                  max={12}
                />
                <CalculatorUnitField
                  label="Housing yield stress"
                  value={yieldStress}
                  onChange={setYieldStress}
                  unit={
                    <ModuleUnitSelect
                      moduleId="housing"
                      fieldKey="yieldStress"
                      value={stressUnit}
                      onChange={setStressUnit}
                    />
                  }
                />
              </div>
            ) : null}
          </>
        )}
      </CalculatorInputSteps>
    </CalculatorInputPanel>
  );
}

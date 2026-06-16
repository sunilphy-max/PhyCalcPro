"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import {
  VBELT_SECTION_CATALOG,
  VBELT_SERVICE_FACTOR_PRESETS,
} from "@/lib/powerTransmission/v-belts/catalog";

type Props = {
  power: number;
  setPower: Dispatch<SetStateAction<number>>;
  powerUnit: string;
  setPowerUnit: Dispatch<SetStateAction<string>>;
  speedDriver: number;
  setSpeedDriver: Dispatch<SetStateAction<number>>;
  speedDriven: number;
  setSpeedDriven: Dispatch<SetStateAction<number>>;
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
  servicePreset: string;
  setServicePreset: Dispatch<SetStateAction<string>>;
  beltSection: string;
  setBeltSection: Dispatch<SetStateAction<string>>;
  useManualGeometry: boolean;
  setUseManualGeometry: Dispatch<SetStateAction<boolean>>;
  onCalculate: () => void;
  workflowMode?: DesignWorkflowMode;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: Dispatch<SetStateAction<string>>;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-slate-200 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </h3>
  );
}

export default function VBeltsInputs({
  power,
  setPower,
  powerUnit,
  setPowerUnit,
  speedDriver,
  setSpeedDriver,
  speedDriven,
  setSpeedDriven,
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
  servicePreset,
  setServicePreset,
  beltSection,
  setBeltSection,
  useManualGeometry,
  setUseManualGeometry,
  onCalculate,
  workflowMode = "check",
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const isDesignMode = workflowMode === "design";

  return (
    <CalculatorInputPanel
      title="V-belt drive"
      description="Size classical or narrow V-belt drives from motor power and shaft speeds — pulley diameters, belt count, tensions, and shaft loads."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label={isDesignMode || !useManualGeometry ? "Size drive" : "Verify drive"}
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
          className="mb-4 w-full rounded border p-2 text-sm dark:border-slate-700"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
      ) : null}

      <div className="space-y-6">
        <section className="space-y-3">
          <SectionHeading>1 — Power source</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <CalculatorUnitField
              label="Motor power"
              value={power}
              onChange={setPower}
              unit={
                <ModuleUnitSelect moduleId="v-belts" fieldKey="power" value={powerUnit} onChange={setPowerUnit} />
              }
            />
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Driver speed (rpm)</span>
              <input
                type="number"
                value={speedDriver}
                onChange={(e) => setSpeedDriver(Number(e.target.value))}
                className={calculatorNumberInputClass}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Driven speed (rpm)</span>
              <input
                type="number"
                value={speedDriven}
                onChange={(e) => setSpeedDriven(Number(e.target.value))}
                className={calculatorNumberInputClass}
              />
            </label>
            <div className="flex items-end text-sm text-slate-600 dark:text-slate-400">
              Speed ratio ≈ {(speedDriver / Math.max(speedDriven, 1)).toFixed(2)} : 1
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>2 — Duty conditions</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Service factor preset</span>
              <select
                value={servicePreset}
                onChange={(e) => {
                  setServicePreset(e.target.value);
                  const preset = VBELT_SERVICE_FACTOR_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) setServiceFactor(preset.factor);
                }}
                className={calculatorNumberInputClass}
              >
                {VBELT_SERVICE_FACTOR_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.factor.toFixed(1)})
                  </option>
                ))}
                <option value="custom">Custom value</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Service factor</span>
              <input
                type="number"
                step="0.05"
                min={1}
                value={serviceFactor}
                onChange={(e) => {
                  setServiceFactor(Number(e.target.value));
                  setServicePreset("custom");
                }}
                className={calculatorNumberInputClass}
              />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>3 — Geometry</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <CalculatorUnitField
              label="Preferred center distance"
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
            {!isDesignMode ? (
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={useManualGeometry}
                  onChange={(e) => setUseManualGeometry(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Enter pulley diameters manually (verify mode)
              </label>
            ) : null}
            {(isDesignMode ? false : useManualGeometry) ? (
              <>
                <CalculatorUnitField
                  label="Driver pulley diameter"
                  value={diameterDriver}
                  onChange={setDiameterDriver}
                  unit={
                    <ModuleUnitSelect
                      moduleId="v-belts"
                      fieldKey="diameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
                <CalculatorUnitField
                  label="Driven pulley diameter"
                  value={diameterDriven}
                  onChange={setDiameterDriven}
                  unit={
                    <ModuleUnitSelect
                      moduleId="v-belts"
                      fieldKey="diameter"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
              </>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>4 — Belt family</SectionHeading>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Belt section</span>
            <select
              value={beltSection}
              onChange={(e) => setBeltSection(e.target.value)}
              className={calculatorNumberInputClass}
            >
              <option value="auto">Auto select (A–E, 3V/5V/8V)</option>
              {VBELT_SECTION_CATALOG.map((item) => (
                <option key={item.section} value={item.section}>
                  {item.section} ({item.family})
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>
    </CalculatorInputPanel>
  );
}

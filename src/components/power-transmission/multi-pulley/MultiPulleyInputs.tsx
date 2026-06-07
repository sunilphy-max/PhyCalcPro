"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

export type PulleyRow = { diameter: number; centerDistance: number };

type Props = {
  pulleys: PulleyRow[];
  setPulleys: Dispatch<SetStateAction<PulleyRow[]>>;
  driveType: "open" | "crossed";
  setDriveType: Dispatch<SetStateAction<"open" | "crossed">>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function MultiPulleyInputs({
  pulleys,
  setPulleys,
  driveType,
  setDriveType,
  lengthUnit,
  setLengthUnit,
  onCalculate,
}: Props) {
  const update = (index: number, field: keyof PulleyRow, value: number) => {
    setPulleys((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addPulley = () => {
    if (pulleys.length >= 8) return;
    setPulleys((rows) => [...rows, { diameter: 200, centerDistance: 400 }]);
  };

  const removePulley = (index: number) => {
    if (pulleys.length <= 2) return;
    setPulleys((rows) => rows.filter((_, i) => i !== index));
  };

  return (
    <CalculatorInputPanel
      title="Multi-pulley layout"
      description="Editable pulley list (2–8) with diameters and center distances to the next pulley."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate layout" designAware />}
    >
      <div className="space-y-4">
        {pulleys.map((p, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Pulley {index + 1}</span>
              {pulleys.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removePulley(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <CalculatorUnitField
                label="Diameter"
                value={p.diameter}
                onChange={(v) => update(index, "diameter", v)}
                unit={
                  <ModuleUnitSelect
                    moduleId="multi-pulley"
                    fieldKey="diameter"
                    value={lengthUnit}
                    onChange={setLengthUnit}
                  />
                }
              />
              {index < pulleys.length - 1 ? (
                <CalculatorUnitField
                  label="Center distance to next"
                  value={p.centerDistance}
                  onChange={(v) => update(index, "centerDistance", v)}
                  unit={
                    <ModuleUnitSelect
                      moduleId="multi-pulley"
                      fieldKey="centerDistance"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                    />
                  }
                />
              ) : null}
            </div>
          </div>
        ))}
        {pulleys.length < 8 ? (
          <button
            type="button"
            onClick={addPulley}
            className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            + Add pulley
          </button>
        ) : null}
        <label className="space-y-2 text-sm text-slate-700">
          <span>Drive type</span>
          <select
            value={driveType}
            onChange={(e) => setDriveType(e.target.value as "open" | "crossed")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="open">Open (same side)</option>
            <option value="crossed">Crossed</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";

export const UNIT_CONVERTER_DIMENSIONS = ["length", "force", "stress"] as const;
export type UnitConverterDimensionKey = (typeof UNIT_CONVERTER_DIMENSIONS)[number];

type Props = {
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  dimensionKey: UnitConverterDimensionKey;
  setDimensionKey: (key: UnitConverterDimensionKey) => void;
  fromUnit: string;
  setFromUnit: Dispatch<SetStateAction<string>>;
  toUnit: string;
  setToUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

const DIMENSION_LABELS: Record<UnitConverterDimensionKey, string> = {
  length: "Length",
  force: "Force",
  stress: "Stress",
};

export default function UnitConverterInputs({
  value,
  setValue,
  dimensionKey,
  setDimensionKey,
  fromUnit,
  setFromUnit,
  toUnit,
  setToUnit,
  onCalculate,
}: Props) {
  const profile = getModuleFieldProfile("unit-converter", dimensionKey);

  return (
    <CalculatorInputPanel
      title="Unit converter"
      description="Convert a numeric value between units on the same physical dimension."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Convert" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
          <span>Physical dimension</span>
          <select
            value={dimensionKey}
            onChange={(e) => setDimensionKey(e.target.value as UnitConverterDimensionKey)}
            className={`${calculatorNumberInputClass} w-full`}
          >
            {UNIT_CONVERTER_DIMENSIONS.map((key) => (
              <option key={key} value={key}>
                {DIMENSION_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <CalculatorUnitField
          label="Value"
          value={value}
          onChange={setValue}
          unit={
            <ModuleUnitSelect
              moduleId="unit-converter"
              fieldKey={dimensionKey}
              value={fromUnit}
              onChange={setFromUnit}
            />
          }
        />

        <label className="space-y-2 text-sm text-slate-700">
          <span>Convert to</span>
          <ModuleUnitSelect
            moduleId="unit-converter"
            fieldKey={dimensionKey}
            value={toUnit}
            onChange={setToUnit}
          />
        </label>

        {profile ? (
          <p className="sm:col-span-2 text-xs text-slate-500">
            Base SI dimension: {profile.dimension}. Available units: {profile.units.join(", ")}.
          </p>
        ) : null}
      </div>
    </CalculatorInputPanel>
  );
}

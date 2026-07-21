"use client";

import type { Dispatch, SetStateAction } from "react";
import { ArrowLeftRight } from "lucide-react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import {
  calculatorInputGridClass,
  calculatorNumberInputClass,
  calculatorSecondaryButtonClass,
} from "@/components/calculator/styles";
import {
  DIMENSION_GROUPS,
  DIMENSION_LABELS,
  unitsForConverterDimension,
  type UnitConverterDimensionKey,
} from "@/lib/tools/unit-converter/dimensions";

type Props = {
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  dimensionKey: UnitConverterDimensionKey;
  setDimensionKey: (key: UnitConverterDimensionKey) => void;
  fromUnit: string;
  setFromUnit: Dispatch<SetStateAction<string>>;
  toUnit: string;
  setToUnit: Dispatch<SetStateAction<string>>;
  onSwap: () => void;
  onCalculate: () => void;
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
  onSwap,
  onCalculate,
}: Props) {
  const units = unitsForConverterDimension(dimensionKey);

  return (
    <CalculatorInputPanel
      title="Unit converter"
      description="Pick a physical dimension, enter a value, and convert between any supported engineering units."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Convert" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Physical dimension
          </legend>
          <div className="space-y-3">
            {DIMENSION_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.dimensions.map((key) => {
                    const selected = dimensionKey === key;
                    return (
                      <label
                        key={key}
                        className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                          selected
                            ? "border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-400 dark:bg-cyan-950/50 dark:text-cyan-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="unit-converter-dimension"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setDimensionKey(key)}
                        />
                        {DIMENSION_LABELS[key]}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <span>Value</span>
          <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => setValue(Number(e.target.value))}
            className={`${calculatorNumberInputClass} w-full`}
          />
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <label className="min-w-0 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>From</span>
            <UnitSelector
              dimension={dimensionKey}
              value={fromUnit}
              onChange={setFromUnit}
              allowedUnits={units}
            />
          </label>

          <button
            type="button"
            onClick={onSwap}
            className={`${calculatorSecondaryButtonClass} mb-0.5 px-2.5`}
            title="Swap from and to units"
            aria-label="Swap from and to units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <label className="min-w-0 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <span>To</span>
            <UnitSelector
              dimension={dimensionKey}
              value={toUnit}
              onChange={setToUnit}
              allowedUnits={units}
            />
          </label>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {DIMENSION_LABELS[dimensionKey]} · {units.length} units · converts live as you type
        </p>
      </div>
    </CalculatorInputPanel>
  );
}

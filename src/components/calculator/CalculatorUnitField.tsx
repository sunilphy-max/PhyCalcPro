"use client";

import type { ReactNode } from "react";
import {
  calculatorNumberInputClass,
  calculatorUnitFieldRowClass,
  calculatorUnitSelectorWrapClass,
} from "./styles";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: ReactNode;
  min?: number;
  max?: number;
  step?: number | string;
  className?: string;
  colSpan?: boolean;
};

/** Label + number input + unit control; input keeps full width minus unit selector. */
export default function CalculatorUnitField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = "any",
  className = "",
  colSpan = false,
}: Props) {
  return (
    <div
      className={`space-y-2 ${colSpan ? "sm:col-span-2" : ""} ${className}`.trim()}
    >
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className={calculatorUnitFieldRowClass}>
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = e.target.value === "" ? 0 : Number(e.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className={calculatorNumberInputClass}
        />
        <div className={calculatorUnitSelectorWrapClass}>{unit}</div>
      </div>
    </div>
  );
}

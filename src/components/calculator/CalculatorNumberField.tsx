"use client";

import { calculatorFieldLabelClass, calculatorTextInputClass } from "./styles";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  className?: string;
};

/** Unitless numeric field — same width behavior as CalculatorUnitField in the input sidebar. */
export default function CalculatorNumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = "any",
  className = "",
}: Props) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`.trim()}>
      <label className={calculatorFieldLabelClass}>{label}</label>
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
        className={calculatorTextInputClass}
      />
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { calculatorFieldLabelClass, calculatorSelectClass } from "./styles";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

/** Full-width select aligned with CalculatorUnitField labels. */
export default function CalculatorSelectField({
  label,
  value,
  onChange,
  children,
  className = "",
}: Props) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`.trim()}>
      <label className={calculatorFieldLabelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={calculatorSelectClass}>
        {children}
      </select>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { calculatorFieldLabelClass, calculatorSelectClass } from "./styles";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  hint?: string;
  className?: string;
};

/** Full-width select with clear dropdown affordance. */
export default function CalculatorSelectField({
  label,
  value,
  onChange,
  children,
  hint,
  className = "",
}: Props) {
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`.trim()}>
      <label className={calculatorFieldLabelClass}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${calculatorSelectClass} appearance-none pr-10`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden
        />
      </div>
      {hint ? <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}

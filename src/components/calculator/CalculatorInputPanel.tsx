"use client";

import type { ReactNode } from "react";
import { calculatorPanelClass } from "./styles";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Standard input column: module inputs + calculate/export actions. Design targets render via CalculatorLayout. */
export default function CalculatorInputPanel({ title, description, children, footer }: Props) {
  return (
    <div className={calculatorPanelClass}>
      <div className="calculator-panel-accent absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400" />
      <div className="relative">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
      {footer ? <div className="border-t border-slate-200/70 pt-4 dark:border-slate-700/60">{footer}</div> : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { calculatorPanelClass } from "./styles";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Standard left column: module inputs + calculate action. */
export default function CalculatorInputPanel({ title, description, children, footer }: Props) {
  return (
    <div className={calculatorPanelClass}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>
      {children}
      {footer}
    </div>
  );
}

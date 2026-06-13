import type { ReactNode } from "react";
import { calculatorSectionClass, calculatorSectionTitleClass } from "./styles";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Grouped input block inside CalculatorInputPanel. */
export default function CalculatorFormSection({ title, description, children, className = "" }: Props) {
  return (
    <section className={`${calculatorSectionClass} ${className}`.trim()}>
      <div>
        <h3 className={calculatorSectionTitleClass}>{title}</h3>
        {description ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

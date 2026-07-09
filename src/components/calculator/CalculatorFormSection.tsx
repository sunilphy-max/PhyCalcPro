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
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5 h-4 w-1 shrink-0 rounded-full bg-gradient-to-b from-cyan-500 to-sky-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className={calculatorSectionTitleClass}>{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 pl-3.5">{children}</div>
    </section>
  );
}

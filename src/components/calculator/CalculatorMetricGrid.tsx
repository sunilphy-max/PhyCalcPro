"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
};

/** Container-query columns — viewport breakpoints ignore sidebar + input column width. */
const colClass: Record<2 | 3 | 4, string> = {
  2: "@results/sm:grid-cols-2",
  3: "@results/sm:grid-cols-2 @results/3xl:grid-cols-3",
  4: "@results/sm:grid-cols-2 @results/3xl:grid-cols-3 @results/5xl:grid-cols-4",
};

export default function CalculatorMetricGrid({
  children,
  cols = 4,
  className = "",
}: Props) {
  return (
    <div
      className={`grid min-w-0 grid-cols-1 gap-4 ${colClass[cols]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

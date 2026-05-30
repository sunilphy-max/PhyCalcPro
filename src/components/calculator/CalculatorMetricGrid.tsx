"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
};

const colClass: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function CalculatorMetricGrid({
  children,
  cols = 4,
  className = "",
}: Props) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 ${colClass[cols]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

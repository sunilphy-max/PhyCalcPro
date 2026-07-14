"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, FileText, Stethoscope, Table2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CalculatorResultsViewId = "summary" | "charts" | "diagnose" | "report";

export type CalculatorResultsViewTab = {
  id: CalculatorResultsViewId;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
};

type Props = {
  tabs: CalculatorResultsViewTab[];
  defaultTab?: CalculatorResultsViewId;
  ariaLabel?: string;
};

export default function CalculatorResultsViewTabs({
  tabs,
  defaultTab = "summary",
  ariaLabel = "Results views",
}: Props) {
  const [activeId, setActiveId] = useState(defaultTab);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/90 p-2 dark:border-slate-700/60 dark:bg-slate-900/50"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-cyan-800 shadow-sm ring-1 ring-cyan-200/80 dark:bg-slate-950 dark:text-cyan-100 dark:ring-cyan-700/50"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan-600 dark:text-cyan-400" : ""}`} aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-w-0 space-y-4">
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <div
              key={tab.id}
              className={isActive ? "min-w-0 space-y-4" : "hidden"}
              aria-hidden={!isActive}
              // Keep charts mounted for PDF/Excel capture even when another tab is active.
              data-export-tab={tab.id}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CALCULATOR_VIEW_ICONS = {
  summary: Table2,
  charts: BarChart3,
  diagnose: Stethoscope,
  report: FileText,
} as const;

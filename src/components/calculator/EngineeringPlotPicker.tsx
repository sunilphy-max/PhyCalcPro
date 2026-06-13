"use client";

import { useMemo, useState, type ReactNode } from "react";
import { calculatorSelectClass } from "./styles";

export type PlotPickerTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: PlotPickerTab[];
  defaultTabId?: string;
  /** Accessible label for the chart selector */
  label?: string;
};

/** Show one chart at a time via dropdown — reduces vertical scrolling on result dashboards. */
export default function EngineeringPlotPicker({
  tabs,
  defaultTabId,
  label = "Chart",
}: Props) {
  const visibleTabs = useMemo(() => tabs.filter((tab) => tab.content != null), [tabs]);
  const [activeId, setActiveId] = useState(defaultTabId ?? visibleTabs[0]?.id ?? "");

  const active =
    visibleTabs.find((tab) => tab.id === activeId) ?? visibleTabs[0] ?? null;

  if (visibleTabs.length === 0) return null;
  if (visibleTabs.length === 1) {
    return <div className="min-w-0">{visibleTabs[0]!.content}</div>;
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-slate-700 sm:flex-row sm:items-center sm:gap-2 dark:text-slate-300">
          <span className="shrink-0">{label}</span>
          <select
            value={active?.id ?? activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className={`${calculatorSelectClass} w-full sm:max-w-xs`}
            aria-label={`${label} selection`}
          >
            {visibleTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {visibleTabs.length} views
        </span>
      </div>
      <div className="min-w-0 p-2 sm:p-3">{active?.content}</div>
    </div>
  );
}

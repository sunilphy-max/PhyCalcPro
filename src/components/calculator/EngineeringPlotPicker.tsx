"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { calculatorSelectClass } from "@/components/calculator/styles";

export type PlotPickerTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: PlotPickerTab[];
  defaultTabId?: string;
  label?: string;
  /** `segmented` shows pill tabs; `select` uses a dropdown (compact sidebars). */
  variant?: "segmented" | "select";
};

export default function EngineeringPlotPicker({
  tabs,
  defaultTabId,
  label = "Chart",
  variant = "select",
}: Props) {
  const visibleTabs = tabs.filter((tab) => tab.content != null);
  const [activeId, setActiveId] = useState(defaultTabId ?? visibleTabs[0]?.id ?? "");

  const active =
    visibleTabs.find((tab) => tab.id === activeId) ?? visibleTabs[0] ?? null;

  if (visibleTabs.length === 0) return null;
  if (visibleTabs.length === 1) {
    return <div className="min-w-0">{visibleTabs[0]!.content}</div>;
  }

  if (variant === "segmented") {
    return (
      <div
        className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80"
        data-export-picker=""
      >
        <div className="border-b border-slate-200/70 px-3 py-3 dark:border-slate-700/60 md:px-4">
          {label ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
              {label}
            </p>
          ) : null}
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label={label}
          >
            {visibleTabs.map((tab) => {
              const isActive = tab.id === active?.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(tab.id)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-sm shadow-cyan-500/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 p-2 sm:p-4" aria-live="polite">
          {visibleTabs.map((tab) => (
            <div
              key={tab.id}
              className={tab.id === active?.id ? "block min-w-0" : "hidden min-w-0"}
              data-export-caption={tab.label}
              role="tabpanel"
              aria-hidden={tab.id !== active?.id}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      data-export-picker=""
    >
      <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-slate-700 sm:flex-row sm:items-center sm:gap-2 dark:text-slate-300">
          <span className="shrink-0">{label}</span>
          <div className="relative w-full sm:max-w-xs">
            <select
              value={active?.id ?? activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className={`${calculatorSelectClass} w-full appearance-none pr-10`}
              aria-label={`${label} selection`}
            >
              {visibleTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {visibleTabs.length} views
        </span>
      </div>
      <div className="min-w-0 p-2 sm:p-3" aria-live="polite" aria-atomic="true">
        {visibleTabs.map((tab) => (
          <div
            key={tab.id}
            className={tab.id === active?.id ? "block min-w-0" : "hidden min-w-0"}
            data-export-caption={tab.label}
            role="tabpanel"
            aria-hidden={tab.id !== active?.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}

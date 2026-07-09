"use client";

import { useState, type ReactNode } from "react";

export type BearingInputTabId = "application" | "loads" | "operating" | "selection";

const TAB_LABELS: Record<BearingInputTabId, string> = {
  application: "Application",
  loads: "Loads",
  operating: "Operating",
  selection: "Selection",
};

type Props = {
  children: (activeTab: BearingInputTabId) => ReactNode;
  defaultTab?: BearingInputTabId;
};

export default function BearingInputTabs({ children, defaultTab = "application" }: Props) {
  const [activeTab, setActiveTab] = useState<BearingInputTabId>(defaultTab);
  const tabs: BearingInputTabId[] = ["application", "loads", "operating", "selection"];

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-1 rounded-xl bg-slate-100/90 p-1 shadow-inner dark:bg-slate-800/80"
        role="tablist"
        aria-label="Bearing input sections"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-cyan-900 shadow-sm ring-1 ring-cyan-200/80 dark:bg-slate-950 dark:text-cyan-100 dark:ring-cyan-700/60"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{children(activeTab)}</div>
    </div>
  );
}

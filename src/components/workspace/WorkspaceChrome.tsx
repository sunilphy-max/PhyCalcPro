"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { DesignWorkspaceContract, WorkspaceTabId } from "@/lib/workspace/designWorkspaceContract";
import { useModuleWorkspaceOptional } from "@/contexts/ModuleWorkspaceContext";

const TAB_LABELS: Record<WorkspaceTabId, string> = {
  calculator: "Calculator",
  knowledge: "Knowledge",
  materials: "Materials",
  model: "Model",
  report: "Report",
  ai: "AI",
  teach: "Teach",
};

type TabSlot = {
  id: WorkspaceTabId;
  content: ReactNode;
  /** Hide tab if content not provided */
  available?: boolean;
};

type Props = {
  contract: DesignWorkspaceContract;
  /** Primary calculator chrome (inputs/results) — always shown under Calculator tab */
  calculator: ReactNode;
  tabs?: Partial<Record<Exclude<WorkspaceTabId, "calculator">, ReactNode>>;
  defaultTab?: WorkspaceTabId;
  /** Compact banner under the title */
  banner?: ReactNode;
};

/**
 * EDP workspace shell — tabs around the calculator without replacing CalculatorLayout.
 */
export default function WorkspaceChrome({
  contract,
  calculator,
  tabs = {},
  defaultTab = "calculator",
  banner,
}: Props) {
  const workspace = useModuleWorkspaceOptional();
  const slots: TabSlot[] = (
    [
      { id: "calculator" as const, content: calculator, available: true },
      { id: "knowledge" as const, content: tabs.knowledge, available: tabs.knowledge != null },
      { id: "materials" as const, content: tabs.materials, available: tabs.materials != null },
      { id: "model" as const, content: tabs.model, available: tabs.model != null },
      { id: "report" as const, content: tabs.report, available: tabs.report != null },
      { id: "ai" as const, content: tabs.ai, available: tabs.ai != null },
      { id: "teach" as const, content: tabs.teach, available: tabs.teach != null },
    ] satisfies TabSlot[]
  ).filter((s) => s.available);

  const slotIdsKey = slots.map((s) => s.id).join(",");
  const contextTab = workspace?.activeWorkspaceTab;
  const setContextTab = workspace?.setActiveWorkspaceTab;

  const [localActive, setLocalActive] = useState<WorkspaceTabId>(
    slots.some((s) => s.id === defaultTab) ? defaultTab : "calculator"
  );

  // Prefer context-controlled tab when available (design-step rail → Report).
  const active =
    contextTab && slotIdsKey.split(",").includes(contextTab) ? contextTab : localActive;

  useEffect(() => {
    const ids = slotIdsKey.split(",") as WorkspaceTabId[];
    if (contextTab && !ids.includes(contextTab)) {
      setContextTab?.("calculator");
    }
  }, [contextTab, slotIdsKey, setContextTab]);

  const setActive = (tab: WorkspaceTabId) => {
    setLocalActive(tab);
    setContextTab?.(tab);
  };

  const activeSlot = slots.find((s) => s.id === active) ?? slots[0];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3 dark:border-slate-700/60 dark:from-slate-900/80 dark:to-slate-900/40">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Design workspace
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {contract.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Module <span className="font-mono">{contract.moduleId}</span>
          </p>
        </div>
        {banner ? <div className="mt-2">{banner}</div> : null}
        <nav
          className="mt-3 flex flex-wrap gap-1 border-t border-slate-200/70 pt-3 dark:border-slate-700/50"
          aria-label="Workspace sections"
        >
          {slots.map((slot) => {
            const selected = slot.id === activeSlot?.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActive(slot.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {TAB_LABELS[slot.id]}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={activeSlot?.id === "calculator" ? "" : "rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/60"}>
        {activeSlot?.content}
      </div>
    </div>
  );
}

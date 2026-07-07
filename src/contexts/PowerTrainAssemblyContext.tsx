"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAssemblyAutoApply } from "@/lib/design-workflows/crossCalcHandoff";
import {
  createPowerTrainAssembly,
  getActiveAssemblyId,
  loadPowerTrainAssembly,
  markAssemblyStepComplete,
  nextStepAfter,
  setActiveAssemblyId,
  skipAssemblyStep,
  type PowerTrainAssembly,
  type PowerTrainStepId,
} from "@/lib/design-workflows/powerTrainAssembly";

type PowerTrainAssemblyContextValue = {
  assembly: PowerTrainAssembly | null;
  refresh: () => void;
  startAssembly: (name?: string) => PowerTrainAssembly;
  loadAssembly: (id: string) => void;
  completeStep: (moduleId: string, summary?: string, params?: Record<string, number>) => void;
  skipStep: (stepId: PowerTrainStepId) => void;
  clearAssembly: () => void;
};

const PowerTrainAssemblyContext = createContext<PowerTrainAssemblyContextValue | null>(null);

export function PowerTrainAssemblyProvider({ children }: { children: ReactNode }) {
  const [assembly, setAssembly] = useState<PowerTrainAssembly | null>(null);

  const refresh = useCallback(() => {
    const activeId = getActiveAssemblyId();
    setAssembly(activeId ? loadPowerTrainAssembly(activeId) : null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startAssembly = useCallback((name?: string) => {
    const created = createPowerTrainAssembly(name);
    setAssembly(created);
    setAssemblyAutoApply(true);
    return created;
  }, []);

  const loadAssembly = useCallback((id: string) => {
    setActiveAssemblyId(id);
    setAssembly(loadPowerTrainAssembly(id));
    setAssemblyAutoApply(true);
  }, []);

  const completeStep = useCallback(
    (moduleId: string, summary?: string, params?: Record<string, number>) => {
      const activeId = getActiveAssemblyId();
      if (!activeId) return;
      const updated = markAssemblyStepComplete(activeId, moduleId, summary, params);
      if (updated) setAssembly(updated);
    },
    []
  );

  const skipStep = useCallback((stepId: PowerTrainStepId) => {
    const activeId = getActiveAssemblyId();
    if (!activeId) return;
    const updated = skipAssemblyStep(activeId, stepId);
    if (updated) setAssembly(updated);
  }, []);

  const clearAssembly = useCallback(() => {
    setActiveAssemblyId(null);
    setAssembly(null);
    setAssemblyAutoApply(false);
  }, []);

  const value = useMemo(
    () => ({
      assembly,
      refresh,
      startAssembly,
      loadAssembly,
      completeStep,
      skipStep,
      clearAssembly,
    }),
    [assembly, refresh, startAssembly, loadAssembly, completeStep, skipStep, clearAssembly]
  );

  return (
    <PowerTrainAssemblyContext.Provider value={value}>{children}</PowerTrainAssemblyContext.Provider>
  );
}

export function usePowerTrainAssembly() {
  const ctx = useContext(PowerTrainAssemblyContext);
  if (!ctx) throw new Error("usePowerTrainAssembly requires PowerTrainAssemblyProvider");
  return ctx;
}

export function usePowerTrainAssemblyOptional() {
  return useContext(PowerTrainAssemblyContext);
}

/** Call after a successful module Calculate to advance the power-train assembly. */
export function usePowerTrainStepCompletion() {
  const ctx = usePowerTrainAssemblyOptional();
  return useCallback(
    (moduleId: string, summary?: string, params?: Record<string, number>) => {
      ctx?.completeStep(moduleId, summary, params);
    },
    [ctx]
  );
}

export function usePowerTrainNextStep(moduleId: string | undefined) {
  return moduleId ? nextStepAfter(moduleId) : null;
}

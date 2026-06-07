"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

type ApplyDesignCandidateHandler = (fields: Record<string, unknown>) => void;

type DesignWorkflowContextValue = {
  moduleId?: string;
  mode: DesignWorkflowMode;
  setMode: Dispatch<SetStateAction<DesignWorkflowMode>>;
  userInputs: ModuleUserInputs;
  setUserInputs: Dispatch<SetStateAction<ModuleUserInputs>>;
  applyDesignCandidate: (fields: Record<string, unknown>) => void;
  registerApplyDesignCandidate: (handler: ApplyDesignCandidateHandler | null) => void;
};

const DesignWorkflowContext = createContext<DesignWorkflowContextValue | null>(null);

const noop = () => {};

export function DesignWorkflowProvider({
  moduleId,
  children,
}: {
  moduleId?: string;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<DesignWorkflowMode>("check");
  const [userInputs, setUserInputs] = useState<ModuleUserInputs>({});
  const applyHandlerRef = useRef<ApplyDesignCandidateHandler | null>(null);

  const registerApplyDesignCandidate = useCallback((handler: ApplyDesignCandidateHandler | null) => {
    applyHandlerRef.current = handler;
  }, []);

  const applyDesignCandidate = useCallback((fields: Record<string, unknown>) => {
    applyHandlerRef.current?.(fields);
  }, []);

  const value = useMemo(
    () => ({
      moduleId,
      mode,
      setMode,
      userInputs,
      setUserInputs,
      applyDesignCandidate,
      registerApplyDesignCandidate,
    }),
    [moduleId, mode, userInputs, applyDesignCandidate, registerApplyDesignCandidate]
  );

  return (
    <DesignWorkflowContext.Provider value={value}>{children}</DesignWorkflowContext.Provider>
  );
}

export function useDesignWorkflow(): DesignWorkflowContextValue {
  const ctx = useContext(DesignWorkflowContext);
  if (!ctx) {
    return {
      moduleId: undefined,
      mode: "check",
      setMode: noop,
      userInputs: {},
      setUserInputs: noop,
      applyDesignCandidate: noop,
      registerApplyDesignCandidate: noop,
    };
  }
  return ctx;
}

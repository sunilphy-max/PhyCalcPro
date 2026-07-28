"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { Material } from "@/data/materials";
import type { DesignSummaryRow } from "@/components/calculator/CalculatorDesignSummary";
import type { ProjectRevision } from "@/lib/workspace/projectRevisions";
import type { WorkspaceTabId } from "@/lib/workspace/designWorkspaceContract";
import { dispatchMaterialApply } from "@/lib/workspace/materialEvents";
import { getModuleWorkspaceEntry } from "@/lib/workspace/workspaceRegistry";

export type MaterialApplyHandler = (material: Material) => void;

type TabOverrides = Partial<Record<Exclude<WorkspaceTabId, "calculator">, ReactNode>>;

type ModuleWorkspaceContextValue = {
  moduleId: string;
  registerMaterialApply: (handler: MaterialApplyHandler | null) => void;
  applyMaterial: (material: Material) => void;
  summaryRows: DesignSummaryRow[];
  setSummaryRows: Dispatch<SetStateAction<DesignSummaryRow[]>>;
  revisions: ProjectRevision[];
  setRevisions: Dispatch<SetStateAction<ProjectRevision[]>>;
  tabOverrides: TabOverrides;
  setTabOverride: (tab: Exclude<WorkspaceTabId, "calculator">, content: ReactNode | null) => void;
  selectedMaterialName: string | null;
  setSelectedMaterialName: (name: string | null) => void;
  workspaceEnabled: boolean;
};

const ModuleWorkspaceContext = createContext<ModuleWorkspaceContextValue | null>(null);

type ProviderProps = {
  moduleId: string;
  children: ReactNode;
  /** Set false to opt out of workspace chrome for a specific layout instance */
  workspaceEnabled?: boolean;
};

export function ModuleWorkspaceProvider({
  moduleId,
  children,
  workspaceEnabled = true,
}: ProviderProps) {
  const materialHandlerRef = useRef<MaterialApplyHandler | null>(null);
  const [summaryRows, setSummaryRows] = useState<DesignSummaryRow[]>([]);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);
  const [tabOverrides, setTabOverrides] = useState<TabOverrides>({});
  const [selectedMaterialName, setSelectedMaterialName] = useState<string | null>(null);

  const registerMaterialApply = useCallback((handler: MaterialApplyHandler | null) => {
    materialHandlerRef.current = handler;
  }, []);

  const setTabOverride = useCallback(
    (tab: Exclude<WorkspaceTabId, "calculator">, content: ReactNode | null) => {
      setTabOverrides((prev) => {
        if (content == null) {
          if (!(tab in prev)) return prev;
          const next = { ...prev };
          delete next[tab];
          return next;
        }
        if (prev[tab] === content) return prev;
        return { ...prev, [tab]: content };
      });
    },
    []
  );

  const applyMaterial = useCallback(
    (material: Material) => {
      setSelectedMaterialName(material.name);
      const entry = getModuleWorkspaceEntry(moduleId);
      materialHandlerRef.current?.(material);
      dispatchMaterialApply({
        material,
        profile: entry.materialProfile,
        source: "workspace",
      });
    },
    [moduleId]
  );

  const value = useMemo(
    () => ({
      moduleId,
      registerMaterialApply,
      applyMaterial,
      summaryRows,
      setSummaryRows,
      revisions,
      setRevisions,
      tabOverrides,
      setTabOverride,
      selectedMaterialName,
      setSelectedMaterialName,
      workspaceEnabled,
    }),
    [
      moduleId,
      registerMaterialApply,
      applyMaterial,
      summaryRows,
      revisions,
      tabOverrides,
      setTabOverride,
      selectedMaterialName,
      workspaceEnabled,
    ]
  );

  return (
    <ModuleWorkspaceContext.Provider value={value}>{children}</ModuleWorkspaceContext.Provider>
  );
}

export function useModuleWorkspaceOptional() {
  return useContext(ModuleWorkspaceContext);
}

export function useModuleWorkspace() {
  const ctx = useContext(ModuleWorkspaceContext);
  if (!ctx) {
    throw new Error("useModuleWorkspace must be used within ModuleWorkspaceProvider");
  }
  return ctx;
}

/** Register a page-level material apply handler (e.g. beams setMaterial). */
export function useRegisterWorkspaceMaterialApply(handler: MaterialApplyHandler | null) {
  const ctx = useModuleWorkspaceOptional();
  const registerMaterialApply = ctx?.registerMaterialApply;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const hasHandler = handler != null;

  useEffect(() => {
    if (!registerMaterialApply) return;
    const stable: MaterialApplyHandler = (m) => {
      handlerRef.current?.(m);
    };
    registerMaterialApply(hasHandler ? stable : null);
    return () => registerMaterialApply(null);
  }, [registerMaterialApply, hasHandler]);
}

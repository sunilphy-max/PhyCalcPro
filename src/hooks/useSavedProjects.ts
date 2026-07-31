"use client";

import { useCallback, useState } from "react";
import {
  loadLocalProjects,
  saveLocalProject,
  updateLocalProject,
  type LocalProject,
} from "@/lib/localProjects";

/**
 * Standard saved-projects wiring for a calculator page: project-name state,
 * the saved list, and a save callback. Saving also syncs to the workspaces
 * API in the background (Supabase-backed when configured).
 */
export function useSavedProjects<TData extends object>(
  namespace: string,
  defaultName: string
) {
  const [projectName, setProjectName] = useState(defaultName);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<LocalProject<TData>[]>(() =>
    loadLocalProjects<TData>(namespace)
  );

  const saveProject = useCallback(
    (data: TData) => {
      setSaving(true);
      const projects = activeProjectId
        ? updateLocalProject<TData>(namespace, activeProjectId, projectName, data)
        : saveLocalProject<TData>(namespace, projectName, data);
      setSavedProjects(projects);
      const match = projects.find((p) =>
        activeProjectId ? p.id === activeProjectId : p.name === projectName
      );
      if (match) setActiveProjectId(match.id);
      setSaving(false);
    },
    [namespace, projectName, activeProjectId]
  );

  return {
    projectName,
    setProjectName,
    activeProjectId,
    setActiveProjectId,
    saving,
    savedProjects,
    saveProject,
  };
}

"use client";

import { useCallback, useState } from "react";
import {
  loadLocalProjects,
  saveLocalProject,
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
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<LocalProject<TData>[]>(() =>
    loadLocalProjects<TData>(namespace)
  );

  const saveProject = useCallback(
    (data: TData) => {
      setSaving(true);
      const projects = saveLocalProject<TData>(namespace, projectName, data);
      setSavedProjects(projects);
      setSaving(false);
    },
    [namespace, projectName]
  );

  return {
    projectName,
    setProjectName,
    saving,
    savedProjects,
    saveProject,
  };
}

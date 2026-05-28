"use client";

import { useState } from "react";

export type SavedProjectItem = {
  id: string;
  name: string;
  created_at?: string;
};

type Props = {
  projects: SavedProjectItem[];
  onLoad: (project: SavedProjectItem) => void;
  title?: string;
  emptyMessage?: string;
};

export default function SavedProjectsFooter({
  projects,
  onLoad,
  title = "Saved projects",
  emptyMessage = "No saved projects yet. Use Save on the calculator to store a configuration.",
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            {projects.length} saved {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded ? (
        <div className="border-t border-slate-200 px-4 py-3">
          {projects.length ? (
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onLoad(project)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  {project.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{emptyMessage}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

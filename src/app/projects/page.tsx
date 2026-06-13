"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Trash2 } from "lucide-react";
import { deleteLocalProject, listAllLocalProjects, type SavedStudy } from "@/lib/localProjects";
import { allModules } from "@/data/modules";

/** Saved-project namespaces that don't match a module id directly. */
const NAMESPACE_TO_MODULE: Record<string, string> = {
  beam: "beams",
  buckling: "columns",
  screws: "bolts",
  shaft: "shafts",
};

function moduleForNamespace(namespace: string) {
  const moduleId = NAMESPACE_TO_MODULE[namespace] ?? namespace;
  return allModules.find((m) => m.id === moduleId);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ProjectsDashboardPage() {
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStudies(listAllLocalProjects());
    setLoaded(true);
  }, []);

  const remove = (study: SavedStudy) => {
    deleteLocalProject(study.namespace, study.id);
    setStudies(listAllLocalProjects());
  };

  const grouped = studies.reduce<Record<string, SavedStudy[]>>((acc, study) => {
    (acc[study.namespace] ??= []).push(study);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-7 w-7 text-slate-700" aria-hidden />
        <h1 className="text-3xl font-semibold text-slate-950">Saved design studies</h1>
      </div>
      <p className="mt-3 text-slate-600">
        Studies you save inside any calculator are stored in this browser and listed here. Open the
        module and load the project from its saved-projects footer to continue working.
      </p>

      {!loaded ? null : studies.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          No saved studies yet. Open a calculator (beams, gears, springs, bolts…) and use
          &ldquo;Save project&rdquo; after running a calculation.
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          {Object.entries(grouped).map(([namespace, items]) => {
            const moduleInfo = moduleForNamespace(namespace);
            return (
              <section key={namespace} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {moduleInfo?.title ?? namespace}
                  </h2>
                  {moduleInfo ? (
                    <Link
                      href={moduleInfo.route}
                      className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Open calculator
                    </Link>
                  ) : null}
                </div>
                <ul className="mt-4 divide-y divide-slate-100">
                  {items.map((study) => (
                    <li key={study.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <div className="font-medium text-slate-900">{study.name}</div>
                        <div className="text-xs text-slate-500">Saved {formatDate(study.created_at)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(study)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Delete ${study.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

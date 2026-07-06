"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, FolderOpen, Trash2 } from "lucide-react";
import { deleteLocalProject, listAllLocalProjects, type SavedStudy } from "@/lib/localProjects";
import {
  listCalculationHistory,
  type CalculationHistoryEntry,
} from "@/lib/persistence/calculationHistory";
import { usePersistence } from "@/contexts/PersistenceContext";
import { isSupabaseSignInReady, showGuestHistoryUx } from "@/lib/supabase/setupStatus";
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

function moduleForHistoryEntry(entry: CalculationHistoryEntry) {
  return allModules.find((m) => m.id === entry.moduleId);
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

function formatSummary(summary?: CalculationHistoryEntry["summary"]): string {
  if (!summary) return "—";
  const parts: string[] = [];
  if (summary.pass) parts.push(`${summary.pass} pass`);
  if (summary.warning) parts.push(`${summary.warning} warn`);
  if (summary.fail) parts.push(`${summary.fail} fail`);
  return parts.length ? parts.join(" · ") : "—";
}

type TabId = "studies" | "history";

export default function ProjectsDashboardPage() {
  const { mode, canPersistAcrossSessions } = usePersistence();
  const signInReady = isSupabaseSignInReady();
  const guestHistoryUx = showGuestHistoryUx();
  const [tab, setTab] = useState<TabId>("studies");
  const [studies, setStudies] = useState<SavedStudy[]>([]);
  const [history, setHistory] = useState<CalculationHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setStudies(listAllLocalProjects());
    const entries = await listCalculationHistory();
    setHistory(entries);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, mode]);

  const remove = (study: SavedStudy) => {
    deleteLocalProject(study.namespace, study.id);
    void refresh();
  };

  const grouped = studies.reduce<Record<string, SavedStudy[]>>((acc, study) => {
    (acc[study.namespace] ??= []).push(study);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-7 w-7 text-slate-700" aria-hidden />
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Projects</h1>
      </div>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        {canPersistAcrossSessions
          ? "Saved studies and calculation history are stored in your account."
          : guestHistoryUx
            ? "You are browsing as a guest. Studies and calculations are kept only for this tab session."
            : "Studies you save inside any calculator are stored in this browser and listed here."}
      </p>

      {guestHistoryUx && mode === "guest" ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {signInReady ? (
            <>
              <Link href="/account" className="font-semibold underline">
                Sign in
              </Link>{" "}
              to keep your history after you close the browser.
            </>
          ) : (
            <>
              Cloud sign-in is not configured yet. See the{" "}
              <Link href="/documentation/supabase" className="font-semibold underline">
                Supabase setup guide
              </Link>{" "}
              or{" "}
              <Link href="/account" className="font-semibold underline">
                Account
              </Link>{" "}
              for next steps.
            </>
          )}
        </p>
      ) : null}

      <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab("studies")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold ${
            tab === "studies"
              ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
              : "border-transparent text-slate-500"
          }`}
        >
          Saved studies
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold ${
            tab === "history"
              ? "border-slate-900 text-slate-900 dark:border-white dark:text-white"
              : "border-transparent text-slate-500"
          }`}
        >
          Calculation history
        </button>
      </div>

      {!loaded ? null : tab === "studies" ? (
        studies.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
            No saved studies yet. Open a calculator and use &ldquo;Save project&rdquo; after running
            a calculation.
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {Object.entries(grouped).map(([namespace, items]) => {
              const moduleInfo = moduleForNamespace(namespace);
              return (
                <section
                  key={namespace}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {moduleInfo?.title ?? namespace}
                    </h2>
                    {moduleInfo ? (
                      <Link
                        href={moduleInfo.route}
                        className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                      >
                        Open calculator
                      </Link>
                    ) : null}
                  </div>
                  <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((study) => (
                      <li key={study.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {study.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Saved {formatDate(study.created_at)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(study)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-slate-700"
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
        )
      ) : history.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
          <Clock3 className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
          <p className="mt-3">
            No calculations recorded yet. Run a calculation in any module to build your history.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((entry) => {
              const moduleInfo = moduleForHistoryEntry(entry);
              return (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {moduleInfo?.title ?? entry.moduleId}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(entry.computedAt)} · {entry.designCode || "—"} · Checks:{" "}
                      {formatSummary(entry.summary)}
                    </div>
                  </div>
                  {moduleInfo ? (
                    <Link
                      href={moduleInfo.route}
                      className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Open module
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

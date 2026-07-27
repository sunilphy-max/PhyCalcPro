"use client";

import { useMemo, useState } from "react";
import CalculatorDesignSummary, {
  type DesignSummaryRow,
} from "@/components/calculator/CalculatorDesignSummary";
import {
  WORKSPACE_REPORT_SECTION_ORDER,
  type WorkspaceReportSectionId,
} from "@/lib/workspace/designWorkspaceContract";
import type { ProjectRevision } from "@/lib/workspace/projectRevisions";

type Props = {
  projectName: string;
  engineer?: string;
  revision?: string;
  summaryRows: DesignSummaryRow[];
  revisions?: ProjectRevision[];
  onExportPackage?: () => void;
  onSaveRevision?: (note: string) => void;
  sectionPresence?: Partial<Record<WorkspaceReportSectionId, boolean>>;
};

/**
 * Report tab — design package + revision trail (EDP-6).
 */
export default function WorkspaceReportPanel({
  projectName,
  engineer,
  revision = "A",
  summaryRows,
  revisions = [],
  onExportPackage,
  onSaveRevision,
  sectionPresence,
}: Props) {
  const [note, setNote] = useState("");

  const sections = useMemo(
    () =>
      WORKSPACE_REPORT_SECTION_ORDER.map((id) => ({
        id,
        present: sectionPresence?.[id] ?? true,
      })),
    [sectionPresence]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Design report</h3>
        <p className="mt-1 text-xs text-slate-500">
          Project <span className="font-medium">{projectName}</span>
          {engineer ? ` · ${engineer}` : ""} · Rev {revision}
        </p>
      </div>

      <CalculatorDesignSummary title="Governing summary" rows={summaryRows} committed />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Package sections
        </p>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">
          {sections.map((s) => (
            <li
              key={s.id}
              className={`rounded px-2 py-1 text-xs ${
                s.present
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              {s.id}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {onExportPackage ? (
          <button
            type="button"
            onClick={onExportPackage}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            Generate design package (PDF)
          </button>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Revision history</p>
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          {revisions.length === 0 ? (
            <li className="text-slate-400">No revisions saved yet.</li>
          ) : (
            revisions.map((r) => (
              <li key={r.id}>
                <span className="font-mono text-[10px] text-slate-400">{r.createdAt.slice(0, 19)}</span>
                {" — "}
                {r.note || "Saved"}
                {r.inputHash ? (
                  <span className="ml-1 font-mono text-[10px] text-slate-400">#{r.inputHash.slice(0, 8)}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
        {onSaveRevision ? (
          <div className="mt-2 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Revision note"
              className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={() => {
                onSaveRevision(note.trim() || "Checkpoint");
                setNote("");
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold dark:border-slate-600"
            >
              Save rev
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

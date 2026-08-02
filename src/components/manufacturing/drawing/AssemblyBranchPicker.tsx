"use client";

import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
} from "@/components/calculator/styles";
import type { AssemblyNode, PackageValidationIssue } from "@/lib/manufacturing/package";
import {
  findAssemblyNode,
  groupAssemblyByLevel,
  parentPartNumberOf,
  unionBranchScopes,
} from "@/lib/manufacturing/package";

type ExtractStatus = "pending" | "done" | "error" | "idle";

type Props = {
  tree: AssemblyNode[];
  /** Branch roots the engineer chose (click to toggle). */
  selectedBranches: string[];
  /** Currently focused node (last clicked / active context). */
  activePartNumber: string | null;
  extractStatus?: Record<string, ExtractStatus>;
  issues?: PackageValidationIssue[];
  /** Compact strip for Build tab. */
  compact?: boolean;
  onToggleBranch: (partNumber: string, drawingFile: string) => void;
  onFocus: (partNumber: string, drawingFile: string) => void;
  onSelectAllAssemblies?: () => void;
  onClearSelection?: () => void;
};

const LEVEL_LABEL: Record<number, string> = {
  0: "Top level",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
  4: "Level 4",
};

function levelLabel(level: number): string {
  return LEVEL_LABEL[level] ?? `Level ${level}`;
}

function typeBadge(nodeType: AssemblyNode["nodeType"]): string {
  if (nodeType === "toplevel") return "TOP";
  if (nodeType === "assembly") return "ASM";
  if (nodeType === "subassembly") return "SA";
  return "COMP";
}

function statusDot(status: ExtractStatus): string {
  if (status === "done") return "bg-emerald-500";
  if (status === "pending") return "bg-amber-400 animate-pulse";
  if (status === "error") return "bg-red-500";
  return "bg-slate-300 dark:bg-slate-600";
}

export default function AssemblyBranchPicker({
  tree,
  selectedBranches,
  activePartNumber,
  extractStatus = {},
  issues = [],
  compact = false,
  onToggleBranch,
  onFocus,
  onSelectAllAssemblies,
  onClearSelection,
}: Props) {
  const byLevel = groupAssemblyByLevel(tree);
  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  const selectedSet = new Set(selectedBranches);
  const scopePns = unionBranchScopes(tree, selectedBranches);
  const scopeSet = new Set(scopePns);

  if (tree.length === 0) {
    return (
      <p className="text-xs text-slate-500">Upload a ZIP with BOM to see the drawing hierarchy.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Drawing hierarchy
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Top → Level 1 → Level 2. Click a drawing card to select that branch (and its children for
          extract). No typing — selection is click-only.
        </p>
      </div>

      {!compact ? (
        <div className="flex flex-wrap gap-2">
          {onSelectAllAssemblies ? (
            <button
              type="button"
              className={calculatorSecondaryButtonClass}
              style={{ width: "auto" }}
              onClick={onSelectAllAssemblies}
            >
              Select all SA / assemblies
            </button>
          ) : null}
          {onClearSelection ? (
            <button
              type="button"
              className={calculatorSecondaryButtonClass}
              style={{ width: "auto" }}
              onClick={onClearSelection}
            >
              Clear selection
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={`space-y-0 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40 ${
          compact ? "max-h-56" : "max-h-[28rem]"
        }`}
      >
        {levels.map((level, levelIdx) => {
          const nodes = byLevel.get(level) ?? [];
          return (
            <div key={level}>
              {levelIdx > 0 ? (
                <div className="flex justify-center py-1" aria-hidden>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                </div>
              ) : null}
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {levelLabel(level)}
                </span>
                <span className="text-[10px] text-slate-400">{nodes.length} drawing(s)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {nodes.map((node) => {
                  const selected = selectedSet.has(node.partNumber);
                  const inScope = scopeSet.has(node.partNumber);
                  const active = activePartNumber === node.partNumber;
                  const status = extractStatus[node.partNumber] ?? "idle";
                  const parentPn = parentPartNumberOf(tree, node.partNumber);
                  const parentSelected = parentPn ? selectedSet.has(parentPn) : false;

                  return (
                    <button
                      key={node.partNumber}
                      type="button"
                      onClick={() => {
                        onToggleBranch(node.partNumber, node.drawingFile);
                        onFocus(node.partNumber, node.drawingFile);
                      }}
                      className={`group relative w-[9.5rem] shrink-0 rounded-xl border-2 p-2.5 text-left transition ${
                        selected
                          ? "border-cyan-500 bg-cyan-50 shadow-sm dark:border-cyan-400 dark:bg-cyan-950/50"
                          : inScope
                            ? "border-cyan-200 bg-white dark:border-cyan-900 dark:bg-slate-900"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                      } ${active ? "ring-2 ring-cyan-400/60 ring-offset-1 dark:ring-offset-slate-950" : ""}`}
                      title={`${node.partNumber} · ${node.drawingFile}${parentSelected && !selected ? " (in parent branch scope)" : ""}`}
                    >
                      {/* Mini drawing sheet visual */}
                      <div
                        className={`mb-2 flex h-14 items-center justify-center rounded-md border border-dashed text-[10px] ${
                          selected
                            ? "border-cyan-300 bg-white/80 dark:border-cyan-700 dark:bg-slate-950/40"
                            : "border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50"
                        }`}
                      >
                        <div className="px-1 text-center leading-tight">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">PDF</div>
                          <div className="truncate text-slate-400">{node.drawingFile}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] ${
                            selected
                              ? "border-cyan-600 bg-cyan-600 text-white"
                              : "border-slate-300 text-transparent dark:border-slate-600"
                          }`}
                          aria-hidden
                        >
                          ✓
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-50">
                            {node.partNumber}
                          </div>
                          <div className="truncate text-[10px] text-slate-500">
                            {node.description || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium uppercase text-slate-500 dark:bg-slate-800">
                          {typeBadge(node.nodeType)}
                          {node.revision ? ` · R${node.revision}` : ""}
                        </span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`}
                          title={`Extract: ${status}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900/60">
        <div className="font-medium text-slate-800 dark:text-slate-100">
          Branches selected: {selectedBranches.length || "none"}
        </div>
        {selectedBranches.length > 0 ? (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {selectedBranches.map((pn) => {
              const node = findAssemblyNode(tree, pn);
              return (
                <li key={pn}>
                  <button
                    type="button"
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      activePartNumber === pn
                        ? "bg-cyan-600 text-white"
                        : "bg-cyan-50 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-100"
                    }`}
                    onClick={() =>
                      node && onFocus(node.partNumber, node.drawingFile)
                    }
                  >
                    {pn}
                    {node ? ` · ${typeBadge(node.nodeType)}` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-1 text-slate-500">
            Click cards above to choose which branches matter for extract and stacks.
          </p>
        )}
        {scopePns.length > 0 ? (
          <p className="mt-1.5 text-[10px] text-slate-500">
            Drawings in scope (branch + children): {scopePns.length}
          </p>
        ) : null}
        {activePartNumber ? (
          <p className="mt-1 text-[10px] text-slate-500">
            Active context: <span className="font-medium">{activePartNumber}</span>
            {" — "}
            use this for “Create stack on branch”.
          </p>
        ) : null}
      </div>

      {!compact && selectedBranches.length > 0 ? (
        <button
          type="button"
          className={calculatorPrimaryButtonClass}
          style={{ width: "auto" }}
          onClick={() => {
            const pn = activePartNumber ?? selectedBranches[0]!;
            const node = findAssemblyNode(tree, pn);
            if (node) onFocus(node.partNumber, node.drawingFile);
          }}
        >
          Use active branch for stacks →
        </button>
      ) : null}

      {issues.length > 0 ? (
        <ul className="max-h-24 space-y-1 overflow-y-auto text-xs">
          {issues.map((issue) => (
            <li
              key={`${issue.code}-${issue.message}`}
              className={
                issue.severity === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-700 dark:text-amber-400"
              }
            >
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

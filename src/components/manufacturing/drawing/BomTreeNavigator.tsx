"use client";

import type { AssemblyNode, PackageValidationIssue } from "@/lib/manufacturing/package";

type Props = {
  tree: AssemblyNode[];
  selectedPartNumber: string | null;
  onSelect: (partNumber: string, drawingFile: string) => void;
  issues?: PackageValidationIssue[];
  extractStatus?: Record<string, "pending" | "done" | "error" | "idle">;
};

function NodeRow({
  node,
  depth,
  selectedPartNumber,
  onSelect,
  extractStatus,
}: {
  node: AssemblyNode;
  depth: number;
  selectedPartNumber: string | null;
  onSelect: (partNumber: string, drawingFile: string) => void;
  extractStatus?: Record<string, "pending" | "done" | "error" | "idle">;
}) {
  const selected = selectedPartNumber === node.partNumber;
  const status = extractStatus?.[node.partNumber] ?? "idle";
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.partNumber, node.drawingFile)}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
          selected
            ? "bg-cyan-50 text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-100"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <span className="min-w-0 flex-1 truncate font-medium">
          {node.description || node.partNumber}
        </span>
        <span className="shrink-0 text-[10px] uppercase text-slate-400">{node.nodeType}</span>
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            status === "done"
              ? "bg-emerald-500"
              : status === "pending"
                ? "bg-amber-400"
                : status === "error"
                  ? "bg-red-500"
                  : "bg-slate-300"
          }`}
          title={`Extract: ${status}`}
        />
      </button>
      {node.children.map((child) => (
        <NodeRow
          key={child.partNumber}
          node={child}
          depth={depth + 1}
          selectedPartNumber={selectedPartNumber}
          onSelect={onSelect}
          extractStatus={extractStatus}
        />
      ))}
    </div>
  );
}

export default function BomTreeNavigator({
  tree,
  selectedPartNumber,
  onSelect,
  issues = [],
  extractStatus,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Assembly structure
      </h3>
      {tree.length === 0 ? (
        <p className="text-xs text-slate-500">Upload a ZIP with BOM.xlsx to build the tree.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
          {tree.map((node) => (
            <NodeRow
              key={node.partNumber}
              node={node}
              depth={0}
              selectedPartNumber={selectedPartNumber}
              onSelect={onSelect}
              extractStatus={extractStatus}
            />
          ))}
        </div>
      )}
      {issues.length > 0 ? (
        <ul className="max-h-28 space-y-1 overflow-y-auto text-xs">
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

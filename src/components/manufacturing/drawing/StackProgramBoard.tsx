"use client";

import {
  calculatorNumberInputClass,
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import type {
  NamedStack,
  StackDashboardRow,
  StackLevel,
  StackMethod,
} from "@/lib/manufacturing/package";
import { fromBase, toBase } from "@/lib/units/conversions";

type Props = {
  stacks: NamedStack[];
  dashboard: StackDashboardRow[];
  activeStackId: string | null;
  /** Active branch from visual picker (click-selected). */
  contextPartNumber: string | null;
  contextNodeType?: string | null;
  displayUnit: string;
  onSelect: (id: string) => void;
  /** Create stack on the visually selected branch — no manual PN entry. */
  onCreateOnBranch: (level: StackLevel) => void;
  onUpdateActive: (patch: Partial<NamedStack>) => void;
  onDeleteActive: () => void;
};

const statusTone: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  confirmed: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
  solved: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200",
  pass: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  risk: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  fail: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200",
};

export default function StackProgramBoard({
  stacks,
  dashboard,
  activeStackId,
  contextPartNumber,
  contextNodeType,
  displayUnit,
  onSelect,
  onCreateOnBranch,
  onUpdateActive,
  onDeleteActive,
}: Props) {
  const active = stacks.find((s) => s.id === activeStackId) ?? null;
  const byLevel = {
    subassembly: dashboard.filter((d) => d.level === "subassembly"),
    assembly: dashboard.filter((d) => d.level === "assembly" || d.level === "toplevel"),
    other: dashboard.filter((d) => d.level === "component"),
  };

  const suggestedLevel: StackLevel =
    contextNodeType === "toplevel"
      ? "toplevel"
      : contextNodeType === "assembly"
        ? "assembly"
        : "subassembly";

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Stack program
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Pick a branch in the drawing hierarchy, then create a stack on that branch. Contributors
          come from component drawings under it.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs dark:border-slate-600 dark:bg-slate-800/40">
        {contextPartNumber ? (
          <>
            <span className="text-slate-500">Active branch: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {contextPartNumber}
            </span>
            {contextNodeType ? (
              <span className="ml-1 uppercase text-slate-400">({contextNodeType})</span>
            ) : null}
          </>
        ) : (
          <span className="text-slate-500">
            Click a branch card in the hierarchy above to choose where the stack lives.
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={calculatorPrimaryButtonClass}
          style={{ width: "auto" }}
          disabled={!contextPartNumber}
          onClick={() => onCreateOnBranch(suggestedLevel)}
        >
          Create stack on branch
        </button>
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          disabled={!contextPartNumber}
          onClick={() => onCreateOnBranch("subassembly")}
        >
          As SA stack
        </button>
        <button
          type="button"
          className={calculatorSecondaryButtonClass}
          disabled={!contextPartNumber}
          onClick={() => onCreateOnBranch("assembly")}
        >
          As assembly stack
        </button>
      </div>

      {dashboard.length === 0 ? (
        <p className="text-xs text-slate-500">
          No stacks yet. Select a branch, then create a stack on it.
        </p>
      ) : (
        <div className="space-y-2">
          {(
            [
              ["Sub-assembly", byLevel.subassembly],
              ["Assembly / top", byLevel.assembly],
              ["Other", byLevel.other],
            ] as const
          ).map(([label, rows]) =>
            rows.length === 0 ? null : (
              <div key={label}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <ul className="space-y-1">
                  {rows.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(row.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                          activeStackId === row.id
                            ? "bg-cyan-50 ring-1 ring-cyan-200 dark:bg-cyan-950/40 dark:ring-cyan-900"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
                        <span className="text-[10px] text-slate-400">{row.contextPartNumber}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusTone[row.status] ?? statusTone.draft}`}
                        >
                          {row.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}

      {active ? (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <label className="block space-y-1 text-xs text-slate-600">
            Stack name
            <input
              className={calculatorTextInputClass}
              value={active.name}
              onChange={(e) => onUpdateActive({ name: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-slate-600">
              Level
              <select
                className={calculatorSelectClass}
                value={active.level}
                onChange={(e) =>
                  onUpdateActive({ level: e.target.value as StackLevel })
                }
              >
                <option value="subassembly">Sub-assembly</option>
                <option value="assembly">Assembly</option>
                <option value="toplevel">Top-level</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-slate-600">
              Method
              <select
                className={calculatorSelectClass}
                value={active.method}
                onChange={(e) =>
                  onUpdateActive({ method: e.target.value as StackMethod })
                }
              >
                <option value="WC">Worst-case</option>
                <option value="RSS">RSS</option>
                <option value="MC">Monte Carlo</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-xs text-slate-600">
            Requirement max ({displayUnit})
            <input
              type="number"
              step="any"
              className={calculatorNumberInputClass}
              value={
                active.requirementMaxSi !== undefined
                  ? fromBase(active.requirementMaxSi, "length", displayUnit)
                  : ""
              }
              placeholder="optional"
              onChange={(e) => {
                const v = e.target.value;
                onUpdateActive({
                  requirementMaxSi:
                    v === "" ? undefined : toBase(Number(v), "length", displayUnit),
                });
              }}
            />
          </label>
          <p className="text-[10px] text-slate-500">
            Context PN: {active.contextPartNumber} · picks: {active.picks.length} ·{" "}
            {active.chainConfirmed ? "confirmed" : "not confirmed"}
          </p>
          <button
            type="button"
            className="text-[11px] text-red-600 hover:underline"
            onClick={onDeleteActive}
          >
            Delete stack
          </button>
        </div>
      ) : null}
    </div>
  );
}

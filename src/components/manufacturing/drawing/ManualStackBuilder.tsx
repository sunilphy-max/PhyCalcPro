"use client";

import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
} from "@/components/calculator/styles";
import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";
import {
  listPickCandidates,
  type ManualStackPick,
  type StackPickCandidate,
} from "@/lib/manufacturing/package";
import { fromBase } from "@/lib/units/conversions";
import { useMemo, useState } from "react";

type Props = {
  partNumber: string | null;
  drawingFile: string | null;
  extract: DrawingExtract | null;
  picks: ManualStackPick[];
  displayUnit: string;
  chainConfirmed: boolean;
  onPicksChange: (picks: ManualStackPick[]) => void;
  onConfirmChange: (confirmed: boolean) => void;
  onSolve: () => void;
};

export default function ManualStackBuilder({
  partNumber,
  drawingFile,
  extract,
  picks,
  displayUnit,
  chainConfirmed,
  onPicksChange,
  onConfirmChange,
  onSolve,
}: Props) {
  const [sense, setSense] = useState<1 | -1>(1);
  const [axis, setAxis] = useState<"X" | "Y" | "Z">("X");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const candidates: StackPickCandidate[] = useMemo(() => {
    if (!partNumber || !drawingFile || !extract) return [];
    return listPickCandidates(partNumber, drawingFile, extract);
  }, [partNumber, drawingFile, extract]);

  const addSelected = () => {
    if (!selectedKey || !partNumber) return;
    onConfirmChange(false);
    onPicksChange([
      ...picks,
      { candidateKey: selectedKey, partNumber, sense, axis },
    ]);
  };

  const removeAt = (index: number) => {
    onConfirmChange(false);
    onPicksChange(picks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Manual stack builder
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Select annotations from the active part, add them in chain order, confirm, then solve.
          AI does not invent the chain — you do.
        </p>
      </div>

      {!partNumber ? (
        <p className="text-xs text-slate-500">Select a part in the assembly tree.</p>
      ) : !extract ? (
        <p className="text-xs text-slate-500">
          Extract this drawing first (or wait for package extract to finish).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-slate-600">
              Sense
              <select
                className={calculatorSelectClass}
                value={sense}
                onChange={(e) => setSense(Number(e.target.value) < 0 ? -1 : 1)}
              >
                <option value={1}>+</option>
                <option value={-1}>−</option>
              </select>
            </label>
            <label className="text-xs text-slate-600">
              Axis
              <select
                className={calculatorSelectClass}
                value={axis}
                onChange={(e) => setAxis(e.target.value as "X" | "Y" | "Z")}
              >
                <option value="X">X</option>
                <option value="Y">Y</option>
                <option value="Z">Z</option>
              </select>
            </label>
            <button
              type="button"
              className={`${calculatorSecondaryButtonClass} self-end text-xs`}
              disabled={!selectedKey}
              onClick={addSelected}
            >
              Add to chain
            </button>
          </div>

          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            {candidates.length === 0 ? (
              <p className="text-xs text-slate-500">No dimensions/FCFs on this extract.</p>
            ) : (
              candidates.map((c) => (
                <label
                  key={c.key}
                  className={`flex cursor-pointer items-start gap-2 rounded px-2 py-1 text-xs ${
                    selectedKey === c.key ? "bg-cyan-50 dark:bg-cyan-950/40" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="stack-candidate"
                    checked={selectedKey === c.key}
                    onChange={() => setSelectedKey(c.key)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-slate-500">
                      {c.kind}
                      {c.zone ? ` · zone ${c.zone}` : ""}
                      {c.sheet ? ` · sheet ${c.sheet}` : ""}
                      {" · ±"}
                      {fromBase(c.previewTolSi, "length", displayUnit).toPrecision(4)}{" "}
                      {displayUnit}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tolerance chain ({picks.length})
        </h4>
        {picks.length === 0 ? (
          <p className="text-xs text-slate-500">No contributors yet.</p>
        ) : (
          <ol className="space-y-1 text-xs">
            {picks.map((p, i) => (
              <li
                key={`${p.candidateKey}-${i}`}
                className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 dark:border-slate-700"
              >
                <span>
                  {i + 1}. {p.sense > 0 ? "+" : "−"}
                  {p.axis} · {p.partNumber} · {p.candidateKey.split(":").slice(2).join(":")}
                </span>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => removeAt(i)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={chainConfirmed}
          disabled={picks.length === 0}
          onChange={(e) => onConfirmChange(e.target.checked)}
        />
        I confirm this tolerance chain is correct (required before solve)
      </label>

      <button
        type="button"
        className={calculatorPrimaryButtonClass}
        disabled={!chainConfirmed || picks.length === 0}
        onClick={onSolve}
      >
        Solve confirmed stack
      </button>
    </div>
  );
}

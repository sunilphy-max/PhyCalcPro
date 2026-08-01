"use client";

import {
  calculatorSecondaryButtonClass,
  calculatorSelectClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import type { DrawingExtract } from "@/lib/manufacturing/gdt/types";
import {
  buildAnnotationLibrary,
  filterAnnotationLibrary,
  scorePartExtract,
  explainAnnotation,
  type AnnotationEntry,
  type AnnotationKind,
} from "@/lib/manufacturing/package";
import type { AssemblyNode } from "@/lib/manufacturing/package";
import { fromBase } from "@/lib/units/conversions";
import { useMemo, useState } from "react";

type Props = {
  tree: AssemblyNode[];
  extractsByPart: Record<string, DrawingExtract>;
  displayUnit: string;
  allowedPartNumbers?: string[] | null;
  onAddToStack?: (entry: AnnotationEntry) => void;
};

export default function AnnotationLibraryPanel({
  tree,
  extractsByPart,
  displayUnit,
  allowedPartNumbers,
  onAddToStack,
}: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<AnnotationKind | "all">("all");
  const [explainKey, setExplainKey] = useState<string | null>(null);

  const library = useMemo(
    () => buildAnnotationLibrary(extractsByPart, tree),
    [extractsByPart, tree]
  );

  const filtered = useMemo(
    () =>
      filterAnnotationLibrary(library, {
        query,
        partNumbers: allowedPartNumbers,
        kinds: kind === "all" ? undefined : [kind],
      }),
    [library, query, allowedPartNumbers, kind]
  );

  const qualities = useMemo(
    () =>
      Object.entries(extractsByPart).map(([pn, ex]) => scorePartExtract(pn, ex)),
    [extractsByPart]
  );

  const explainEntry = explainKey
    ? library.find((e) => e.key === explainKey)
    : undefined;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Annotation library
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          All extracted component (and SA/ASM) callouts. Search, review quality, then add to the
          active stack.
        </p>
      </div>

      {qualities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {qualities.map((q) => (
            <span
              key={q.partNumber}
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                q.ready
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              }`}
              title={q.issues.join("; ") || "OK"}
            >
              {q.partNumber}: {q.score}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Extract drawings under Structure to populate the library.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          className={calculatorTextInputClass}
          placeholder="Search PN, label, FCF…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={calculatorSelectClass}
          value={kind}
          onChange={(e) => setKind(e.target.value as AnnotationKind | "all")}
        >
          <option value="all">All kinds</option>
          <option value="dimension">Dimensions</option>
          <option value="fcf">FCFs</option>
          <option value="datum">Datums</option>
          <option value="fit">Fits</option>
          <option value="note">Notes</option>
        </select>
      </div>

      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700">
        {filtered.length === 0 ? (
          <li className="text-xs text-slate-500">No annotations match.</li>
        ) : (
          filtered.slice(0, 80).map((e) => (
            <li
              key={e.key}
              className="flex items-start gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-800 dark:text-slate-100">
                  {e.partNumber}: {e.label}
                </div>
                <div className="text-[10px] text-slate-500">
                  {e.kind}
                  {e.materialCondition ? ` · ${e.materialCondition}` : ""}
                  {e.previewTolSi > 0
                    ? ` · ±${fromBase(e.previewTolSi, "length", displayUnit).toPrecision(3)} ${displayUnit}`
                    : ""}
                  {e.sheet ? ` · S${e.sheet}` : ""}
                  {e.zone ? ` Z${e.zone}` : ""}
                  {!e.ready ? " · review" : ""}
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 text-[10px] text-cyan-700 hover:underline dark:text-cyan-400"
                onClick={() => setExplainKey(e.key)}
              >
                Explain
              </button>
              {onAddToStack && (e.kind === "dimension" || e.kind === "fcf") ? (
                <button
                  type="button"
                  className="shrink-0 text-[10px] font-medium text-slate-700 hover:underline dark:text-slate-200"
                  onClick={() => onAddToStack(e)}
                >
                  Add
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {explainEntry ? (
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">Explain</span>
            <button
              type="button"
              className={calculatorSecondaryButtonClass}
              style={{ width: "auto", padding: "2px 8px", fontSize: 11 }}
              onClick={() => setExplainKey(null)}
            >
              Close
            </button>
          </div>
          <p>{explainAnnotation(explainEntry, extractsByPart[explainEntry.partNumber])}</p>
        </div>
      ) : null}
    </div>
  );
}

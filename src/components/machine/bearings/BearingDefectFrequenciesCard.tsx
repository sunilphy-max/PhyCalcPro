"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** BPFO / BPFI / BSF / FTF defect frequencies. */
export default function BearingDefectFrequenciesCard({ result }: Props) {
  const d = result.defectFrequencies;
  if (!d) return null;

  const rows = [
    { label: "BPFO (outer)", hz: d.bpfoHz, order: d.bpfoOrder },
    { label: "BPFI (inner)", hz: d.bpfiHz, order: d.bpfiOrder },
    { label: "BSF (ball/roller spin)", hz: d.bsfHz, order: d.bsfOrder },
    { label: "FTF (cage / train)", hz: d.ftfHz, order: d.ftfOrder },
  ];

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-200">
        Defect frequencies
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Shaft {formatDisplayNumber(d.shaftHz)} Hz · Z ≈ {d.rollingElementCount}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-white/70 px-2.5 py-2 dark:bg-slate-950/40">
            <p className="text-[10px] font-medium text-slate-500">{row.label}</p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDisplayNumber(row.hz)} Hz
            </p>
            <p className="text-[10px] text-slate-400">{formatDisplayNumber(row.order)} × shaft</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{d.note}</p>
    </div>
  );
}

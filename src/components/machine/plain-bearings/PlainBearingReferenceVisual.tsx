"use client";

import type { PlainBearingType } from "@/lib/machine/plain-bearings/types";
import PlainBearingCrossSectionSvg from "@/components/machine/plain-bearings/PlainBearingCrossSectionSvg";

const TYPE_LABELS: Record<PlainBearingType, string> = {
  journal: "Journal (radial) — ISO 7902",
  thrust_pad: "Thrust pad (flat) — ISO 12131",
  tilting_pad: "Tilting-pad thrust — ISO 12130",
};

const TYPE_HINTS: Record<PlainBearingType, string> = {
  journal: "Primary load: radial Fr through the oil film (⊥ shaft axis)",
  thrust_pad: "Primary load: axial Fa across flat pad faces",
  tilting_pad: "Primary load: axial Fa — pads tilt to form wedge films",
};

type Props = {
  bearingType: PlainBearingType;
  compact?: boolean;
};

export default function PlainBearingReferenceVisual({ bearingType, compact = false }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-950 dark:to-teal-950/20 ${
        compact ? "p-3" : "p-4 md:p-5"
      }`}
    >
      <div
        className={`flex gap-4 ${compact ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-start"}`}
      >
        <div className="shrink-0 rounded-xl border border-slate-200/60 bg-white p-2 shadow-sm dark:border-slate-700/50 dark:bg-slate-950/50">
          <PlainBearingCrossSectionSvg
            type={bearingType}
            width={compact ? 150 : 180}
            height={compact ? 108 : 128}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`font-semibold text-slate-900 dark:text-white ${compact ? "text-sm" : "text-base"}`}
          >
            {TYPE_LABELS[bearingType]}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Hydrodynamic film screening — Sommerfeld / wedge / specific-pressure checks
          </p>
          <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
            {TYPE_HINTS[bearingType]}
          </p>
        </div>
      </div>
    </div>
  );
}

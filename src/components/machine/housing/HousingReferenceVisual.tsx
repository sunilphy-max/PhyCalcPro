"use client";

import type { HousingMountStyle } from "@/lib/machine/housing/types";
import HousingCrossSectionSvg from "@/components/machine/housing/HousingCrossSectionSvg";

const STYLE_LABELS: Record<HousingMountStyle, string> = {
  pillow_block: "Pillow block",
  flange: "Flange housing",
  foot: "Foot mount",
};

const STYLE_HINTS: Record<HousingMountStyle, string> = {
  pillow_block: "Two-bolt base — common on shaft lines and conveyors",
  flange: "Face-mounted circular / square flange — vertical or wall mount",
  foot: "Integral feet / sole plate — heavier industrial frames",
};

type Props = {
  mountStyle: HousingMountStyle;
  compact?: boolean;
};

export default function HousingReferenceVisual({ mountStyle, compact = false }: Props) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/20 ${
        compact ? "p-3" : "p-4 md:p-5"
      }`}
    >
      <div
        className={`flex gap-4 ${compact ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-start"}`}
      >
        <div className="shrink-0 rounded-xl border border-slate-200/60 bg-white p-2 shadow-sm dark:border-slate-700/50 dark:bg-slate-950/50">
          <HousingCrossSectionSvg
            mountStyle={mountStyle}
            width={compact ? 150 : 180}
            height={compact ? 108 : 128}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`font-semibold text-slate-900 dark:text-white ${compact ? "text-sm" : "text-base"}`}
          >
            {STYLE_LABELS[mountStyle]}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Body bending + mounting-bolt tension / shear screening
          </p>
          <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
            {STYLE_HINTS[mountStyle]}
          </p>
        </div>
      </div>
    </div>
  );
}

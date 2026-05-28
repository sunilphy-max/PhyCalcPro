"use client";

import type { SupportType } from "@/lib/dynamics/vibrations/types";

type Props = {
  length: number;
  segments: number;
  support: SupportType;
};

function supportLabel(support: SupportType): string {
  if (support === "cantilever") return "Fixed-Free";
  if (support === "fixed_fixed") return "Fixed-Fixed";
  return "Pinned-Pinned";
}

export default function VibrationInputSchematic({ length, segments, support }: Props) {
  const marks = Array.from({ length: Math.max(2, Math.min(segments + 1, 50)) });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Model Schematic</h3>
      <p className="mt-1 text-xs text-slate-500">
        {supportLabel(support)} beam, length {length.toFixed(2)} m, {segments} elements.
      </p>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="relative h-10 rounded bg-gradient-to-r from-slate-900 to-slate-600">
          <div
            className="absolute inset-0 grid items-center"
            style={{ gridTemplateColumns: `repeat(${marks.length}, minmax(0, 1fr))` }}
          >
            {marks.map((_, index) => (
              <div key={index} className="mx-auto h-6 w-px bg-white/35" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

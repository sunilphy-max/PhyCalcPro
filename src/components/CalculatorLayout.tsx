"use client";

import { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  title: string;
};

export default function CalculatorLayout({
  left,
  center,
  right,
  title,
}: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.1),transparent_35%),#f8fafc] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Engineering module</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              <span>Modern performance view</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_1fr_1.4fr]">
          <div className="space-y-4">{left}</div>
          <div className="space-y-4">{center}</div>
          <div className="space-y-4">{right}</div>
        </div>
      </div>
    </div>
  );
}
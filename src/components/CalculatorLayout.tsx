"use client";

import { ReactNode } from "react";
import DesignCodeSelector from "@/components/shared/DesignCodeSelector";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";

type Props = {
  left?: ReactNode;
  center: ReactNode;
  right: ReactNode;
  title: string;
  footer?: ReactNode;
  moduleId?: string;
};

export default function CalculatorLayout({
  left,
  center,
  right,
  title,
  footer,
  moduleId,
}: Props) {
  const profile = moduleId ? getModuleStandardProfile(moduleId) : undefined;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.1),transparent_35%),#f8fafc] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Engineering module</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
              {profile ? (
                <p className="mt-2 text-sm text-slate-500 capitalize">
                  Validation status: {profile.validationStatus}
                </p>
              ) : null}
            </div>
            {moduleId ? (
              <div className="w-full max-w-xs shrink-0">
                <DesignCodeSelector moduleId={moduleId} />
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 ${
            left ? "xl:grid-cols-[280px_1fr_1.4fr]" : "xl:grid-cols-[1fr_1.4fr]"
          }`}
        >
          {left ? <div className="space-y-4">{left}</div> : null}
          <div className="space-y-4">{center}</div>
          <div className="space-y-4">{right}</div>
        </div>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
    </div>
  );
}
"use client";

import {
  checklistScore,
  moduleChecklistItems,
  type ModuleQualityChecklist,
} from "@/lib/calculation/standards";

type Props = {
  title: string;
  checklist: ModuleQualityChecklist;
};

export default function CalculationQualityChecklist({ title, checklist }: Props) {
  const score = checklistScore(checklist);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
          {score}%
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {moduleChecklistItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <span
              className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                checklist[item.key]
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {checklist[item.key] ? "OK" : "Todo"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

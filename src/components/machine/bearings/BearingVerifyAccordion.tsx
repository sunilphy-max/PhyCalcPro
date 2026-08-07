"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { DashboardTone } from "@/lib/machine/bearings/bearingDecisionDashboard";

export type VerifySection = {
  id: string;
  title: string;
  tone: DashboardTone;
  summary: string;
  content: ReactNode;
};

type Props = {
  sections: VerifySection[];
};

const TONE_DOT: Record<DashboardTone, string> = {
  safe: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-slate-400",
};

function defaultOpenIds(sections: VerifySection[]): Set<string> {
  const open = new Set<string>();
  for (const s of sections) {
    if (s.tone === "critical" || s.tone === "warning") open.add(s.id);
  }
  if (open.size === 0 && sections[0]) open.add(sections[0].id);
  return open;
}

export default function BearingVerifyAccordion({ sections }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => defaultOpenIds(sections));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Verify checks</p>
        <p className="text-[11px] text-slate-500">
          Failed / marginal sections open by default · verdict is in the Decision Strip above
        </p>
      </div>
      <div className="space-y-2">
        {sections.map((section) => {
          const open = openIds.has(section.id);
          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <button
                type="button"
                onClick={() => toggle(section.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[section.tone]}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {section.title}
                  </span>
                  <span className="block text-[11px] text-slate-500">{section.summary}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open ? (
                <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-700">
                  {section.content}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

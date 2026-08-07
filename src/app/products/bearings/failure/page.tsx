"use client";

import { useState } from "react";
import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import { bearingFailureModes } from "@/data/bearings/failureModes";

export default function BearingFailurePage() {
  const [activeId, setActiveId] = useState(bearingFailureModes[0]!.id);
  const active = bearingFailureModes.find((m) => m.id === activeId) ?? bearingFailureModes[0]!;

  return (
    <BearingSuiteChrome>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Bearing failure analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Mode → probable causes → corrective actions for engineers and maintenance teams.
            Screening guidance — not a substitute for metallurgical failure investigation.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {bearingFailureModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveId(mode.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                activeId === mode.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{active.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{active.summary}</p>

          <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">
            Probable causes
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {active.probableCauses.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">
            Corrective actions
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {active.correctiveActions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-slate-500">
            References: {active.references.join(" · ")}
          </p>
        </article>

        <p className="text-sm text-slate-500">
          Related:{" "}
          <Link
            href="/products/bearings/designer?intent=service&mode=diagnose&panel=verify"
            className="text-cyan-700 underline dark:text-cyan-400"
          >
            Open in Designer (Diagnose)
          </Link>
          {" · "}
          <Link href="/products/bearings/database" className="text-cyan-700 underline dark:text-cyan-400">
            Database
          </Link>
        </p>
      </div>
    </BearingSuiteChrome>
  );
}

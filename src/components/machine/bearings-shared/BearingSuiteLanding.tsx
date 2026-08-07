"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitCompare,
  Ruler,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import { BEARING_SUITE_STANDARDS } from "@/lib/machine/bearings/bearingSuiteNav";
import {
  BEARING_SIBLING_PATHS,
  BEARING_START_MODE_CARDS,
  type BearingStartModeId,
} from "@/lib/machine/bearings/bearingProductSelect";

const MODE_ICONS: Record<BearingStartModeId, LucideIcon> = {
  design: Ruler,
  check: CheckCircle2,
  select: GitCompare,
  diagnose: Stethoscope,
};

const ACCENT: Record<
  (typeof BEARING_START_MODE_CARDS)[number]["accent"],
  { card: string; icon: string; badge: string }
> = {
  cyan: {
    card: "hover:border-cyan-400 hover:shadow-cyan-100/80 dark:hover:border-cyan-600",
    icon: "bg-cyan-600 text-white",
    badge: "text-cyan-700 dark:text-cyan-300",
  },
  emerald: {
    card: "hover:border-emerald-400 hover:shadow-emerald-100/80 dark:hover:border-emerald-600",
    icon: "bg-emerald-600 text-white",
    badge: "text-emerald-700 dark:text-emerald-300",
  },
  violet: {
    card: "hover:border-violet-400 hover:shadow-violet-100/80 dark:hover:border-violet-600",
    icon: "bg-violet-600 text-white",
    badge: "text-violet-700 dark:text-violet-300",
  },
  amber: {
    card: "hover:border-amber-400 hover:shadow-amber-100/80 dark:hover:border-amber-600",
    icon: "bg-amber-600 text-white",
    badge: "text-amber-800 dark:text-amber-300",
  },
};

/**
 * Start page for the Bearing Engineering Suite.
 * Job cards open Designer; Assistants prefill; siblings stay separate.
 */
export default function BearingSuiteLanding() {
  return (
    <BearingSuiteChrome subtitle="Pick a job — then work in the System Designer.">
      <div className="space-y-12 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
            Bearing Engineering Suite
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Select and evaluate rolling bearings
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Choose Auto-design, Validate, Compare, or Diagnose. Assistants prefill duty for common
            machines; Copilot advises inside the Designer.
          </p>
        </header>

        <section aria-labelledby="bearing-start-modes">
          <div className="mb-4">
            <h2
              id="bearing-start-modes"
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              How do you want to work?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Opens the Designer with the matching job and stage.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BEARING_START_MODE_CARDS.map((mode) => {
              const Icon = MODE_ICONS[mode.id];
              const accent = ACCENT[mode.accent];
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 ${accent.card}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold uppercase tracking-wide ${accent.badge}`}>
                        {mode.label}
                      </p>
                      <p className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
                        {mode.outcome}
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500">{mode.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-600 dark:text-slate-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="bearing-assistants-cta"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="bearing-assistants-cta"
                className="text-base font-semibold text-slate-950 dark:text-white"
              >
                Prefer a machine-guided path?
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Assistants prefill duty and arrangement for motors, pumps, fans, gearboxes, and more
                — then open the Designer.
              </p>
            </div>
            <Link
              href="/products/bearings/assistant"
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Open Assistants
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section aria-labelledby="bearing-sibling-tools">
          <h2
            id="bearing-sibling-tools"
            className="text-lg font-semibold text-slate-950 dark:text-white"
          >
            Related tools
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Catalog browse and sibling physics — not Designer stages.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BEARING_SIBLING_PATHS.map((path) => (
              <Link
                key={path.id}
                href={path.href}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 transition hover:border-cyan-300 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{path.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{path.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="bearing-standards">
          <h2
            id="bearing-standards"
            className="text-lg font-semibold text-slate-950 dark:text-white"
          >
            Standards
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {BEARING_SUITE_STANDARDS.map((std) => (
              <li key={std.id}>
                <Link
                  href={std.href}
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{std.code}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{std.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </BearingSuiteChrome>
  );
}

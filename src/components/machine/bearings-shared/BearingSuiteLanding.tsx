"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Fan,
  GitCompare,
  Cog,
  Ruler,
  Stethoscope,
  Zap,
  Droplets,
  Package,
  Crosshair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import {
  BEARING_SUITE_EXAMPLES,
  BEARING_SUITE_STANDARDS,
} from "@/lib/machine/bearings/bearingSuiteNav";
import { SKF_SELECTION_PROCESS_STEPS } from "@/lib/machine/bearings/bearingProject";
import {
  BEARING_QUICK_PATHS,
  BEARING_START_MODE_CARDS,
  type BearingStartModeId,
} from "@/lib/machine/bearings/bearingProductSelect";
import {
  bearingAssistantHubCards,
  type BearingAssistantId,
} from "@/lib/machine/bearings/bearingApplicationAssistants";

const MODE_ICONS: Record<BearingStartModeId, LucideIcon> = {
  design: Ruler,
  check: CheckCircle2,
  select: GitCompare,
  diagnose: Stethoscope,
};

const ASSISTANT_ICONS: Record<BearingAssistantId, LucideIcon> = {
  motor: Zap,
  pump: Droplets,
  fan: Fan,
  gearbox: Cog,
  conveyor: Package,
  ballscrew: Crosshair,
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
 * Product Select–style start page for the Bearing suite.
 * Inspired by SKF Product select start → single-bearing calculator flow.
 */
export default function BearingSuiteLanding() {
  return (
    <BearingSuiteChrome subtitle="Choose how you want to work — then open the single-bearing / system calculator.">
      <div className="space-y-12 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
            Bearing Product Select
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Select and evaluate rolling bearings
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Start with the right workflow — Auto-design, Validate, Compare, or Diagnose — then size
            or check bearings with ISO 281 / ISO 76 screening. Confirm critical duty with OEM tools.
          </p>
        </header>

        <section aria-labelledby="bearing-start-modes">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="bearing-start-modes"
                className="text-lg font-semibold text-slate-950 dark:text-white"
              >
                How do you want to work?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Same four modes as every PhyCalcPro calculator — picked before you enter the tool.
              </p>
            </div>
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

        <section aria-labelledby="bearing-assistants">
          <div className="mb-4">
            <h2
              id="bearing-assistants"
              className="text-lg font-semibold text-slate-950 dark:text-white"
            >
              Selection assistants
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Machine-guided paths — like Product Select&apos;s bearing selection assistant for
              motors. Answer a few questions, then open the calculator with duty and arrangement
              filled in.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bearingAssistantHubCards().map((card) => {
              const Icon = ASSISTANT_ICONS[card.id];
              return (
                <Link
                  key={card.id}
                  href={card.formHref}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-600"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white dark:bg-cyan-800">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {card.label}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-cyan-800 dark:text-cyan-300">
                        {card.outcome}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{card.blurb}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="bearing-quick-paths">
          <h2
            id="bearing-quick-paths"
            className="text-lg font-semibold text-slate-950 dark:text-white"
          >
            What do you want to calculate?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump straight into a calculator surface — similar to Product Select product areas.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {BEARING_QUICK_PATHS.map((path) => (
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

        <section aria-labelledby="bearing-skf-process">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                id="bearing-skf-process"
                className="text-lg font-semibold text-slate-950 dark:text-white"
              >
                Selection process
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Eight SKF steps — opened inside Designer after you pick a mode.
              </p>
            </div>
            <a
              href="https://www.skf.com/us/products/rolling-bearings/principles-of-rolling-bearing-selection/bearing-selection-process"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              SKF process guide →
            </a>
          </div>
          <ol className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {SKF_SELECTION_PROCESS_STEPS.map((step) => (
              <li key={step.step} className="min-w-[9.5rem] flex-1">
                <Link
                  href={`${step.href}&mode=check`}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                    {step.step}
                  </span>
                  <span className="mt-0.5 text-xs font-semibold leading-snug text-slate-900 dark:text-white">
                    {step.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Worked examples</h2>
            <ul className="mt-3 space-y-2">
              {BEARING_SUITE_EXAMPLES.map((ex) => (
                <li key={ex.id}>
                  <Link
                    href={ex.href}
                    className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{ex.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{ex.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Standards</h2>
            <ul className="mt-3 space-y-2">
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
          </div>
        </section>
      </div>
    </BearingSuiteChrome>
  );
}

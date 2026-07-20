"use client";

import Link from "next/link";
import { allModules, categories } from "@/data/modules";
import EngineeringPlot from "@/components/EngineeringPlot";
import HomeSignInPanel from "@/components/home/HomeSignInPanel";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Mail,
  ShieldCheck,
  Wrench,
  Box,
  Orbit,
  Flame,
  Database,
  Gauge,
  CircleDot,
} from "lucide-react";
import { isFreeLaunch } from "@/lib/licensing/validationMode";
import {
  buildModuleGateSummaries,
  releaseTierLabel,
} from "@/lib/qa/maturityGates";
import { getBenchmarkStatsFromLastRun, getLastVerificationReport } from "@/lib/qa/lastRun";
import { supportedBenchmarkModules } from "@/lib/qa/benchmarkRunner";
import type { ReleaseTier } from "@/lib/qa/types";

const spanM = 4;
const demoX = Array.from({ length: 41 }, (_, index) => (index / 40) * spanM);
const demoY = demoX.map((x) => (-4 * x * (spanM - x)) / (spanM * spanM));

const featuredWorkflowIds = [
  "beams",
  "columns",
  "shafts",
  "gears",
  "bearings",
  "compression-springs",
];

const applicationCards = [
  {
    title: "Mechanical design",
    description: "Shafts, gears, bearings, flywheels, brakes, and power transmission.",
    href: "/products/machine/shafts",
    icon: Wrench,
  },
  {
    title: "Industrial structures",
    description: "Beams, frames, trusses, plates, columns, and combined loading.",
    href: "/products/structural/beams",
    icon: Box,
  },
  {
    title: "Advanced systems",
    description: "Vacuum, cryogenic, magnetic, thermal, battery, and hydrogen screening.",
    href: "/products/advanced-systems/vacuum-engineering",
    icon: Orbit,
  },
  {
    title: "Energy and thermal",
    description: "Heat transfer, battery cooling, hydrogen storage, and pressure helpers.",
    href: "/products/advanced-systems/thermal-management",
    icon: Flame,
  },
  {
    title: "Materials and fatigue",
    description: "Material data, sections, temperature effects, corrosion, and fatigue.",
    href: "/products/materials/fatigue",
    icon: Database,
  },
  {
    title: "Manufacturing",
    description: "Tolerances, fits, cost estimates, and process planning.",
    href: "/products/manufacturing/tolerance",
    icon: Gauge,
  },
];

const platformPillars = [
  {
    title: "Standards-aware calculations",
    description:
      "Design-code selectors, unit handling, and explicit notes on what each standard check covers.",
    icon: Layers,
  },
  {
    title: "Assumption-backed reports",
    description:
      "Results travel with warnings, reference metadata, and export-ready summaries.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent maturity",
    description:
      "Release tiers and CI benchmarks are published. β modules stay labeled until verified.",
    icon: BookOpen,
  },
];

function getCategoryRoute(category: (typeof categories)[number]) {
  return category.modules.find((module) => !module.comingSoon)?.route ?? "/products";
}

function ModulePreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Beam screening</p>
          <p className="text-xs text-slate-500">Simply supported · uniform load</p>
        </div>
        <span className="text-xs font-medium text-slate-500">AISC · W12×26</span>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
        <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div>
            <dt className="text-xs text-slate-500">Bending stress</dt>
            <dd className="mt-0.5 text-xl font-semibold text-emerald-700 dark:text-emerald-400">142 MPa</dd>
            <dd className="text-xs text-slate-500">Utilization 0.71</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Max deflection</dt>
            <dd className="mt-0.5 text-xl font-semibold text-slate-950 dark:text-white">8.4 mm</dd>
            <dd className="text-xs text-slate-500">L/476 · limit L/360</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Reaction</dt>
            <dd className="mt-0.5 text-xl font-semibold text-slate-950 dark:text-white">24.5 kN</dd>
            <dd className="text-xs text-slate-500">Each support</dd>
          </div>
        </dl>

        <div className="min-h-[12rem]">
          <EngineeringPlot
            title="Deflection"
            x={demoX}
            y={demoY}
            yLabel="Deflection"
            xLabel="Position"
            xUnit="m"
            unitLabel="mm"
          />
        </div>
      </div>
    </div>
  );
}

const releaseTiers: ReleaseTier[] = ["certified", "verified", "beta", "indicative", "draft"];

export default function HomePageClient() {
  const availableModules = allModules.filter((module) => !module.comingSoon);
  const moduleCount = availableModules.length;
  const moduleById = new Map(availableModules.map((module) => [module.id, module]));
  const featuredWorkflows = featuredWorkflowIds
    .map((id) => moduleById.get(id))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));

  const benchmarkStats = getBenchmarkStatsFromLastRun();
  const gateSummaries = buildModuleGateSummaries(benchmarkStats);
  const lastVerification = getLastVerificationReport();
  const ciModuleCount = supportedBenchmarkModules().length;
  const tierCounts = releaseTiers.reduce(
    (acc, tier) => {
      acc[tier] = gateSummaries.filter((row) => row.releaseTier === tier).length;
      return acc;
    },
    {} as Record<ReleaseTier, number>
  );
  const benchmarkModuleCount = Object.keys(benchmarkStats).filter(
    (moduleId) => benchmarkStats[moduleId].total > 0
  ).length;

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                PhyCalcPro
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Engineering calculations you can document.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                Size members, screen systems, and check utilization with standards context,
                explicit assumptions, and exportable reports.
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/documentation"
                  className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                  Documentation
                </Link>
                <Link
                  href="/trust"
                  className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-950 hover:underline dark:text-slate-400 dark:hover:text-white"
                >
                  Trust
                </Link>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isFreeLaunch()
                  ? `Early access · ${moduleCount} modules · all standards · PDF/CSV export`
                  : `${moduleCount} modules across ${categories.length} disciplines`}
              </p>
            </div>

            <ModulePreview />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                Start from what you are designing
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Route by job type — mechanical hardware, structures, materials, or manufacturing.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Full catalog
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {applicationCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-6 dark:border-slate-800">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Frequently used
            </span>
            {featuredWorkflows.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.route}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  {ModuleIcon ? <ModuleIcon className="h-3.5 w-3.5 opacity-60" /> : <CircleDot className="h-3.5 w-3.5 opacity-60" />}
                  {module.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Browse by discipline
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => {
              const liveCount = category.modules.filter((module) => !module.comingSoon).length;
              return (
                <Link
                  key={category.id}
                  href={getCategoryRoute(category)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <span className="font-medium text-slate-900 dark:text-white">{category.title}</span>
                  <span className="text-xs text-slate-500">{liveCount}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
                Built for engineers who show their work
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                We do not claim automatic code compliance. Each module states what it checks,
                what it omits, and its verification status.
              </p>
              <ul className="mt-6 space-y-4">
                {platformPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <li key={pillar.title} className="flex gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{pillar.title}</p>
                        <p className="mt-0.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {pillar.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/trust"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                >
                  Trust & responsibility
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Support
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Quality snapshot
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Published verification and release tiers</p>
                </div>
                <Link
                  href="/status"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  Dashboard
                </Link>
              </div>

              {lastVerification ? (
                <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
                  Last CI: {lastVerification.passed}/{lastVerification.total} cases passed
                  <span className="text-slate-500 dark:text-slate-400">
                    {" "}
                    ·{" "}
                    {new Date(lastVerification.ranAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </p>
              ) : (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
                  No committed verification report yet.
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Modules in CI</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">
                    {ciModuleCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">With benchmarks</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">
                    {benchmarkModuleCount}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {releaseTiers.map((tier) => (
                  <span
                    key={tier}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                  >
                    <span className="text-slate-500">{releaseTierLabel(tier)}</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {tierCounts[tier] ?? 0}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isFreeLaunch() ? (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
              <h2 className="text-center text-lg font-semibold text-slate-950 dark:text-white">
                Optional account sync
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                Browse as guest, or sign in to keep calculation history across sessions.
              </p>
              <div className="mt-6">
                <HomeSignInPanel />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

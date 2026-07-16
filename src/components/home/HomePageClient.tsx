"use client";

import Link from "next/link";
import { allModules, categories } from "@/data/modules";
import EngineeringPlot from "@/components/EngineeringPlot";
import SiteFooter from "@/components/SiteFooter";
import HomeSignInPanel from "@/components/home/HomeSignInPanel";
import WorkflowDataFlow from "@/components/home/WorkflowDataFlow";
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

const designStandards = ["AISC", "ASME", "AGMA", "EN", "ISO"];

const featuredWorkflowIds = [
  "beams",
  "shafts",
  "vacuum-engineering",
  "cryogenic-engineering",
  "magnetic-fields",
  "battery-ev-systems",
];

const applicationCards = [
  {
    title: "Mechanical design",
    description: "Shafts, gears, bearings, flywheels, brakes, clutches, and power transmission.",
    href: "/products/machine/shafts",
    icon: Wrench,
  },
  {
    title: "Industrial structures",
    description: "Beams, frames, trusses, plates, columns, and combined loading checks.",
    href: "/products/structural/beams",
    icon: Box,
  },
  {
    title: "Advanced systems",
    description: "Vacuum, cryogenic, magnetic, superconducting, thermal, battery, and hydrogen screening.",
    href: "/products/advanced-systems/vacuum-engineering",
    icon: Orbit,
  },
  {
    title: "Energy and thermal",
    description: "Heat transfer, battery cooling, hydrogen storage, and pressure-system helpers.",
    href: "/products/advanced-systems/thermal-management",
    icon: Flame,
  },
  {
    title: "Materials and fatigue",
    description: "Material data, section properties, temperature effects, corrosion, and fatigue.",
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
      "Modules expose design-code selectors, unit handling, and explicit notes on what is — and is not — implemented for each standard.",
    icon: Layers,
  },
  {
    title: "Assumption-backed reports",
    description:
      "Results travel with warnings, reference metadata, and export-ready summaries so you can explain the calculation later.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent module maturity",
    description:
      "Release tiers and automated benchmarks are published on the quality dashboard. β modules are labeled until independently verified.",
    icon: BookOpen,
  },
];

function getCategoryRoute(category: (typeof categories)[number]) {
  return category.modules.find((module) => !module.comingSoon)?.route ?? "/products";
}

function ModulePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Beam module</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              Simply supported — uniform load
            </h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            AISC · W12×26
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bending stress</p>
            <p className="mt-1 text-2xl font-semibold text-green-700 dark:text-green-400">142 MPa</p>
            <p className="mt-1 text-xs text-slate-500">Utilization 0.71</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Max deflection</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">8.4 mm</p>
            <p className="mt-1 text-xs text-slate-500">L/476 · limit L/360</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reaction</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">24.5 kN</p>
            <p className="mt-1 text-xs text-slate-500">Each support</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
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

      <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Assumptions listed · PDF export available</span>
          <span className="font-medium text-amber-700 dark:text-amber-400">β — verify against your worksheet</span>
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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Design-assist for practicing engineers
              </p>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                  Mechanical and structural calculations you can document.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  Size members, screen advanced systems, and check utilization — with standards
                  context, explicit assumptions, and exportable reports. PhyCalcPro is a workspace,
                  not a black-box solver.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {designStandards.map((standard) => (
                  <span
                    key={standard}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {standard}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/documentation"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  Documentation
                </Link>
                <Link
                  href="/trust"
                  className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  Trust & responsibility
                </Link>
              </div>

              {isFreeLaunch() ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Early access: {moduleCount} modules, all design standards, PDF/CSV export — browse as Guest, or sign in to sync history.
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {moduleCount} engineering modules across {categories.length} disciplines.
                </p>
              )}

              <HomeSignInPanel />
            </div>

            <ModulePreview />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
              From inputs to a reviewable result
            </h2>
          </div>

          <WorkflowDataFlow />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                By application
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
                Start from what you are designing
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Route by discipline and job type — mechanical hardware, industrial structures,
              advanced systems, materials, or manufacturing — rather than hunting for a formula.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applicationCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-white">
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Featured modules
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
                Frequently used calculators
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Full catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWorkflows.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.route}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    {ModuleIcon ? <ModuleIcon className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{module.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{module.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Catalog
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
                Browse by engineering discipline
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              {moduleCount} modules with unit handling, standards metadata, and exportable results.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryRoute = getCategoryRoute(category);
              const liveCount = category.modules.filter((module) => !module.comingSoon).length;
              return (
                <Link
                  key={category.id}
                  href={categoryRoute}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{category.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{category.description}</p>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{liveCount} modules</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Who builds this
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
                A small, engineering-focused team
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                PhyCalcPro is built and maintained by practicing engineers who use these workflows
                daily. We prioritize transparent methods, readable outputs, and honest maturity labels
                over marketing claims. If a result looks wrong or a standard check is missing, we
                want to hear about it — with your worksheet, units, and design code.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Contributors can submit benchmark cases through our verification program. Accepted
                comparisons help modules move from β to verified on the quality dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  Contact support
                </Link>
                <Link
                  href="/trust"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  Trust & responsibility
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Published quality data
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    Verification and release tiers
                  </h3>
                </div>
                <Link
                  href="/status"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  Full dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {lastVerification ? (
                <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
                  Last CI verification: {lastVerification.passed}/{lastVerification.total} benchmark
                  cases passed
                  <span className="text-slate-500 dark:text-slate-400">
                    {" "}
                    · {new Date(lastVerification.ranAt).toLocaleDateString(undefined, {
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

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Modules in CI
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {ciModuleCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Automated regression solvers</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    With benchmarks
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                    {benchmarkModuleCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Cases in last-run report</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {releaseTiers.map((tier) => (
                  <div
                    key={tier}
                    className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <p className="text-xs text-slate-500">{releaseTierLabel(tier)}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                      {tierCounts[tier] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Why PhyCalcPro</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Built for engineers who need to show their work
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                We do not claim automatic code compliance. Each module states what it checks,
                what it omits, and its verification status. Review the{" "}
                <Link href="/trust" className="underline underline-offset-2 hover:text-white">
                  trust page
                </Link>{" "}
                and{" "}
                <Link href="/status" className="underline underline-offset-2 hover:text-white">
                  quality dashboard
                </Link>{" "}
                before relying on results for project work.
              </p>
            </div>

            <div className="grid gap-3">
              {platformPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-slate-700/80 p-2.5 text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pillar.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-300">{pillar.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-700 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Questions about methods or verification? We read every message.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-slate-500"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

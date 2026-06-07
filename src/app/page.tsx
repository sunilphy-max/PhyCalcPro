"use client";

import Link from "next/link";
import { allModules, categories } from "@/data/modules";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  BarChart3,
  Box,
  CircleDot,
  Database,
  Flame,
  Gauge,
  Layers,
  Magnet,
  Orbit,
  Wrench,
  Zap,
} from "lucide-react";
import { isFreeLaunch } from "@/lib/licensing/validationMode";

const demoX = Array.from({ length: 21 }, (_, index) => index * 0.2);
const demoY = demoX.map((value) => Math.sin(value * 1.3) * 0.15 - 0.1 * value + 0.12);

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
    description: "Shafts, gears, bearings, flywheels, brakes, clutches and motion hardware.",
    href: "/products/machine/shafts",
    icon: Wrench,
  },
  {
    title: "Industrial structures",
    description: "Beams, frames, trusses, plates, columns and application-based beam presets.",
    href: "/products/structural/beams",
    icon: Box,
  },
  {
    title: "Advanced systems",
    description: "Vacuum, cryogenic, magnetic, superconducting, thermal, battery and hydrogen tools.",
    href: "/products/advanced-systems/vacuum-engineering",
    icon: Orbit,
  },
  {
    title: "Energy and thermal",
    description: "Heat transfer, battery cooling, hydrogen storage and pressure-system screening.",
    href: "/products/advanced-systems/thermal-management",
    icon: Flame,
  },
  {
    title: "Materials and fatigue",
    description: "Material data, section properties, temperature effects, corrosion and fatigue checks.",
    href: "/products/materials/fatigue",
    icon: Database,
  },
  {
    title: "Manufacturing",
    description: "Tolerances, fits, cost estimates and process planning helpers.",
    href: "/products/manufacturing/tolerance",
    icon: Gauge,
  },
];

const platformPillars = [
  {
    title: "Application-aware calculations",
    description: "Beam presets now adapt loads, stress limits, deflection targets and notes to the job.",
    icon: Layers,
  },
  {
    title: "Reference-backed reports",
    description: "Results include assumptions, warnings, standards context and export-ready summaries.",
    icon: ShieldCheck,
  },
  {
    title: "Advanced systems coverage",
    description: "Screen vacuum, cryogenic, magnetic, superconducting, thermal, battery and hydrogen systems.",
    icon: Zap,
  },
];

function getCategoryRoute(category: (typeof categories)[number]) {
  return category.modules.find((module) => !module.comingSoon)?.route ?? "/products";
}

function WorkstationPreview() {
  const previewMetrics = [
    { label: "Beam preset", value: "Lifting beam", tone: "text-cyan-300" },
    { label: "Vacuum force", value: "4.05 kN", tone: "text-emerald-300" },
    { label: "Coil energy", value: "625 J", tone: "text-fuchsia-300" },
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_35px_80px_-35px_rgba(15,23,42,0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Engineering workstation</p>
          <h2 className="mt-2 text-xl font-semibold">Multi-domain calculation review</h2>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          Export ready
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {previewMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <EngineeringPlot
            title="Response envelope"
            x={demoX}
            y={demoY}
            yLabel="Response"
            xLabel="Position"
            xUnit="m"
            unitLabel="mm"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Vacuum", icon: CircleDot },
          { label: "Cryogenic", icon: Activity },
          { label: "Magnetic", icon: Magnet },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <Icon className="h-4 w-4 text-cyan-300" />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const availableModules = allModules.filter((module) => !module.comingSoon);
  const moduleCount = availableModules.length;
  const advancedCategory = categories.find((category) => category.id === "advanced-systems");
  const advancedCount = advancedCategory?.modules.filter((module) => !module.comingSoon).length ?? 0;
  const moduleById = new Map(availableModules.map((module) => [module.id, module]));
  const featuredWorkflows = featuredWorkflowIds
    .map((id) => moduleById.get(id))
    .filter((module): module is NonNullable<typeof module> => Boolean(module));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_top_right,_rgba(217,70,239,0.10),transparent_30%),#f8fafc]">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                <BarChart3 className="h-4 w-4 text-slate-900" />
                Mechanical, industrial and advanced systems
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">PhyCalcPro engineering workspace</p>
                  <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                    Size, check and select engineering designs in one workspace.
                  </h1>
                </div>

                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  Move from targets to sized members and drives—not just forward calculations. Compare catalog
                  candidates, verify stress and deflection or buckling margin, and export assumption-backed
                  reports across structures, machines, power transmission and advanced systems.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="text-3xl font-semibold text-slate-950">{moduleCount}</div>
                    <p className="mt-1 text-sm text-slate-600">active calculators</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="text-3xl font-semibold text-slate-950">{categories.length}</div>
                    <p className="mt-1 text-sm text-slate-600">engineering categories</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="text-3xl font-semibold text-slate-950">{advancedCount}</div>
                    <p className="mt-1 text-sm text-slate-600">advanced systems tools</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Open design workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products/advanced-systems/vacuum-engineering"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                >
                  Open Advanced Systems
                  <Orbit className="h-4 w-4" />
                </Link>
                <Link
                  href={isFreeLaunch() ? "/documentation" : "/pricing"}
                  className="inline-flex items-center justify-center rounded-full border border-transparent px-2 py-3 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                  {isFreeLaunch() ? "Read docs" : "View pricing"}
                </Link>
              </div>
              {isFreeLaunch() ? (
                <p className="text-sm text-slate-600">
                  Early access: design/check/select workflows, {moduleCount} engineering modules,
                  standards metadata, PDF/CSV export and no signup required.
                </p>
              ) : null}
            </div>

            <WorkstationPreview />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Start by application</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Find the right engineering workflow faster.
              </h2>
            </div>
            <p className="text-base leading-8 text-slate-600">
              The homepage now routes by what you are designing, not just by formula type.
              Jump directly into mechanical design, industrial structures, advanced systems,
              thermal/energy workflows, materials or manufacturing.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applicationCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
                    Open workflow
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Featured workflows</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                High-value calculators for current engineering work.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
            >
              View full catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredWorkflows.map((module) => {
              const ModuleIcon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.route}
                  className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 to-cyan-700 text-white">
                    {ModuleIcon ? <ModuleIcon className="h-5 w-5" /> : <CircleDot className="h-5 w-5" />}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition group-hover:text-slate-950">
                    <span>Open tool</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Full catalog</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Browse by engineering discipline.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Each category opens into focused calculators with unit handling, standards context,
              assumptions and exportable results.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryRoute = getCategoryRoute(category);
              return (
                <Link
                  key={category.id}
                  href={categoryRoute}
                  className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold text-slate-950">{category.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
                  <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    {category.modules.length} tools
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition group-hover:text-slate-950">
                    <span>Explore {category.title.split(" ")[0]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-cyan-300">Why PhyCalcPro</p>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                From quick checks to defensible engineering summaries.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Use PhyCalcPro when you need more than a formula box: assumptions,
                reference metadata, warnings, units and report-ready outputs stay with the calculation.
              </p>
            </div>

            <div className="grid gap-4">
              {platformPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{pillar.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{pillar.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="rounded-[1.5rem] border border-cyan-400/30 bg-cyan-400/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-white">Ready to explore the new modules?</h3>
                    <p className="mt-2 text-sm text-cyan-100">
                      Start with vacuum pump-down, cryogenic heat leak, coil field or battery thermal screening.
                    </p>
                  </div>
                  <Link
                    href="/products/advanced-systems/vacuum-engineering"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
                  >
                    Open Advanced Systems
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

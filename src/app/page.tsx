"use client";

import Link from "next/link";
import { categories, featuredModules } from "@/data/modules";
import EngineeringPlot from "@/components/EngineeringPlot";
import HeroSchematic from "@/components/HeroSchematic";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  BarChart3,
  CircleDot,
} from "lucide-react";

const demoX = Array.from({ length: 21 }, (_, index) => index * 0.2);
const demoY = demoX.map((value) => Math.sin(value * 1.3) * 0.15 - 0.1 * value + 0.12);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-800 to-transparent opacity-10 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                <BarChart3 className="h-4 w-4 text-slate-900" />
                Precision engineering, redefined
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Advanced engineering tools</p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Your engineering calculations, visualized with modern professionalism.
                  </h1>
                </div>

                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  PhyCalcPro helps structural, mechanical and manufacturing engineers make fast, accurate decisions with clean results, interactive schematics, and curated calculation workflows.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3 text-slate-900">
                      <Layers className="mt-1 h-5 w-5 text-slate-900" />
                      <div>
                        <div className="font-semibold">Modular toolset</div>
                        <p className="mt-2 text-sm text-slate-600">Switch between beams, shafts, fasteners and profiles in one unified workspace.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3 text-slate-900">
                      <ShieldCheck className="mt-1 h-5 w-5 text-slate-900" />
                      <div>
                        <div className="font-semibold">Professional outputs</div>
                        <p className="mt-2 text-sm text-slate-600">Generate clean, annotated results that are easy to review and share.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Explore tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <HeroSchematic />
              <EngineeringPlot title="Deflection profile" x={demoX} y={demoY} yLabel="Deflection (mm)" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick access</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Jump straight to the tools you need.</h2>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600 shadow-sm">
              Access product pages directly from the home experience.
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredModules.slice(0, 6).map((module) => {
              const ModuleIcon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.route}
                  className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
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
          <div className="grid gap-8 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const categoryRoute = category.modules[0]?.route ?? "/products";
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

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Designed for engineers</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Better detail, better decisions.</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                PhyCalcPro brings you a modern engineering workspace with clear visuals, schematic-first design, and results that engineers can rely on.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 text-slate-950">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CircleDot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Accurate finite element results</h3>
                  <p className="mt-2 text-sm text-slate-600">From beams to shafts, your calculations are backed by mesh-aware analysis and clean result interpretation.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">Interactive schematics for faster concept validation.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">Professional report-ready results with well-defined metrics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

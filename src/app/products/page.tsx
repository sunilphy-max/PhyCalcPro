"use client";

import Link from "next/link";
import { categories } from "@/data/modules";
import HeroSchematic from "@/components/HeroSchematic";
import { ArrowRight, Calculator, Layers, BarChart3 } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.06),_transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-100 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
                <BarChart3 className="h-4 w-4 text-cyan-500" />
                High-performance engineering products
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product library</p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Explore premium engineering modules with immersive visual context.
                  </h1>
                </div>

                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  Browse calculation workflows, design tools, and interactive schematics designed to match the clean feel of the homepage.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Layers className="mt-1 h-5 w-5 text-cyan-500" />
                      <div>
                        <div className="font-semibold text-slate-950">Complete module catalog</div>
                        <p className="mt-2 text-sm text-slate-500">Find structural, machine, pressure, and manufacturing tools in one unified interface.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Calculator className="mt-1 h-5 w-5 text-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-950">Modern engineering visuals</div>
                        <p className="mt-2 text-sm text-slate-500">Preview modules with elegant hero imagery, soft depth, and informative foreground cards.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400">
                  Browse modules
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/documentation" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300">
                  See docs
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 top-10 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -left-10 bottom-6 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-xl">
                <div className="mb-4 overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-sm">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <HeroSchematic />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-950">Featured workflows</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Accelerate model setup with the same premium visual language used across the homepage.
                  </p>
                  <div className="mt-6 grid gap-3">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Structural beam, shaft, and fastener design in a cohesive module library.</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Industry-ready checks, material selection, and result summaries with clarity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Explore by category</p>
            <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">High-end modules for every engineering discipline.</h2>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              Every product page now uses richer background layers, clean foreground cards, and premium spacing for a unified experience.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-slate-900 text-white shadow-lg shadow-cyan-200/50">
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-950">{category.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 transition group-hover:text-cyan-600">
                    View tools
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
